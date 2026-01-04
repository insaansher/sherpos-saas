package models

import (
	"database/sql"
	"time"
)

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
	TenantID     sql.NullString `json:"tenant_id"` // Nullable for system admin
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
	Phone        string `json:"phone"` // Optional
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type OnboardingRequest struct {
	InvoicePrefixDefault string `json:"invoice_prefix_default" binding:"required"`
	Confirmed            bool   `json:"confirmed" binding:"required"`
}
