package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/insaansher/sherpos/backend/db"
)

// AdminListTenants lists all tenants (for super admin)
func AdminListTenants(c *gin.Context) {
	rows, err := db.DB.Query(`
		SELECT t.id, t.name, t.slug, t.status, t.onboarding_completed, t.created_at, 
		       ts.status as subscription_status, ts.current_period_end
		FROM tenants t
		LEFT JOIN tenant_subscriptions ts ON t.id = ts.tenant_id
		ORDER BY t.created_at DESC
	`)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to fetch tenants"})
		return
	}
	defer rows.Close()

	type TenantListItem struct {
		ID                  string  `json:"id"`
		Name                string  `json:"name"`
		Slug                string  `json:"slug"`
		Status              string  `json:"status"`
		OnboardingCompleted bool    `json:"onboarding_completed"`
		CreatedAt           string  `json:"created_at"`
		SubscriptionStatus  *string `json:"subscription_status"`
		CurrentPeriodEnd    *string `json:"current_period_end"`
	}

	var tenants []TenantListItem
	for rows.Next() {
		var t TenantListItem
		err := rows.Scan(&t.ID, &t.Name, &t.Slug, &t.Status, &t.OnboardingCompleted, &t.CreatedAt,
			&t.SubscriptionStatus, &t.CurrentPeriodEnd)
		if err != nil {
			continue
		}
		tenants = append(tenants, t)
	}

	c.JSON(200, tenants)
}
