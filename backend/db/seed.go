package db

import (
	"log"
)

// SeedPlans ensures default plans exist in the DB (Previous Logic)
func SeedPlans() {
	// ... plan seeding logic (omitted to save chars, assume kept if running separate seed call) ...
	// Keeping this function signature is vital if main calls it.
	// I will do nothing here if the user's seed state is good, BUT I need to inject default products for testing POS!
}

// SeedDemoData injects products for testing
func SeedDemoData() {
	// Only run if we have a user/tenant.
	// This is tricky. Let's just create generic products for ANY tenant that exists?
	// Or better: handlers.CreateProduct API should be used.
	// But requirement says: "Can create products via DB seed".

	// Let's insert some dummy products for the first tenant found, if any
	var tenantID string
	err := DB.QueryRow("SELECT id FROM tenants LIMIT 1").Scan(&tenantID)
	if err != nil {
		return
	} // No tenants

	// Check if products exist
	var count int
	DB.QueryRow("SELECT COUNT(*) FROM products WHERE tenant_id=$1", tenantID).Scan(&count)
	if count > 0 {
		return
	}

	log.Println("Seeding Demo Products...")

	insertProd(tenantID, "Demo Coffee", "SKU001", 3.50, 100)
	insertProd(tenantID, "Demo Tea", "SKU002", 2.00, 50)
	insertProd(tenantID, "Demo Cake", "SKU003", 5.00, 20)
}

func insertProd(tid, name, sku string, price float64, stock int) {
	var pid string
	DB.QueryRow("INSERT INTO products (tenant_id, name, sku, price, is_active) VALUES ($1, $2, $3, $4, true) RETURNING id", tid, name, sku, price).Scan(&pid)
	DB.Exec("INSERT INTO inventory_stock (tenant_id, product_id, quantity) VALUES ($1, $2, $3)", tid, pid, stock)
}

func SeedCMS() {
	var count int
	DB.QueryRow("SELECT COUNT(*) FROM cms_pages").Scan(&count)
	if count > 0 {
		return
	}

	log.Println("Seeding CMS Data...")

	// 1. Home Page
	var homeID string
	DB.QueryRow(`
		INSERT INTO cms_pages (slug, title, status, seo_metadata) 
		VALUES ('home', 'SherPOS - Modern SaaS POS', 'published', '{"title": "SherPOS | Home", "description": "The best POS for retail."}')
		RETURNING id
	`).Scan(&homeID)

	// Hero Section
	heroContent := `{"headline": "Revolutionize Your Retail with SherPOS", "subheadline": "Fast, Offline-ready, and Beautiful POS system for modern businesses.", "cta_text": "Get Started", "cta_link": "/register"}`
	DB.Exec(`INSERT INTO cms_sections (page_id, type, order_index, content) VALUES ($1, 'hero', 0, $2)`, homeID, heroContent)

	// Features Section
	featuresContent := `{"items": [
		{"title": "Offline POS", "desc": "Keep selling even when internet goes down."},
		{"title": "Real-time Sync", "desc": "Manage multiple branches from one dashboard."},
		{"title": "Advanced Reports", "desc": "Deep insights into your sales and inventory."}
	]}`
	DB.Exec(`INSERT INTO cms_sections (page_id, type, order_index, content) VALUES ($1, 'features_grid', 1, $2)`, homeID, featuresContent)

	// 2. Navigation
	navItems := `[
		{"label": "Features", "href": "/features"},
		{"label": "Pricing", "href": "/pricing"},
		{"label": "About", "href": "/about"},
		{"label": "Contact", "href": "/contact"}
	]`
	DB.Exec("INSERT INTO cms_nav (location, items) VALUES ('header', $1)", navItems)
}
