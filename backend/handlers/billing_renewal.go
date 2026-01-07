package handlers

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/insaansher/sherpos/backend/db"
	"github.com/insaansher/sherpos/backend/models"
	"github.com/insaansher/sherpos/backend/services"
)

// RenewSubscription simulates payment and renews the subscription
func RenewSubscription(c *gin.Context) {
	tenantID := c.GetString("tenantID")
	userID := c.GetString("userID")

	var req struct {
		PlanID   string `json:"plan_id" binding:"required"`
		Currency string `json:"currency" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	tx, err := db.DB.Begin()
	if err != nil {
		c.JSON(500, gin.H{"error": "Transaction failed"})
		return
	}
	defer tx.Rollback()

	// Get plan details
	var plan models.Plan
	err = tx.QueryRow("SELECT id, code, name, duration_type FROM plans WHERE id=$1 AND is_active=true", req.PlanID).
		Scan(&plan.ID, &plan.Code, &plan.Name, &plan.DurationType)
	if err != nil {
		c.JSON(404, gin.H{"error": "Plan not found"})
		return
	}

	// Get current subscription
	var currentSub struct {
		Status           string
		LateFeeAmount    float64
		CurrentPeriodEnd sql.NullTime
	}
	err = tx.QueryRow("SELECT status, late_fee_amount, current_period_end FROM tenant_subscriptions WHERE tenant_id=$1", tenantID).
		Scan(&currentSub.Status, &currentSub.LateFeeAmount, &currentSub.CurrentPeriodEnd)
	if err != nil {
		c.JSON(404, gin.H{"error": "Subscription not found"})
		return
	}

	// Calculate new period
	now := time.Now()
	var newPeriodEnd time.Time

	switch plan.DurationType {
	case "monthly":
		newPeriodEnd = now.AddDate(0, 1, 0)
	case "quarterly":
		newPeriodEnd = now.AddDate(0, 3, 0)
	case "half_yearly":
		newPeriodEnd = now.AddDate(0, 6, 0)
	case "yearly":
		newPeriodEnd = now.AddDate(1, 0, 0)
	case "2y":
		newPeriodEnd = now.AddDate(2, 0, 0)
	default:
		newPeriodEnd = now.AddDate(0, 1, 0)
	}

	// Update subscription
	_, err = tx.Exec(`
		UPDATE tenant_subscriptions 
		SET plan_id=$1, 
		    currency=$2,
		    status='active',
		    current_period_start=$3,
		    current_period_end=$4,
		    late_fee_amount=0,
		    blocked_at=NULL,
		    last_status_change_at=$3
		WHERE tenant_id=$5
	`, req.PlanID, req.Currency, now, newPeriodEnd, tenantID)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to update subscription"})
		return
	}

	// Record event
	_, err = tx.Exec(`
		INSERT INTO subscription_events (tenant_id, old_status, new_status, reason)
		VALUES ($1, $2, 'active', $3)
	`, tenantID, currentSub.Status, "Manual renewal via billing page")
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to record event"})
		return
	}

	// Audit log
	lateFeeMsg := ""
	if currentSub.LateFeeAmount > 0 {
		lateFeeMsg = fmt.Sprintf(" (Late fee cleared: %.2f %s)", currentSub.LateFeeAmount, req.Currency)
	}
	_, err = tx.Exec(`
		INSERT INTO audit_logs (tenant_id, user_id, action, entity_type, details)
		VALUES ($1, $2, 'subscription_renewed', 'subscription', $3)
	`, tenantID, userID, fmt.Sprintf("Renewed to plan %s, period: %s - %s%s", plan.Name, now.Format("2006-01-02"), newPeriodEnd.Format("2006-01-02"), lateFeeMsg))
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to log audit"})
		return
	}

	// Clear deletion queue if exists
	tx.Exec("DELETE FROM deletion_queue WHERE tenant_id=$1", tenantID)

	if err = tx.Commit(); err != nil {
		c.JSON(500, gin.H{"error": "Failed to commit renewal"})
		return
	}

	c.JSON(200, gin.H{
		"message":          "Subscription renewed successfully",
		"plan":             plan.Name,
		"new_period_start": now,
		"new_period_end":   newPeriodEnd,
		"late_fee_cleared": currentSub.LateFeeAmount > 0,
		"late_fee_amount":  currentSub.LateFeeAmount,
	})
}

// GetCurrentBilling returns the current subscription details
func GetCurrentBilling(c *gin.Context) {
	tenantID := c.GetString("tenantID")

	sub, err := services.GetSubscriptionInfo(tenantID)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to get subscription"})
		return
	}

	// Compute real-time status
	status := services.ComputeCurrentStatus(sub, time.Now())

	// Get plan details
	var plan models.Plan
	err = db.DB.QueryRow("SELECT id, code, name, package_type, duration_type FROM plans WHERE id=$1", sub.PlanID).
		Scan(&plan.ID, &plan.Code, &plan.Name, &plan.PackageType, &plan.DurationType)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to get plan details"})
		return
	}

	// Calculate days remaining/overdue
	now := time.Now()
	daysUntilEnd := int(sub.CurrentPeriodEnd.Sub(now).Hours() / 24)

	c.JSON(200, gin.H{
		"status":               status,
		"plan":                 plan,
		"currency":             sub.Currency,
		"current_period_start": sub.CurrentPeriodStart,
		"current_period_end":   sub.CurrentPeriodEnd,
		"days_until_end":       daysUntilEnd,
		"late_fee_amount":      sub.LateFeeAmount,
		"has_late_fee":         sub.LateFeeAmount > 0,
	})
}
