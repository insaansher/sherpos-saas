package handlers

import (
	"database/sql"

	"github.com/gin-gonic/gin"
	"github.com/insaansher/sherpos/backend/db"
)

// AdminListTenants lists all tenants (for super admin)
func AdminListTenants(c *gin.Context) {
	rows, err := db.DB.Query(`
		SELECT t.id, t.name, t.slug, t.status, t.onboarding_completed, t.created_at, 
		       ts.status as subscription_status, ts.current_period_end,
               p.name as plan_name,
               (SELECT email FROM users WHERE tenant_id = t.id AND role = 'owner' LIMIT 1) as owner_email
		FROM tenants t
		LEFT JOIN tenant_subscriptions ts ON t.id = ts.tenant_id
        LEFT JOIN plans p ON ts.plan_id = p.id
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
		CurrentPeriodEnd    *string `json:"renews_at"` // Map to renews_at for frontend
		PlanName            *string `json:"plan"`      // Map to plan
		OwnerEmail          *string `json:"email"`     // Map to email
	}

	var tenants []TenantListItem
	for rows.Next() {
		var t TenantListItem
		err := rows.Scan(&t.ID, &t.Name, &t.Slug, &t.Status, &t.OnboardingCompleted, &t.CreatedAt,
			&t.SubscriptionStatus, &t.CurrentPeriodEnd, &t.PlanName, &t.OwnerEmail)
		if err != nil {
			continue
		}
		// Handle null email/plan
		if t.OwnerEmail == nil {
			s := ""
			t.OwnerEmail = &s
		}
		if t.PlanName == nil {
			s := "Free"
			t.PlanName = &s
		}

		tenants = append(tenants, t)
	}

	if tenants == nil {
		tenants = []TenantListItem{}
	}

	c.JSON(200, tenants)
}

// AdminGetTenant fetches a single tenant with detailed stats
func AdminGetTenant(c *gin.Context) {
	id := c.Param("id")

	// 1. Fetch Tenant Basic Info
	var t struct {
		ID                  string  `json:"id"`
		Name                string  `json:"name"`
		Slug                string  `json:"slug"`
		Status              string  `json:"status"`
		Email               string  `json:"email"` // Primary Owner Email (mock logic or fetch from users)
		OnboardingCompleted bool    `json:"onboarding_completed"`
		CreatedAt           string  `json:"created_at"`
		RenewsAt            *string `json:"renews_at"`
		PlanName            *string `json:"plan"`
	}

	err := db.DB.QueryRow(`
		SELECT t.id, t.name, t.slug, t.status, t.onboarding_completed, t.created_at,
		       ts.current_period_end, p.name as plan_name
		FROM tenants t
		LEFT JOIN tenant_subscriptions ts ON t.id = ts.tenant_id
		LEFT JOIN plans p ON ts.plan_id = p.id
		WHERE t.id = $1
	`, id).Scan(&t.ID, &t.Name, &t.Slug, &t.Status, &t.OnboardingCompleted, &t.CreatedAt, &t.RenewsAt, &t.PlanName)

	if err == sql.ErrNoRows {
		c.JSON(404, gin.H{"error": "Tenant not found"})
		return
	} else if err != nil {
		c.JSON(500, gin.H{"error": "Database error fetching tenant"})
		return
	}

	// 2. Fetch Owner Email (First user with role owner)
	var email string
	_ = db.DB.QueryRow("SELECT email FROM users WHERE tenant_id = $1 AND role = 'owner' LIMIT 1", id).Scan(&email)
	t.Email = email

	// 3. Stats
	var stats struct {
		Revenue  float64 `json:"revenue"`
		Orders   int     `json:"orders"`
		Users    int     `json:"users"`
		Branches int     `json:"branches"`
	}

	db.DB.QueryRow("SELECT COALESCE(SUM(final_amount), 0), COUNT(*) FROM sales WHERE tenant_id = $1", id).Scan(&stats.Revenue, &stats.Orders)
	db.DB.QueryRow("SELECT COUNT(*) FROM users WHERE tenant_id = $1", id).Scan(&stats.Users)

	// Mock branches count since we might not have branch table yet (assuming 1 if no table)
	stats.Branches = 1

	c.JSON(200, gin.H{
		"id":         t.ID,
		"name":       t.Name,
		"email":      t.Email,
		"status":     t.Status,
		"plan":       t.PlanName,
		"created_at": t.CreatedAt,
		"renews_at":  t.RenewsAt,
		"stats":      stats,
	})
}
