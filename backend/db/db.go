package db

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/lib/pq"
)

var DB *sql.DB

func Connect() {
	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
	)

	var err error
	DB, err = sql.Open("postgres", dsn)
	if err != nil {
		log.Printf("Error opening database connection: %v", err)
		return
	}

	if err = DB.Ping(); err != nil {
		log.Printf("Database unreachable: %v", err)
		return
	}

	log.Println("Connected to Database")
}

func Status() string {
	if DB == nil {
		return "disconnected"
	}
	if err := DB.Ping(); err != nil {
		return "unreachable"
	}
	return "connected"
}
