package handlers

import (
	"database/sql"
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/insaansher/sherpos/backend/db"
	"github.com/insaansher/sherpos/backend/models"
)

// GetPOSProducts returns active products with stock for the tenant
func GetPOSProducts(c *gin.Context) {
	tenantID := c.GetString("tenantID")
	search := c.Query("search")

	query := `
        SELECT p.id, p.name, p.sku, p.barcode, p.price, COALESCE(SUM(i.quantity), 0) as stock
        FROM products p
        LEFT JOIN inventory_stock i ON p.id = i.product_id AND i.tenant_id = p.tenant_id
        WHERE p.tenant_id = $1 AND p.is_active = true
    `
	args := []interface{}{tenantID}

	if search != "" {
		query += " AND (p.name ILIKE $2 OR p.sku ILIKE $2 OR p.barcode ILIKE $2)"
		args = append(args, "%"+search+"%")
	}

	query += " GROUP BY p.id ORDER BY p.name LIMIT 50"

	// Check if products exist for this tenant, if not seed them
	var count int
	db.DB.QueryRow("SELECT COUNT(*) FROM products WHERE tenant_id=$1", tenantID).Scan(&count)
	if count == 0 {
		// Auto-seed for this tenant
		// Ideally helper func, but inline for brevity/safety in this handler file
		p1ID := ""
		db.DB.QueryRow("INSERT INTO products (tenant_id, name, sku, price, is_active) VALUES ($1, 'Demo Coffee', 'SKU001', 3.50, true) RETURNING id", tenantID).Scan(&p1ID)
		db.DB.Exec("INSERT INTO inventory_stock (tenant_id, product_id, quantity) VALUES ($1, $2, 100)", tenantID, p1ID)

		p2ID := ""
		db.DB.QueryRow("INSERT INTO products (tenant_id, name, sku, price, is_active) VALUES ($1, 'Demo Tea', 'SKU002', 2.00, true) RETURNING id", tenantID).Scan(&p2ID)
		db.DB.Exec("INSERT INTO inventory_stock (tenant_id, product_id, quantity) VALUES ($1, $2, 50)", tenantID, p2ID)

		p3ID := ""
		db.DB.QueryRow("INSERT INTO products (tenant_id, name, sku, price, is_active) VALUES ($1, 'Demo Cake', 'SKU003', 5.00, true) RETURNING id", tenantID).Scan(&p3ID)
		db.DB.Exec("INSERT INTO inventory_stock (tenant_id, product_id, quantity) VALUES ($1, $2, 20)", tenantID, p3ID)
	}

	rows, err := db.DB.Query(query, args...)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var products []models.Product
	for rows.Next() {
		var p models.Product
		var bc sql.NullString
		if err := rows.Scan(&p.ID, &p.Name, &p.Sku, &bc, &p.Price, &p.StockQuantity); err != nil {
			continue
		}
		p.Barcode = bc.String
		p.TenantID = tenantID
		products = append(products, p)
	}

	if products == nil {
		products = []models.Product{}
	}
	c.JSON(200, products)
}

// CreateSale processes a POS transaction
func CreateSale(c *gin.Context) {
	tenantID := c.GetString("tenantID")
	userID := c.GetString("userID")

	var req models.CreateSaleRequest
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

	// 1. Generate Invoice Number (Simple Count+1 logic for MVP)
	// NOTE: In high concurrency this is flaky without locking, but acceptable for MVP "Core"
	var count int
	tx.QueryRow("SELECT COUNT(*) FROM sales WHERE tenant_id=$1", tenantID).Scan(&count)
	invoiceNum := fmt.Sprintf("INV-%d-%06d", 2026, count+1) // Hardcoded year for MVP

	// 2. Process Items
	var totalAmount float64
	var itemsToInsert []models.SaleItem

	for _, item := range req.Items {
		// Check Stock & Price
		var price float64
		var currentStock int
		var name string

		err := tx.QueryRow("SELECT price, name FROM products WHERE id=$1 AND tenant_id=$2", item.ProductID, tenantID).Scan(&price, &name)
		if err != nil {
			c.JSON(404, gin.H{"error": fmt.Sprintf("Product %s not found", item.ProductID)})
			return
		}

		err = tx.QueryRow("SELECT quantity FROM inventory_stock WHERE product_id=$1 AND tenant_id=$2 FOR UPDATE", item.ProductID, tenantID).Scan(&currentStock)
		if err == sql.ErrNoRows {
			currentStock = 0
		} // No record = 0 stock

		if currentStock < item.Quantity {
			c.JSON(409, gin.H{"error": fmt.Sprintf("Insufficient stock for %s. Available: %d", name, currentStock)})
			return
		}

		// Deduct Stock
		if currentStock > 0 { // Just logic check, row might imply update
			_, err := tx.Exec(`INSERT INTO inventory_stock (tenant_id, product_id, quantity) VALUES ($1, $2, $3)
                  ON CONFLICT (tenant_id, product_id, variant_id) DO UPDATE SET quantity = inventory_stock.quantity - $4`,
				tenantID, item.ProductID, currentStock-item.Quantity, item.Quantity)
			// simplified: actually 'inventory_stock' unique constraint allows upsert.
			// Ideally: UPDATE inventory_stock SET quantity = quantity - $1 WHERE product_id=$2
			_, err = tx.Exec("UPDATE inventory_stock SET quantity = quantity - $1 WHERE product_id=$2 AND tenant_id=$3", item.Quantity, item.ProductID, tenantID)
			if err != nil {
				c.JSON(500, gin.H{"error": "Stock update failed"})
				return
			}
		}

		lineTotal := price * float64(item.Quantity)
		totalAmount += lineTotal

		itemsToInsert = append(itemsToInsert, models.SaleItem{
			ProductName: name,
			Quantity:    item.Quantity,
			UnitPrice:   price, // Use DB price for security, ignoring req.UnitPrice unless handling overrides
			TotalPrice:  lineTotal,
		})
	}

	finalAmount := totalAmount - req.DiscountAmount
	if finalAmount < 0 {
		finalAmount = 0
	}

	// 3. Insert Sale
	var saleID string
	err = tx.QueryRow(`INSERT INTO sales (tenant_id, invoice_number, total_amount, discount_amount, final_amount, payment_method, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
		tenantID, invoiceNum, totalAmount, req.DiscountAmount, finalAmount, req.PaymentMethod, userID).Scan(&saleID)
	if err != nil {
		c.JSON(500, gin.H{"error": "Sale insert failed: " + err.Error()})
		return
	}

	// 4. Insert Items
	for i, item := range itemsToInsert {
		_, err := tx.Exec(`INSERT INTO sale_items (sale_id, product_id, product_name, quantity, unit_price, total_price)
            VALUES ($1, $2, $3, $4, $5, $6)`,
			saleID, req.Items[i].ProductID, item.ProductName, item.Quantity, item.UnitPrice, item.TotalPrice)
		if err != nil {
			c.JSON(500, gin.H{"error": "Item insert failed"})
			return
		}
	}

	tx.Commit()

	c.JSON(201, gin.H{
		"message":        "Sale created",
		"sale_id":        saleID,
		"invoice_number": invoiceNum,
		"final_amount":   finalAmount,
	})
}

// GetSale returns a single sale
func GetSale(c *gin.Context) {
	tenantID := c.GetString("tenantID")
	id := c.Param("id")

	var s models.Sale
	err := db.DB.QueryRow("SELECT id, invoice_number, total_amount, discount_amount, final_amount, payment_method, created_at FROM sales WHERE id=$1 AND tenant_id=$2", id, tenantID).
		Scan(&s.ID, &s.InvoiceNumber, &s.TotalAmount, &s.DiscountAmount, &s.FinalAmount, &s.PaymentMethod, &s.CreatedAt)

	if err != nil {
		c.JSON(404, gin.H{"error": "Sale not found"})
		return
	}

	rows, _ := db.DB.Query("SELECT product_name, quantity, unit_price, total_price FROM sale_items WHERE sale_id=$1", s.ID)
	defer rows.Close()

	for rows.Next() {
		var i models.SaleItem
		rows.Scan(&i.ProductName, &i.Quantity, &i.UnitPrice, &i.TotalPrice)
		s.Items = append(s.Items, i)
	}

	c.JSON(200, s)
}
