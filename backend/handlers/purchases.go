package handlers

import (
	"database/sql"

	"github.com/gin-gonic/gin"
	"github.com/insaansher/sherpos/backend/db"
	"github.com/insaansher/sherpos/backend/models"
)

func ListPurchases(c *gin.Context) {
	tenantID := c.GetString("tenantID")
	rows, err := db.DB.Query(`SELECT p.id, p.reference_no, p.grand_total, p.status, p.created_at, s.name 
        FROM purchases p LEFT JOIN suppliers s ON p.supplier_id=s.id WHERE p.tenant_id=$1 ORDER BY p.created_at DESC`, tenantID)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()
	var purchases []models.Purchase
	for rows.Next() {
		var p models.Purchase
		var sName sql.NullString
		rows.Scan(&p.ID, &p.ReferenceNo, &p.GrandTotal, &p.Status, &p.CreatedAt, &sName)
		p.SupplierName = sName.String
		purchases = append(purchases, p)
	}
	if purchases == nil {
		purchases = []models.Purchase{}
	}
	c.JSON(200, purchases)
}

func CreatePurchase(c *gin.Context) {
	tenantID := c.GetString("tenantID")
	var req models.CreatePurchaseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	tx, err := db.DB.Begin()
	if err != nil {
		c.JSON(500, gin.H{"error": "Tx failed"})
		return
	}
	defer tx.Rollback()

	// Calc totals
	var subtotal float64
	for _, item := range req.Items {
		subtotal += item.CostPrice * float64(item.Quantity)
	}
	grandTotal := subtotal // + tax handles later

	var purchaseID string
	err = tx.QueryRow(`INSERT INTO purchases (tenant_id, supplier_id, reference_no, subtotal, grand_total, status, notes) 
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
		tenantID, req.SupplierID, req.ReferenceNo, subtotal, grandTotal, req.Status, req.Notes).Scan(&purchaseID)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	for _, item := range req.Items {
		// Get snapshot name
		var name string
		tx.QueryRow("SELECT name FROM products WHERE id=$1", item.ProductID).Scan(&name)

		_, err = tx.Exec(`INSERT INTO purchase_items (purchase_id, product_id, name_snapshot, cost_price, quantity, line_total)
            VALUES ($1, $2, $3, $4, $5, $6)`,
			purchaseID, item.ProductID, name, item.CostPrice, item.Quantity, item.CostPrice*float64(item.Quantity))
		if err != nil {
			c.JSON(500, gin.H{"error": "Item insert failed"})
			return
		}

		// If status is 'received', update stock
		if req.Status == "received" {
			err = updateStockHelper(tx, tenantID, item.ProductID, item.Quantity, "purchase", purchaseID, "Purchase Received")
			if err != nil {
				c.JSON(400, gin.H{"error": err.Error()})
				return
			}
		}
	}

	tx.Commit()
	c.JSON(201, gin.H{"id": purchaseID, "message": "Purchase created"})
}

func ReceivePurchase(c *gin.Context) {
	tenantID := c.GetString("tenantID")
	id := c.Param("id")

	tx, err := db.DB.Begin()
	if err != nil {
		c.JSON(500, gin.H{"error": "Tx failed"})
		return
	}
	defer tx.Rollback()

	var status string
	err = tx.QueryRow("SELECT status FROM purchases WHERE id=$1 AND tenant_id=$2 FOR UPDATE", id, tenantID).Scan(&status)
	if err != nil {
		c.JSON(404, gin.H{"error": "Purchase not found"})
		return
	}
	if status == "received" {
		c.JSON(400, gin.H{"error": "Already received"})
		return
	}

	_, err = tx.Exec("UPDATE purchases SET status='received', received_at=now() WHERE id=$1", id)
	if err != nil {
		c.JSON(500, gin.H{"error": "Update failed"})
		return
	}

	// Process items
	rows, err := tx.Query("SELECT product_id, quantity FROM purchase_items WHERE purchase_id=$1", id)
	if err != nil {
		c.JSON(500, gin.H{"error": "Items fetch failed"})
		return
	}

	type pi struct {
		pid string
		qty int
	}
	var items []pi
	for rows.Next() {
		var i pi
		rows.Scan(&i.pid, &i.qty)
		items = append(items, i)
	}
	rows.Close()

	for _, item := range items {
		err = updateStockHelper(tx, tenantID, item.pid, item.qty, "purchase", id, "Purchase Received (Late)")
		if err != nil {
			c.JSON(400, gin.H{"error": err.Error()})
			return
		}
	}

	tx.Commit()
	c.JSON(200, gin.H{"message": "Purchase Received"})
}
