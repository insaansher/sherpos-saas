package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/insaansher/sherpos/backend/db"
	"github.com/insaansher/sherpos/backend/services"
)

// AdminSetSubscriptionStatus allows platform admin to manually set tenant subscription status
func AdminSetSubscriptionStatus(c *gin.Context) {
	tenantID := c.Param("id")
	adminUserID := c.GetString("userID")

	var req struct {
		Status string `json:"status" binding:"required"`
		Reason string `json:"reason"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	// Validate status
	validStatuses := map[string]bool{
		"trialing":       true,
		"active":         true,
		"renewal_window": true,
		"grace_penalty":  true,
		"read_only":      true,
		"blocked":        true,
	}

	if !validStatuses[req.Status] {
		c.JSON(400, gin.H{"error": "Invalid status"})
		return
	}

	// Update status
	reason := req.Reason
	if reason == "" {
		reason = "Manual override by platform admin"
	} else {
		reason = "Admin override: " + reason
	}

	err := services.UpdateSubscriptionStatus(tenantID, services.SubscriptionStatus(req.Status), reason)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to update status: " + err.Error()})
		return
	}

	// Additional audit log for admin action
	db.DB.Exec(`
		INSERT INTO audit_logs (tenant_id, user_id, action, entity_type, details)
		VALUES ($1, $2, 'admin_subscription_override', 'subscription', $3)
	`, tenantID, adminUserID, "Status set to: "+req.Status+" - "+reason)

	c.JSON(200, gin.H{
		"message": "Subscription status updated",
		"status":  req.Status,
	})
}
