package middleware

import (
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/insaansher/sherpos/backend/services"
)

// SubscriptionEnforcementMiddleware enforces subscription restrictions
func SubscriptionEnforcementMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Skip for:
		// - Public routes
		// - Auth routes
		// - Admin routes (handled separately)
		path := c.Request.URL.Path
		if strings.HasPrefix(path, "/api/v1/public") ||
			strings.HasPrefix(path, "/api/v1/auth") ||
			strings.HasPrefix(path, "/api/v1/admin") {
			c.Next()
			return
		}

		tenantID := c.GetString("tenantID")
		if tenantID == "" {
			c.Next() // No tenant context, skip
			return
		}

		// Get subscription info
		sub, err := services.GetSubscriptionInfo(tenantID)
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to check subscription status"})
			c.Abort()
			return
		}

		// Compute real-time status
		status := services.ComputeCurrentStatus(sub, time.Now())

		// Store status in context for handlers to use
		c.Set("subscriptionStatus", string(status))

		// Enforcement logic
		switch status {
		case services.StatusTrialing, services.StatusActive, services.StatusRenewalWindow, services.StatusGracePenalty:
			// Allow all operations
			c.Next()

		case services.StatusReadOnly:
			// Allow only GET requests and specific billing/export routes
			method := c.Request.Method
			if method == "GET" {
				c.Next()
				return
			}

			// Allow billing operations
			if strings.HasPrefix(path, "/api/v1/billing") {
				c.Next()
				return
			}

			// Block all state-changing operations
			c.JSON(403, gin.H{
				"error":  "Your subscription is in read-only mode. Please renew to continue making changes.",
				"status": "read_only",
				"code":   "SUBSCRIPTION_READ_ONLY",
			})
			c.Abort()

		case services.StatusBlocked:
			// Block everything except:
			// - GET /api/v1/billing/current
			// - GET /api/v1/billing/plans
			// - POST /api/v1/billing/renew
			// - GET /api/v1/export/*

			allowedRoutes := []string{
				"/api/v1/billing/current",
				"/api/v1/billing/plans",
			}

			for _, route := range allowedRoutes {
				if path == route && c.Request.Method == "GET" {
					c.Next()
					return
				}
			}

			if path == "/api/v1/billing/renew" && c.Request.Method == "POST" {
				c.Next()
				return
			}

			if strings.HasPrefix(path, "/api/v1/export/") && c.Request.Method == "GET" {
				c.Next()
				return
			}

			// Block everything else
			c.JSON(403, gin.H{
				"error":  "Your subscription is blocked. Please renew immediately to restore access.",
				"status": "blocked",
				"code":   "SUBSCRIPTION_BLOCKED",
			})
			c.Abort()

		default:
			c.Next()
		}
	}
}
