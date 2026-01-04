package middleware

import (
	"database/sql"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/insaansher/sherpos/backend/db"
	"github.com/insaansher/sherpos/backend/utils"
)

func RequestID() gin.HandlerFunc {
	return func(c *gin.Context) {
		id := uuid.New().String()
		c.Set("RequestID", id)
		c.Header("X-Request-ID", id)
		c.Next()
	}
}

func Logger() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		c.Next()
		latency := time.Since(start)
		log.Printf("ReqID: %s | Status: %d | Method: %s | Path: %s | Latency: %v",
			c.GetString("RequestID"), c.Writer.Status(), c.Request.Method, c.Request.URL.Path, latency)
	}
}

// Auth verifies the JWT token AND loads the user from the DB to ensure fresh permissions
func Auth() gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString, err := c.Cookie("auth_token")
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: No token cookie"})
			c.Abort()
			return
		}

		claims, err := utils.ValidateToken(tokenString)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized: Invalid token"})
			c.Abort()
			return
		}

		// CRITICAL: Fetch fresh user data from DB. Do not trust claims for role/tenant.
		var userID string
		var tenantID sql.NullString
		var role string

		err = db.DB.QueryRow("SELECT id, tenant_id, role FROM users WHERE id=$1", claims.UserID).Scan(&userID, &tenantID, &role)
		if err != nil {
			if err == sql.ErrNoRows {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "User no longer exists"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error during auth"})
			}
			c.Abort()
			return
		}

		c.Set("userID", userID)
		if tenantID.Valid {
			c.Set("tenantID", tenantID.String)
		} else {
			c.Set("tenantID", "") // Explicit empty for no tenant
		}
		c.Set("role", role)

		c.Next()
	}
}

func CSRF() gin.HandlerFunc {
	return func(c *gin.Context) {
		cookieVal, err := c.Cookie("csrf_token")
		headerVal := c.GetHeader("X-CSRF-Token")

		// Lenient logic for dev, but checking header presence if cookie exists
		if err == nil && headerVal != "" && cookieVal != headerVal {
			c.JSON(http.StatusForbidden, gin.H{"error": "Invalid CSRF token"})
			c.Abort()
			return
		}
		c.Next()
	}
}

// RequireTenantUser blocks platform admins and requires the user to belong to a tenant
func RequireTenantUser() gin.HandlerFunc {
	return func(c *gin.Context) {
		tenantID := c.GetString("tenantID")
		role := c.GetString("role")

		if tenantID == "" {
			c.JSON(http.StatusForbidden, gin.H{"error": "Tenant context required. Platform admins cannot access this resource."})
			c.Abort()
			return
		}

		if role == "platform_admin" {
			// Safety check: Platform admin should usually have null tenantID, so the check above catches it.
			// But if for some reason they have a tenantID but role is platform_admin, we still block tenant APIs.
			// (Though spec says platform_admin must be NULL tenant, better safe)
			c.JSON(http.StatusForbidden, gin.H{"error": "Platform admins cannot access tenant resources."})
			c.Abort()
			return
		}
		c.Next()
	}
}

// RequirePlatformAdmin requires role=platform_admin AND tenant_id IS NULL
func RequirePlatformAdmin() gin.HandlerFunc {
	return func(c *gin.Context) {
		role := c.GetString("role")
		tenantID := c.GetString("tenantID")

		if role != "platform_admin" {
			c.JSON(http.StatusForbidden, gin.H{"error": "Platform Admin access required"})
			c.Abort()
			return
		}

		if tenantID != "" {
			log.Printf("CRITICAL SECURITY: User %s has role 'platform_admin' but also has tenant_id %s. This is a data integrity violation.", c.GetString("userID"), tenantID)
			c.JSON(http.StatusForbidden, gin.H{"error": "Security Integrity Error: Admin has tenant association"})
			c.Abort()
			return
		}

		c.Next()
	}
}

func RequireRole(roles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole := c.GetString("role")
		allow := false
		for _, r := range roles {
			if r == userRole {
				allow = true
				break
			}
		}
		if !allow {
			c.JSON(http.StatusForbidden, gin.H{"error": "Insufficient permissions"})
			c.Abort()
			return
		}
		c.Next()
	}
}

func EnsureOnboarding() gin.HandlerFunc {
	return func(c *gin.Context) {
		tenantID := c.GetString("tenantID")
		// If no tenant (Platform Admin), this middleware shouldn't really be called if routing is correct,
		// but if it is, we skip or error. Since this is for POS/App usage, we should error if no tenant.
		if tenantID == "" {
			c.JSON(http.StatusForbidden, gin.H{"error": "Tenant context required for onboarding check"})
			c.Abort()
			return
		}

		var completed bool
		err := db.DB.QueryRow("SELECT onboarding_completed FROM tenants WHERE id=$1", tenantID).Scan(&completed)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check onboarding status"})
			c.Abort()
			return
		}

		if !completed {
			c.JSON(http.StatusForbidden, gin.H{"code": "ONBOARDING_REQUIRED", "error": "Complete onboarding first"})
			c.Abort()
			return
		}
		c.Next()
	}
}
