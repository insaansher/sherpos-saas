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

	query := `
	CREATE TABLE IF NOT EXISTS offline_sync_map (
		tenant_id UUID NOT NULL,
		local_sale_id VARCHAR(255) NOT NULL,
		server_sale_id UUID NOT NULL REFERENCES sales(id),
		created_at TIMESTAMP DEFAULT NOW(),
		PRIMARY KEY (tenant_id, local_sale_id)
	);
	`

	_, err = db.Exec(query)
	if err != nil {
		log.Fatal("Migration failed:", err)
	}

	fmt.Println("Migration successful: offline_sync_map table created/verified.")
}
