package db

import (
	"log"
)

// SeedPlans ensures default plans exist in the DB
func SeedPlans() {
	// Check if plans exist
	var count int
	err := DB.QueryRow("SELECT COUNT(*) FROM plans").Scan(&count)
	if err != nil {
		log.Printf("Seeding skipped: Plans table check failed (run schema migration?): %v", err)
		return
	}

	if count > 0 {
		log.Println("Seeding skipped: Plans already exist.")
		return
	}

	log.Println("Seeding default plans...")

	// --- Basic Monthly ---
	seedPlan("basic_monthly", "Basic Monthly", "basic", "monthly",
		29.00, 8500.00,
		PlanLimits{1, 2, 1},
		PlanFeatures{OfflinePos: true})

	// --- Basic Annual ---
	seedPlan("basic_annual", "Basic Annual", "basic", "annual",
		290.00, 85000.00,
		PlanLimits{1, 2, 1},
		PlanFeatures{OfflinePos: true})

	// --- Basic Lifetime ---
	seedPlan("basic_lifetime", "Basic Lifetime", "basic", "lifetime",
		999.00, 250000.00,
		PlanLimits{1, 2, 1},
		PlanFeatures{OfflinePos: true})

	// --- Advanced Monthly ---
	seedPlan("adv_monthly", "Advanced Monthly", "advanced", "monthly",
		79.00, 23000.00,
		PlanLimits{5, 10, 5},
		PlanFeatures{MultiBranch: true, StockTransfer: true, AdvancedReports: true,
			Manufacturing: true, RewardPoints: true, Quotations: true, DeliveryManagement: true, OfflinePos: true})

	// --- Advanced Annual ---
	seedPlan("adv_annual", "Advanced Annual", "advanced", "annual",
		790.00, 230000.00,
		PlanLimits{5, 10, 5},
		PlanFeatures{MultiBranch: true, StockTransfer: true, AdvancedReports: true,
			Manufacturing: true, RewardPoints: true, Quotations: true, DeliveryManagement: true, OfflinePos: true})

	// --- Advanced Growth (2Y) ---
	seedPlan("adv_growth", "Advanced Growth (2 Years)", "advanced", "2y",
		1400.00, 400000.00,
		PlanLimits{10, 20, 10},
		PlanFeatures{MultiBranch: true, StockTransfer: true, AdvancedReports: true,
			Manufacturing: true, RewardPoints: true, Quotations: true, DeliveryManagement: true, OfflinePos: true})

	log.Println("Seeding complete.")
}

type PlanLimits struct {
	Branch, User, Device int
}

type PlanFeatures struct {
	MultiBranch, StockTransfer, AdvancedReports, Manufacturing, RewardPoints, Quotations, DeliveryManagement, OfflinePos bool
}

func seedPlan(code, name, pkg, dur string, usd, lkr float64, limits PlanLimits, feats PlanFeatures) {
	var planID string
	err := DB.QueryRow(`
        INSERT INTO plans (code, name, package_type, duration_type, is_active, is_public)
        VALUES ($1, $2, $3, $4, true, true) RETURNING id`, code, name, pkg, dur).Scan(&planID)
	if err != nil {
		log.Printf("Failed to seed plan %s: %v", code, err)
		return
	}

	// Prices
	DB.Exec("INSERT INTO plan_prices (plan_id, currency, amount) VALUES ($1, 'USD', $2)", planID, usd)
	DB.Exec("INSERT INTO plan_prices (plan_id, currency, amount) VALUES ($1, 'LKR', $2)", planID, lkr)

	// Limits
	DB.Exec(`INSERT INTO plan_limits (plan_id, branch_limit, user_limit, pos_device_limit) 
             VALUES ($1, $2, $3, $4)`, planID, limits.Branch, limits.User, limits.Device)

	// Features
	DB.Exec(`INSERT INTO plan_features (plan_id, multi_branch, stock_transfer, advanced_reports, 
             manufacturing, reward_points, quotations, delivery_management, offline_pos)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
		planID, feats.MultiBranch, feats.StockTransfer, feats.AdvancedReports,
		feats.Manufacturing, feats.RewardPoints, feats.Quotations, feats.DeliveryManagement, feats.OfflinePos)
}
