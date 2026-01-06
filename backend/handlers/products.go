package handlers

import (
	"database/sql"

	"github.com/gin-gonic/gin"
	"github.com/insaansher/sherpos/backend/db"
	"github.com/insaansher/sherpos/backend/models"
)

// ListProducts (Admin/Manager View)
func ListProducts(c *gin.Context) {
	tenantID := c.GetString("tenantID")
	rows, err := db.DB.Query(`SELECT p.id, p.name, p.sku, p.barcode, p.price, p.cost_price, p.is_active, COALESCE(sum(i.quantity), 0) 
        FROM products p LEFT JOIN inventory_stock i ON p.id=i.product_id WHERE p.tenant_id=$1 GROUP BY p.id ORDER BY p.name`, tenantID)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var products []models.Product
	for rows.Next() {
		var p models.Product
		var bc sql.NullString // omitted in query scan but struct has it
		// simplified scan matches query columns
		rows.Scan(&p.ID, &p.Name, &p.Sku, &bc, &p.Price, &p.CostPrice, &p.IsActive, &p.StockQuantity)
		p.Barcode = bc.String
		products = append(products, p)
	}
	if products == nil {
		products = []models.Product{}
	}
	c.JSON(200, products)
}

func GetProduct(c *gin.Context) {
	tenantID := c.GetString("tenantID")
	id := c.Param("id")
	var p models.Product
	var bc sql.NullString
	err := db.DB.QueryRow(`SELECT id, name, sku, barcode, price, cost_price, is_active FROM products WHERE id=$1 AND tenant_id=$2`, id, tenantID).
		Scan(&p.ID, &p.Name, &p.Sku, &bc, &p.Price, &p.CostPrice, &p.IsActive)
	if err != nil {
		c.JSON(404, gin.H{"error": "Not found"})
		return
	}
	p.Barcode = bc.String
	c.JSON(200, p)
}

func CreateProduct(c *gin.Context) {
	tenantID := c.GetString("tenantID")
	var req models.Product
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	var id string
	err := db.DB.QueryRow(`INSERT INTO products (tenant_id, name, sku, barcode, price, cost_price, is_active) 
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
		tenantID, req.Name, req.Sku, req.Barcode, req.Price, req.CostPrice, true).Scan(&id)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	// Initial stock 0
	db.DB.Exec("INSERT INTO inventory_stock (tenant_id, product_id, quantity) VALUES ($1, $2, 0)", tenantID, id)
	c.JSON(201, gin.H{"id": id})
}

func UpdateProduct(c *gin.Context) {
	tenantID := c.GetString("tenantID")
	id := c.Param("id")
	var req models.Product
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	_, err := db.DB.Exec(`UPDATE products SET name=$1, sku=$2, barcode=$3, price=$4, cost_price=$5, is_active=$6 WHERE id=$7 AND tenant_id=$8`,
		req.Name, req.Sku, req.Barcode, req.Price, req.CostPrice, req.IsActive, id, tenantID)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, gin.H{"message": "Updated"})
}
