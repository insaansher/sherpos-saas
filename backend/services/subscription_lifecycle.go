package services

import (
	"database/sql"
	"fmt"
	"log"
	"time"

	"github.com/insaansher/sherpos/backend/db"
)

const (
	RenewalWindowDays = 7
	GracePenaltyDays  = 7
	ReadOnlyDays      = 7
	LateFeeUSD        = 5.00
	LateFeeLKR        = 1500.00
)

type SubscriptionStatus string

const (
	StatusTrialing      SubscriptionStatus = "trialing"
	StatusActive        SubscriptionStatus = "active"
	StatusRenewalWindow SubscriptionStatus = "renewal_window"
	StatusGracePenalty  SubscriptionStatus = "grace_penalty"
	StatusReadOnly      SubscriptionStatus = "read_only"
	StatusBlocked       SubscriptionStatus = "blocked"
)

type SubscriptionInfo struct {
	TenantID           string
	PlanID             string
	Currency           string
	Status             SubscriptionStatus
	CurrentPeriodStart time.Time
	CurrentPeriodEnd   time.Time
	RenewalWindowEndAt sql.NullTime
	GraceEndAt         sql.NullTime
	ReadOnlyEndAt      sql.NullTime
	BlockedAt          sql.NullTime
	LateFeeAmount      float64
	LastStatusChangeAt sql.NullTime
}

// ComputeCurrentStatus calculates the subscription status based on timeline
func ComputeCurrentStatus(sub *SubscriptionInfo, now time.Time) SubscriptionStatus {
	if sub.Status == StatusTrialing {
		return StatusTrialing
	}

	periodEnd := sub.CurrentPeriodEnd

	// Active until current_period_end
	if now.Before(periodEnd) || now.Equal(periodEnd) {
		return StatusActive
	}

	// +7 days: renewal_window
	renewalEnd := periodEnd.AddDate(0, 0, RenewalWindowDays)
	if now.Before(renewalEnd) {
		return StatusRenewalWindow
	}

	// +7 days: grace_penalty
	graceEnd := renewalEnd.AddDate(0, 0, GracePenaltyDays)
	if now.Before(graceEnd) {
		return StatusGracePenalty
	}

	// +7 days: read_only
	readOnlyEnd := graceEnd.AddDate(0, 0, ReadOnlyDays)
	if now.Before(readOnlyEnd) {
		return StatusReadOnly
	}

	// After that: blocked
	return StatusBlocked
}

// UpdateSubscriptionStatus transitions the status and records the event
func UpdateSubscriptionStatus(tenantID string, newStatus SubscriptionStatus, reason string) error {
	tx, err := db.DB.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Get current status
	var oldStatus string
	err = tx.QueryRow("SELECT status FROM tenant_subscriptions WHERE tenant_id=$1", tenantID).Scan(&oldStatus)
	if err != nil {
		return err
	}

	if oldStatus == string(newStatus) {
		return nil // No change
	}

	now := time.Now()

	// Update subscription status
	_, err = tx.Exec(`
		UPDATE tenant_subscriptions 
		SET status=$1, last_status_change_at=$2
		WHERE tenant_id=$3
	`, newStatus, now, tenantID)
	if err != nil {
		return err
	}

	// Record event
	_, err = tx.Exec(`
		INSERT INTO subscription_events (tenant_id, old_status, new_status, reason)
		VALUES ($1, $2, $3, $4)
	`, tenantID, oldStatus, newStatus, reason)
	if err != nil {
		return err
	}

	// Audit log
	_, err = tx.Exec(`
		INSERT INTO audit_logs (tenant_id, user_id, action, entity_type, details)
		VALUES ($1, NULL, 'subscription_status_change', 'subscription', $2)
	`, tenantID, fmt.Sprintf("%s -> %s: %s", oldStatus, newStatus, reason))
	if err != nil {
		return err
	}

	// Handle blocked status: schedule deletion
	if newStatus == StatusBlocked {
		blockedAt := now
		deleteAt := blockedAt.AddDate(0, 0, 90) // 90 days from blocked

		// Update blocked_at
		_, err = tx.Exec("UPDATE tenant_subscriptions SET blocked_at=$1 WHERE tenant_id=$2", blockedAt, tenantID)
		if err != nil {
			return err
		}

		// Insert or update deletion queue
		_, err = tx.Exec(`
			INSERT INTO deletion_queue (tenant_id, scheduled_delete_at, status)
			VALUES ($1, $2, 'scheduled')
			ON CONFLICT (tenant_id) 
			DO UPDATE SET scheduled_delete_at=$2, status='scheduled'
		`, tenantID, deleteAt)
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}

// GetSubscriptionInfo retrieves subscription details for a tenant
func GetSubscriptionInfo(tenantID string) (*SubscriptionInfo, error) {
	var sub SubscriptionInfo
	err := db.DB.QueryRow(`
		SELECT tenant_id, plan_id, currency, status, current_period_start, current_period_end,
		       renewal_window_end_at, grace_end_at, read_only_end_at, blocked_at, 
		       late_fee_amount, last_status_change_at
		FROM tenant_subscriptions
		WHERE tenant_id=$1
	`, tenantID).Scan(
		&sub.TenantID, &sub.PlanID, &sub.Currency, &sub.Status,
		&sub.CurrentPeriodStart, &sub.CurrentPeriodEnd,
		&sub.RenewalWindowEndAt, &sub.GraceEndAt, &sub.ReadOnlyEndAt,
		&sub.BlockedAt, &sub.LateFeeAmount, &sub.LastStatusChangeAt,
	)
	if err != nil {
		return nil, err
	}
	return &sub, nil
}

// ProcessAllSubscriptions checks and updates all tenant subscription statuses
func ProcessAllSubscriptions() error {
	rows, err := db.DB.Query(`
		SELECT tenant_id, plan_id, currency, status, current_period_start, current_period_end,
		       renewal_window_end_at, grace_end_at, read_only_end_at, blocked_at,
		       late_fee_amount, last_status_change_at
		FROM tenant_subscriptions
		WHERE status != 'blocked'
	`)
	if err != nil {
		return err
	}
	defer rows.Close()

	now := time.Now()
	count := 0

	for rows.Next() {
		var sub SubscriptionInfo
		err := rows.Scan(
			&sub.TenantID, &sub.PlanID, &sub.Currency, &sub.Status,
			&sub.CurrentPeriodStart, &sub.CurrentPeriodEnd,
			&sub.RenewalWindowEndAt, &sub.GraceEndAt, &sub.ReadOnlyEndAt,
			&sub.BlockedAt, &sub.LateFeeAmount, &sub.LastStatusChangeAt,
		)
		if err != nil {
			log.Printf("Error scanning subscription: %v", err)
			continue
		}

		computedStatus := ComputeCurrentStatus(&sub, now)
		if computedStatus != sub.Status {
			reason := fmt.Sprintf("Automatic transition based on timeline (period ended: %s)", sub.CurrentPeriodEnd.Format("2006-01-02"))

			// Apply late fee when entering grace_penalty
			if computedStatus == StatusGracePenalty {
				lateFee := LateFeeUSD
				if sub.Currency == "LKR" {
					lateFee = LateFeeLKR
				}
				db.DB.Exec("UPDATE tenant_subscriptions SET late_fee_amount=$1 WHERE tenant_id=$2", lateFee, sub.TenantID)
			}

			err = UpdateSubscriptionStatus(sub.TenantID, computedStatus, reason)
			if err != nil {
				log.Printf("Error updating subscription status for tenant %s: %v", sub.TenantID, err)
			} else {
				count++
				log.Printf("Updated tenant %s: %s -> %s", sub.TenantID, sub.Status, computedStatus)
			}
		}
	}

	if count > 0 {
		log.Printf("Processed %d subscription status transitions", count)
	}

	return nil
}
