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
	db.SeedPlans()
	db.SeedDemoData() // New Seed call

	r := gin.Default()

	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:3000"}
	config.AllowCredentials = true
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization", "X-CSRF-Token", "X-Request-ID"}
	r.Use(cors.New(config))

	r.Use(middleware.RequestID())
	r.Use(middleware.Logger())

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "up", "db": db.Status()})
	})

	v1 := r.Group("/api/v1")
	v1.GET("/public/plans", handlers.PublicPlans)

	auth := v1.Group("/auth")
	{
		auth.POST("/register", handlers.Register)
		auth.POST("/login", handlers.Login)
		auth.POST("/logout", handlers.Logout)
	}

	api := v1.Group("/")
	api.Use(middleware.Auth())
	api.Use(middleware.CSRF())
	{
		api.GET("/me", handlers.Me)

		tenantRoutes := api.Group("/")
		tenantRoutes.Use(middleware.RequireTenantUser())
		{
			// ... existing billing/onboarding ...
			billing := tenantRoutes.Group("/billing")
			billing.Use(middleware.RequireRole("owner"))
			{
				billing.GET("/current", handlers.TenantBillingInfo)
				billing.POST("/choose-plan", handlers.ChoosePlan)
			}
			onboarding := tenantRoutes.Group("/onboarding")
			onboarding.Use(middleware.RequireRole("owner", "manager"))
			{
				onboarding.GET("/status", handlers.OnboardingStatus)
				onboarding.POST("/complete", handlers.CompleteOnboarding)
			}

			// POS ROUTES (Phase 4)
			pos := tenantRoutes.Group("/pos")
			pos.Use(middleware.EnsureOnboarding())
			pos.Use(middleware.RequireRole("owner", "manager", "cashier"))
			{
				pos.GET("/ping", func(c *gin.Context) { c.JSON(200, gin.H{"message": "POS Ready"}) })
				pos.GET("/products", handlers.GetPOSProducts)
				pos.POST("/sales", handlers.CreateSale)
				pos.GET("/sales/:id", handlers.GetSale)
			}
		}

		admin := api.Group("/admin")
		admin.Use(middleware.RequirePlatformAdmin())
		{
			// ... admin routes ...
			admin.GET("/dashboard", handlers.AdminDashboard)
			admin.GET("/plans", handlers.AdminListPlans)
			admin.POST("/plans", handlers.AdminCreatePlan)
			admin.PUT("/plans/:id", handlers.AdminUpdatePlanMeta)
			admin.PUT("/plans/:id/visibility", handlers.AdminUpdatePlanVisibility)
			admin.PUT("/plans/:id/prices", handlers.AdminUpdatePlanPrices)
			admin.PUT("/plans/:id/limits", handlers.AdminUpdatePlanLimits)
			admin.PUT("/plans/:id/features", handlers.AdminUpdatePlanFeatures)
			admin.POST("/plans/:id/clone", handlers.AdminClonePlan)
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
