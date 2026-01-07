package workers

import (
	"log"
	"time"

	"github.com/insaansher/sherpos/backend/services"
)

// StartSubscriptionWorker runs periodic subscription status checks
func StartSubscriptionWorker() {
	log.Println("Subscription lifecycle worker started")

	ticker := time.NewTicker(5 * time.Minute) // Run every 5 minutes
	defer ticker.Stop()

	// Run immediately on start
	if err := services.ProcessAllSubscriptions(); err != nil {
		log.Printf("Error processing subscriptions: %v", err)
	}

	for range ticker.C {
		if err := services.ProcessAllSubscriptions(); err != nil {
			log.Printf("Error processing subscriptions: %v", err)
		}
	}
}
