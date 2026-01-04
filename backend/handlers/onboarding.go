package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/insaansher/sherpos/backend/db"
	"github.com/insaansher/sherpos/backend/models"
)

func OnboardingStatus(c *gin.Context) {
	tenantID := c.GetString("tenantID")
	if tenantID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No tenant context"})
		return
	}

	var completed bool
	err := db.DB.QueryRow("SELECT onboarding_completed FROM tenants WHERE id=$1", tenantID).Scan(&completed)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"onboarding_completed": completed})
}

func CompleteOnboarding(c *gin.Context) {
	tenantID := c.GetString("tenantID")
	role := c.GetString("role")

	if role != "owner" && role != "manager" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only owners or managers can complete onboarding"})
		return
	}

	var req models.OnboardingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Update Tenant
	_, err := db.DB.Exec(`
        UPDATE tenants 
        SET invoice_prefix_default=$1, onboarding_completed=true 
        WHERE id=$2`,
		req.InvoicePrefixDefault, tenantID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update tenant"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Onboarding completed"})
}
