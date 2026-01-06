package handlers

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/insaansher/sherpos/backend/db"
	"github.com/insaansher/sherpos/backend/models"
)

// SyncOfflineSale handles cached sales from offline mode
func SyncOfflineSale(c *gin.Context) {
	tenantID := c.GetString("tenantID")
	userID := c.GetString("userID")

	var req models.OfflineSyncSaleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	// 1. Idempotency Check
	var existingServerID string
	var existingInvoice string
	err := db.DB.QueryRow(`
		SELECT s.id, s.invoice_number 
		FROM offline_sync_map m
		JOIN sales s ON m.server_sale_id = s.id
		WHERE m.tenant_id=$1 AND m.local_sale_id=$2
	`, tenantID, req.LocalSaleID).Scan(&existingServerID, &existingInvoice)

	if err == nil {
		// Already synced
		c.JSON(200, gin.H{
			"message":        "Already synced",
			"sale_id":        existingServerID,
			"invoice_number": existingInvoice,
		})
		return
	} else if err != sql.ErrNoRows {
		c.JSON(500, gin.H{"error": "Sync map check failed"})
		return
	}

	// 2. Begin Transaction
	tx, err := db.DB.Begin()
	if err != nil {
		c.JSON(500, gin.H{"error": "Tx failed"})
		return
	}
	defer tx.Rollback()

	// 3. Stock Check & Calc
	// NOTE: We validate stock at sync time. If insufficient, we reject sync.
	// User must resolve manually (adjust stock or cancel sale).
	var totalAmount float64
	var itemsToInsert []models.SaleItem

	for _, item := range req.Items {
		var price float64
		var name string
		var currentStock int

		err := tx.QueryRow("SELECT price, name FROM products WHERE id=$1 AND tenant_id=$2", item.ProductID, tenantID).Scan(&price, &name)
		if err != nil {
			c.JSON(400, gin.H{"error": fmt.Sprintf("Product %s not found (deleted?)", item.ProductID)})
			return
		}

		err = tx.QueryRow("SELECT quantity FROM inventory_stock WHERE product_id=$1 AND tenant_id=$2 FOR UPDATE", item.ProductID, tenantID).Scan(&currentStock)
		if err != nil { // No stock record
			currentStock = 0
		}

		if currentStock < item.Quantity {
			c.JSON(409, gin.H{
				"error":      fmt.Sprintf("Insufficient stock for %s during sync. Available: %d, Sold: %d", name, currentStock, item.Quantity),
				"product_id": item.ProductID,
			})
			return
		}

		lineTotal := price * float64(item.Quantity)
		totalAmount += lineTotal

		itemsToInsert = append(itemsToInsert, models.SaleItem{
			ProductName: name,
			Quantity:    item.Quantity,
			UnitPrice:   price,
			TotalPrice:  lineTotal,
		})
	}

	finalAmount := totalAmount - req.DiscountAmount
	if finalAmount < 0 {
		finalAmount = 0
	}

	// 4. Generate Invoice (Using current server time/sequence, ignoring offline created_at for sequence consistency, but could track metadata)
	var count int
	tx.QueryRow("SELECT COUNT(*) FROM sales WHERE tenant_id=$1", tenantID).Scan(&count)
	invoiceNum := fmt.Sprintf("INV-%d-%06d", 2026, count+1)

	// 5. Insert Sale
	// We use server time for created_at to maintain chronological order in DB, or use req.CreatedAt if strict local time needed.
	// Let's use REQ time but ensure it's not future? No, safe to use Server Time for "System Record" but maybe store "Device Time" in metadata eventually.
	// For now, use Server Time for consistent reporting.
	var saleID string
	err = tx.QueryRow(`INSERT INTO sales (tenant_id, invoice_number, total_amount, discount_amount, final_amount, payment_method, created_by, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
		tenantID, invoiceNum, totalAmount, req.DiscountAmount, finalAmount, req.PaymentMethod, userID, time.Now()).Scan(&saleID)
	if err != nil {
		c.JSON(500, gin.H{"error": "Sale insert failed"})
		return
	}

	// 6. Insert Items & Updates
	for i, item := range itemsToInsert {
		_, err := tx.Exec(`INSERT INTO sale_items (sale_id, product_id, product_name, quantity, unit_price, total_price)
            VALUES ($1, $2, $3, $4, $5, $6)`,
			saleID, req.Items[i].ProductID, item.ProductName, item.Quantity, item.UnitPrice, item.TotalPrice)
		if err != nil {
			c.JSON(500, gin.H{"error": "Item insert failed"})
			return
		}

		// Update Stock via Helper
		err = updateStockHelper(tx, tenantID, req.Items[i].ProductID, -item.Quantity, "sale", saleID, "Offline Sale Sync")
		if err != nil {
			c.JSON(500, gin.H{"error": "Stock update failed: " + err.Error()})
			return
		}
	}

	// 7. Write Sync Map
	_, err = tx.Exec("INSERT INTO offline_sync_map (tenant_id, local_sale_id, server_sale_id) VALUES ($1, $2, $3)",
		tenantID, req.LocalSaleID, saleID)
	if err != nil {
		c.JSON(500, gin.H{"error": "Sync map insert failed"})
		return
	}

	tx.Commit()

	c.JSON(201, gin.H{
		"message":        "Synced",
		"sale_id":        saleID,
		"invoice_number": invoiceNum,
	})
}
