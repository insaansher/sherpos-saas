package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/insaansher/sherpos/backend/db"
	"github.com/insaansher/sherpos/backend/models"
)

// Suppliers
func ListSuppliers(c *gin.Context) {
	tenantID := c.GetString("tenantID")
	rows, err := db.DB.Query("SELECT id, name, phone, email, address FROM suppliers WHERE tenant_id=$1 ORDER BY name", tenantID)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()
	var suppliers []models.Supplier
	for rows.Next() {
		var s models.Supplier
		rows.Scan(&s.ID, &s.Name, &s.Phone, &s.Email, &s.Address)
		suppliers = append(suppliers, s)
	}
	if suppliers == nil {
		suppliers = []models.Supplier{}
	}
	c.JSON(200, suppliers)
}

func CreateSupplier(c *gin.Context) {
	tenantID := c.GetString("tenantID")
	var req models.CreateSupplierRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	_, err := db.DB.Exec("INSERT INTO suppliers (tenant_id, name, phone, email, address) VALUES ($1, $2, $3, $4, $5)",
		tenantID, req.Name, req.Phone, req.Email, req.Address)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(201, gin.H{"message": "Created"})
}

// Ledger
func GetStockLedger(c *gin.Context) {
	tenantID := c.GetString("tenantID")
	productID := c.Query("product_id")

	query := `SELECT l.id, l.product_id, l.ref_type, l.ref_id, l.qty_change, l.qty_after, l.note, l.created_at, p.name 
              FROM stock_ledger l JOIN products p ON l.product_id = p.id 
              WHERE l.tenant_id=$1`
	args := []interface{}{tenantID}

	if productID != "" {
		query += " AND l.product_id=$2"
		args = append(args, productID)
	}
	query += " ORDER BY l.created_at DESC LIMIT 100"

	rows, err := db.DB.Query(query, args...)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var ledger []models.StockLedger
	for rows.Next() {
		var l models.StockLedger
		rows.Scan(&l.ID, &l.ProductID, &l.RefType, &l.RefID, &l.QtyChange, &l.QtyAfter, &l.Note, &l.CreatedAt, &l.ProductName)
		ledger = append(ledger, l)
	}
	if ledger == nil {
		ledger = []models.StockLedger{}
	}
	c.JSON(200, ledger)
}

// Adjustments
func CreateAdjustment(c *gin.Context) {
	tenantID := c.GetString("tenantID")
	userID := c.GetString("userID")
	var req models.AdjustmentRequest
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

	var adjID string
	err = tx.QueryRow(`INSERT INTO adjustments (tenant_id, reason, notes, created_by) VALUES ($1, $2, $3, $4) RETURNING id`,
		tenantID, req.Reason, req.Notes, userID).Scan(&adjID)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	for _, item := range req.Items {
		// Log item
		_, err = tx.Exec(`INSERT INTO adjustment_items (adjustment_id, product_id, qty_change) VALUES ($1, $2, $3)`,
			adjID, item.ProductID, item.QtyChange)
		if err != nil {
			c.JSON(500, gin.H{"error": "Item err"})
			return
		}

		// Update Stock Helper
		err = updateStockHelper(tx, tenantID, item.ProductID, item.QtyChange, "adjustment", adjID, req.Reason)
		if err != nil {
			c.JSON(400, gin.H{"error": err.Error()})
			return
		}
	}

	tx.Commit()
	c.JSON(201, gin.H{"message": "Adjustment created", "id": adjID})
}
