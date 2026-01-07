package workers

import (
	"log"
	"os"
	"strconv"
	"time"

	"github.com/insaansher/sherpos/backend/db"
)

// StartDeletionWorker runs a periodic job to delete expired tenants
func StartDeletionWorker() {
	// Get buffer days from env (default 0 for local dev)
	bufferDays := 0
	if envBuffer := os.Getenv("DELETE_BUFFER_DAYS"); envBuffer != "" {
		if val, err := strconv.Atoi(envBuffer); err == nil {
			bufferDays = val
		}
	}

	log.Printf("Deletion worker started (buffer: %d days)", bufferDays)

	ticker := time.NewTicker(1 * time.Minute) // Run every minute for local dev
	defer ticker.Stop()

	for range ticker.C {
		processDeletions(bufferDays)
	}
}

func processDeletions(bufferDays int) {
	now := time.Now()

	rows, err := db.DB.Query(`
		SELECT tenant_id, scheduled_delete_at 
		FROM deletion_queue 
		WHERE status='scheduled' AND scheduled_delete_at <= $1
	`, now)
	if err != nil {
		log.Printf("Error querying deletion queue: %v", err)
		return
	}
	defer rows.Close()

	count := 0
	for rows.Next() {
		var tenantID string
		var scheduledDeleteAt time.Time
		if err := rows.Scan(&tenantID, &scheduledDeleteAt); err != nil {
			log.Printf("Error scanning deletion row: %v", err)
			continue
		}

		// Apply buffer
		effectiveDeleteAt := scheduledDeleteAt.AddDate(0, 0, bufferDays)
		if now.Before(effectiveDeleteAt) {
			continue
		}

		if err := deleteTenant(tenantID); err != nil {
			log.Printf("Failed to delete tenant %s: %v", tenantID, err)
		} else {
			count++
			log.Printf("Successfully deleted tenant %s", tenantID)
		}
	}

	if count > 0 {
		log.Printf("Deletion worker processed %d tenant deletions", count)
	}
}

func deleteTenant(tenantID string) error {
	tx, err := db.DB.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Mark deletion as processing
	_, err = tx.Exec("UPDATE deletion_queue SET status='processing' WHERE tenant_id=$1", tenantID)
	if err != nil {
		return err
	}

	// Log before deletion
	_, err = tx.Exec(`
		INSERT INTO audit_logs (tenant_id, user_id, action, entity_type, details)
		VALUES ($1, NULL, 'tenant_deleted', 'tenant', 'Automatic deletion after 90-day grace period')
	`, tenantID)
	if err != nil {
		return err
	}

	// Delete all tenant-scoped data (CASCADE will handle most)
	tables := []string{
		"subscription_events",
		"deletion_queue",
		"tenant_subscriptions",
		"refresh_tokens",
		"pos_devices",
		"audit_logs",
		"offline_sync_map",
		"sale_return_items",
		"sale_returns",
		"purchase_return_items",
		"purchase_returns",
		"adjustment_items",
		"adjustments",
		"stock_ledger",
		"purchase_items",
		"purchases",
		"suppliers",
		"sale_items",
		"sales",
		"inventory_stock",
		"product_variants",
		"products",
		"users",
	}

	for _, table := range tables {
		_, err = tx.Exec("DELETE FROM "+table+" WHERE tenant_id=$1", tenantID)
		if err != nil {
			log.Printf("Error deleting from %s for tenant %s: %v", table, tenantID, err)
			// Continue anyway
		}
	}

	// Finally, delete the tenant itself
	_, err = tx.Exec("DELETE FROM tenants WHERE id=$1", tenantID)
	if err != nil {
		return err
	}

	return tx.Commit()
}
