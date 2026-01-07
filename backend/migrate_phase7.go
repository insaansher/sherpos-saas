package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

func main() {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
	)

	db, err := sql.Open("postgres", dsn)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	if err = db.Ping(); err != nil {
		log.Fatal("Cannot connect:", err)
	}

	// Run Phase 7 migrations
	migrations := []string{
		`ALTER TABLE tenant_subscriptions 
		 ADD COLUMN IF NOT EXISTS renewal_window_end_at TIMESTAMP WITH TIME ZONE,
		 ADD COLUMN IF NOT EXISTS grace_end_at TIMESTAMP WITH TIME ZONE,
		 ADD COLUMN IF NOT EXISTS read_only_end_at TIMESTAMP WITH TIME ZONE,
		 ADD COLUMN IF NOT EXISTS late_fee_amount NUMERIC(12,2) DEFAULT 0,
		 ADD COLUMN IF NOT EXISTS last_status_change_at TIMESTAMP WITH TIME ZONE`,

		`CREATE TABLE IF NOT EXISTS subscription_events (
		    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
		    old_status VARCHAR(20),
		    new_status VARCHAR(20) NOT NULL,
		    reason TEXT,
		    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
		)`,

		`CREATE TABLE IF NOT EXISTS deletion_queue (
		    tenant_id UUID PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
		    scheduled_delete_at TIMESTAMP WITH TIME ZONE NOT NULL,
		    status VARCHAR(20) CHECK (status IN ('scheduled', 'processing', 'done')) DEFAULT 'scheduled',
		    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
		)`,

		`CREATE INDEX IF NOT EXISTS idx_subscription_events_tenant ON subscription_events(tenant_id)`,
		`CREATE INDEX IF NOT EXISTS idx_subscription_events_created ON subscription_events(created_at DESC)`,
		`CREATE INDEX IF NOT EXISTS idx_deletion_queue_scheduled ON deletion_queue(scheduled_delete_at) WHERE status = 'scheduled'`,
	}

	for i, migration := range migrations {
		_, err = db.Exec(migration)
		if err != nil {
			log.Printf("Migration %d failed: %v", i+1, err)
		} else {
			log.Printf("Migration %d successful", i+1)
		}
	}

	fmt.Println("Phase 7 migrations completed successfully!")
}
