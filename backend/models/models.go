package models

import (
	"database/sql"
	"time"
)

// --- Auth & User Models --- (as corrected previously)

type Tenant struct {
	ID                   string    `json:"id"`
	Name                 string    `json:"name"`
	Slug                 string    `json:"slug"`
	Status               string    `json:"status"`
	OnboardingCompleted  bool      `json:"onboarding_completed"`
	Timezone             string    `json:"timezone"`
	Currency             string    `json:"currency"`
	InvoicePrefixDefault string    `json:"invoice_prefix_default"`
	CreatedAt            time.Time `json:"created_at"`
	UpdatedAt            time.Time `json:"updated_at"`
}

type User struct {
	ID           string         `json:"id"`
	TenantID     sql.NullString `json:"tenant_id"`
	Email        string         `json:"email"`
	PasswordHash string         `json:"-"`
	FullName     string         `json:"full_name"`
	Role         string         `json:"role"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
}

type RegisterRequest struct {
	BusinessName string `json:"business_name" binding:"required"`
	Email        string `json:"email" binding:"required,email"`
	Password     string `json:"password" binding:"required,min=8"`
	Timezone     string `json:"timezone" binding:"required"`
	Currency     string `json:"currency" binding:"required"`
	Phone        string `json:"phone"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type OnboardingRequest struct {
	InvoicePrefixDefault string `json:"invoice_prefix_default" binding:"required"`
	Confirmed            bool   `json:"confirmed" binding:"required"`
}

// --- Plans & Billing Models ---

type Plan struct {
	ID           string    `json:"id"`
	Code         string    `json:"code"`
	Name         string    `json:"name"`
	PackageType  string    `json:"package_type"`  // basic, advanced
	DurationType string    `json:"duration_type"` // monthly, annual, 4y...
	IsActive     bool      `json:"is_active"`
	IsPublic     bool      `json:"is_public"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`

	Prices   []PlanPrice  `json:"prices,omitempty"`
	Limits   PlanLimits   `json:"limits,omitempty"`
	Features PlanFeatures `json:"features,omitempty"`
}

type PlanPrice struct {
	Currency string  `json:"currency" binding:"required"`
	Amount   float64 `json:"amount" binding:"required"`
	SetupFee float64 `json:"setup_fee"`
}

type PlanLimits struct {
	BranchLimit    int `json:"branch_limit"`
	UserLimit      int `json:"user_limit"`
	PosDeviceLimit int `json:"pos_device_limit"`
}

type PlanFeatures struct {
	MultiBranch        bool `json:"multi_branch"`
	StockTransfer      bool `json:"stock_transfer"`
	AdvancedReports    bool `json:"advanced_reports"`
	Manufacturing      bool `json:"manufacturing"`
	RewardPoints       bool `json:"reward_points"`
	Quotations         bool `json:"quotations"`
	DeliveryManagement bool `json:"delivery_management"`
	OfflinePos         bool `json:"offline_pos"`
}

type TenantSubscription struct {
	Status             string    `json:"status"`
	CurrentPeriodStart time.Time `json:"current_period_start"`
	CurrentPeriodEnd   time.Time `json:"current_period_end"`
	Plan               *Plan     `json:"plan,omitempty"`
}

type ChoosePlanRequest struct {
	PlanID   string `json:"plan_id" binding:"required"`
	Currency string `json:"currency" binding:"required"`
}

// Admin Requests

type CreatePlanRequest struct {
	Code         string       `json:"code" binding:"required"`
	Name         string       `json:"name" binding:"required"`
	PackageType  string       `json:"package_type" binding:"required"`
	DurationType string       `json:"duration_type" binding:"required"`
	IsActive     bool         `json:"is_active"`
	IsPublic     bool         `json:"is_public"`
	Prices       []PlanPrice  `json:"prices" binding:"required"`
	Limits       PlanLimits   `json:"limits" binding:"required"`
	Features     PlanFeatures `json:"features" binding:"required"`
}

type UpdatePlanMetaRequest struct {
	Code         string `json:"code"`
	Name         string `json:"name"`
	PackageType  string `json:"package_type"`
	DurationType string `json:"duration_type"`
}

type UpdatePlanVisibilityRequest struct {
	IsActive bool `json:"is_active"`
	IsPublic bool `json:"is_public"`
}

type UpdatePlanPricesRequest struct {
	Prices []PlanPrice `json:"prices" binding:"required"`
}
