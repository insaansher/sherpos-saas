package handlers

import (
	"database/sql"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/insaansher/sherpos/backend/db"
	"github.com/insaansher/sherpos/backend/models"
	"github.com/insaansher/sherpos/backend/utils"
)

func Register(c *gin.Context) {
	var req models.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	tx, err := db.DB.Begin()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	defer tx.Rollback()

	// Slug: lower-kebab-case
	slug := strings.ToLower(strings.ReplaceAll(req.BusinessName, " ", "-"))
	var tenantID string
	err = tx.QueryRow(`
		INSERT INTO tenants (name, slug, status, onboarding_completed, timezone, currency)
		VALUES ($1, $2, 'trialing', false, $3, $4)
		RETURNING id`,
		req.BusinessName, slug, req.Timezone, req.Currency).Scan(&tenantID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create tenant: " + err.Error()})
		return
	}

	hashedPassword, _ := utils.HashPassword(req.Password)
	var userID string
	// Defaults to 'owner' role
	err = tx.QueryRow(`
		INSERT INTO users (tenant_id, email, password_hash, full_name, role)
		VALUES ($1, $2, $3, 'Owner', 'owner')
		RETURNING id`,
		tenantID, req.Email, hashedPassword).Scan(&userID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	if err := tx.Commit(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Transaction commit failed"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Registration successful"})
}

func Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	var tenantID sql.NullString

	err := db.DB.QueryRow(`SELECT id, tenant_id, email, password_hash, role, full_name FROM users WHERE email=$1`, req.Email).
		Scan(&user.ID, &tenantID, &user.Email, &user.PasswordHash, &user.Role, &user.FullName)

	if err == sql.ErrNoRows || !utils.CheckPasswordHash(req.Password, user.PasswordHash) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	tID := ""
	if tenantID.Valid {
		tID = tenantID.String
	}

	token, err := utils.GenerateToken(user.ID, tID, user.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.SetCookie("auth_token", token, 3600*24, "/", "localhost", false, true)
	c.SetCookie("csrf_token", "test-csrf-token-"+user.ID, 3600*24, "/", "localhost", false, false)

	// Return the fresh data so frontend can redirect immediately
	// Tenant might be null if platform_admin

	// Construct response
	resp := gin.H{
		"message": "Login successful",
		"user": map[string]interface{}{
			"id":        user.ID,
			"email":     user.Email,
			"full_name": user.FullName,
			"role":      user.Role,
		},
	}

	if tID != "" {
		resp["tenant_id"] = tID
	} else {
		resp["tenant_id"] = nil
	}

	c.JSON(http.StatusOK, resp)
}

func Logout(c *gin.Context) {
	c.SetCookie("auth_token", "", -1, "/", "localhost", false, true)
	c.SetCookie("csrf_token", "", -1, "/", "localhost", false, false)
	c.JSON(http.StatusOK, gin.H{"message": "Logged out"})
}

func Me(c *gin.Context) {
	userID := c.GetString("userID")

	var user models.User
	// Reuse User struct but handle nullable tenant_id

	// Fetch user details again or trust context claims? DB is safer for "Me" to show latest state.
	var tID sql.NullString
	err := db.DB.QueryRow(`SELECT id, tenant_id, email, full_name, role FROM users WHERE id=$1`, userID).
		Scan(&user.ID, &tID, &user.Email, &user.FullName, &user.Role)

	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	// Platform Admin Case
	if !tID.Valid {
		c.JSON(http.StatusOK, gin.H{
			"user":   user,
			"tenant": nil,
		})
		return
	}

	// Tenant User Case
	var tenant models.Tenant
	err = db.DB.QueryRow(`SELECT id, name, status, onboarding_completed, timezone, currency FROM tenants WHERE id=$1`, tID.String).
		Scan(&tenant.ID, &tenant.Name, &tenant.Status, &tenant.OnboardingCompleted, &tenant.Timezone, &tenant.Currency)

	if err != nil {
		// Handle deleted tenant?
		c.JSON(http.StatusOK, gin.H{
			"user":   user,
			"tenant": nil, // or error
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"user":   user,
		"tenant": tenant,
	})
}
