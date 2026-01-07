package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/insaansher/sherpos/backend/db"
)

// AdminListPlatformUsers lists users with no tenant_id (Super Admins/Staff)
func AdminListPlatformUsers(c *gin.Context) {
	rows, err := db.DB.Query(`
		SELECT id, full_name, email, role, created_at
		FROM users
		WHERE tenant_id IS NULL
		ORDER BY created_at DESC
	`)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to fetch platform users"})
		return
	}
	defer rows.Close()

	var users []gin.H
	for rows.Next() {
		var u struct {
			ID        string `json:"id"`
			FullName  string `json:"name"`
			Email     string `json:"email"`
			Role      string `json:"role"`
			CreatedAt string `json:"created_at"`
		}
		if err := rows.Scan(&u.ID, &u.FullName, &u.Email, &u.Role, &u.CreatedAt); err == nil {
			users = append(users, gin.H{
				"id":          u.ID,
				"name":        u.FullName,
				"email":       u.Email,
				"role":        u.Role,
				"status":      "active", // Mock status
				"last_active": "Now",
			})
		}
	}

	if users == nil {
		users = []gin.H{}
	}
	c.JSON(200, users)
}

// AdminGetDashboardStats returns high-level metrics
func AdminGetDashboardStats(c *gin.Context) {
	var stats struct {
		TotalTenants int     `json:"total_tenants"`
		Active       int     `json:"active_tenants"`
		Revenue      float64 `json:"revenue"`
		Issues       int     `json:"critical_issues"`
	}

	db.DB.QueryRow("SELECT COUNT(*) FROM tenants").Scan(&stats.TotalTenants)
	db.DB.QueryRow("SELECT COUNT(*) FROM tenants WHERE status = 'active'").Scan(&stats.Active)

	// Mock Revenue (Sum of all plan prices for active subscriptions)
	db.DB.QueryRow(`
		SELECT COALESCE(SUM(pp.amount), 0)
		FROM tenant_subscriptions ts
		JOIN plans p ON ts.plan_id = p.id
		JOIN plan_prices pp ON p.id = pp.plan_id
		WHERE ts.status = 'active' AND pp.currency = 'USD'
	`).Scan(&stats.Revenue)

	stats.Issues = 0 // Mock

	c.JSON(200, gin.H{
		"kpis": []gin.H{
			{"title": "Total Tenants", "value": stats.TotalTenants, "change": "+12% this month", "icon": "Users", "color": "text-blue-500"},
			{"title": "Monthly Revenue", "value": stats.Revenue, "change": "+8% this month", "icon": "DollarSign", "color": "text-green-500"},
			{"title": "Active Subs", "value": stats.Active, "change": "+5% this month", "icon": "CreditCard", "color": "text-purple-500"},
			{"title": "Critical Issues", "value": stats.Issues, "change": "-2 this week", "icon": "AlertTriangle", "color": "text-red-500"},
		},
		"activity": []gin.H{
			{"description": "New tenant registered: Cafe One", "time": "2 mins ago"},
			{"description": "System backup completed", "time": "1 hour ago"},
		},
	})
}

// AdminGetNotifications returns system alerts
func AdminGetNotifications(c *gin.Context) {
	// Mock
	c.JSON(200, []gin.H{})
}

// AdminGetDataGovernance returns data stats
func AdminGetDataGovernance(c *gin.Context) {
	var totalTenants int
	db.DB.QueryRow("SELECT COUNT(*) FROM tenants").Scan(&totalTenants)

	// Mock storage as 1.2GB per tenant
	storageUsed := "0.0 GB"
	if totalTenants > 0 {
		storageUsed = "2.4 TB" // Just a realistic mock for now
	}

	c.JSON(200, gin.H{
		"storage_used":      storageUsed,
		"pending_deletions": 0,
		"exports_24h":       12,
		"deletion_requests": []gin.H{
			{
				"tenant_name":  "Old Legacy Shop",
				"request_date": "2026-01-05",
				"deadline":     "2026-02-05",
				"status":       "Pending",
			},
		},
	})
}
