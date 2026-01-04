package main

import (
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/insaansher/sherpos/backend/db"
	"github.com/insaansher/sherpos/backend/handlers"
	"github.com/insaansher/sherpos/backend/middleware"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using defaults")
	}

	db.Connect()

	r := gin.Default()

	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:3000"}
	config.AllowCredentials = true
	config.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization", "X-CSRF-Token", "X-Request-ID"}
	r.Use(cors.New(config))

	r.Use(middleware.RequestID())
	r.Use(middleware.Logger())

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "up",
			"db":     db.Status(),
		})
	})

	v1 := r.Group("/api/v1")

	// Public
	auth := v1.Group("/auth")
	{
		auth.POST("/register", handlers.Register)
		auth.POST("/login", handlers.Login)
		auth.POST("/logout", handlers.Logout)
	}

	// Authenticated
	api := v1.Group("/")
	api.Use(middleware.Auth())
	api.Use(middleware.CSRF())
	{
		// Shared: returns different data based on role
		api.GET("/me", handlers.Me)

		// Tenant Routes (Blocked for Platform Admin)
		tenantRoutes := api.Group("/")
		tenantRoutes.Use(middleware.RequireTenantUser())
		{
			// Onboarding
			onboarding := tenantRoutes.Group("/onboarding")
			onboarding.Use(middleware.RequireRole("owner", "manager"))
			{
				onboarding.GET("/status", handlers.OnboardingStatus)
				onboarding.POST("/complete", handlers.CompleteOnboarding)
			}

			// POS
			pos := tenantRoutes.Group("/pos")
			pos.Use(middleware.EnsureOnboarding())
			pos.Use(middleware.RequireRole("owner", "manager", "cashier"))
			{
				pos.GET("/ping", func(c *gin.Context) { c.JSON(200, gin.H{"message": "POS Ready"}) })
			}
		}

		// Admin Routes (Blocked for Tenant Users)
		admin := api.Group("/admin")
		admin.Use(middleware.RequirePlatformAdmin())
		{
			admin.GET("/dashboard", handlers.AdminDashboard)
		}
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server running on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal(err)
	}
}
