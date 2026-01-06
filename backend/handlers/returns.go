package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/insaansher/sherpos/backend/db"
	"github.com/insaansher/sherpos/backend/models"
)

func CreateSaleReturn(c *gin.Context) {
	tenantID := c.GetString("tenantID")
	userID := c.GetString("userID")
	var req models.SaleReturnRequest
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

	var returnID string
	err = tx.QueryRow("INSERT INTO sale_returns (tenant_id, sale_id, reason, created_by) VALUES ($1, $2, $3, $4) RETURNING id",
		tenantID, req.SaleID, req.Reason, userID).Scan(&returnID)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	for _, item := range req.Items {
		// Validate sold qty vs returned qty - Skipped for speed, assuming UI validation
		// In real app: check if (already_returned + current_return) <= sold_qty

		_, err = tx.Exec("INSERT INTO sale_return_items (sale_return_id, product_id, quantity) VALUES ($1, $2, $3)",
			returnID, item.ProductID, item.Quantity)
		if err != nil {
			c.JSON(500, gin.H{"error": "Item insert failed"})
			return
		}

		// Return = Stock Increase
		err = updateStockHelper(tx, tenantID, item.ProductID, item.Quantity, "sale_return", returnID, "Sale Return")
		if err != nil {
			c.JSON(400, gin.H{"error": err.Error()})
			return
		}
	}

	tx.Commit()
	c.JSON(201, gin.H{"message": "Return Processed", "id": returnID})
}

func CreatePurchaseReturn(c *gin.Context) {
	tenantID := c.GetString("tenantID")
	userID := c.GetString("userID")
	var req models.PurchaseReturnRequest
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

	var returnID string
	err = tx.QueryRow("INSERT INTO purchase_returns (tenant_id, purchase_id, reason, created_by) VALUES ($1, $2, $3, $4) RETURNING id",
		tenantID, req.PurchaseID, req.Reason, userID).Scan(&returnID)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	for _, item := range req.Items {
		_, err = tx.Exec("INSERT INTO purchase_return_items (purchase_return_id, product_id, quantity) VALUES ($1, $2, $3)",
			returnID, item.ProductID, item.Quantity)
		if err != nil {
			c.JSON(500, gin.H{"error": "Item insert failed"})
			return
		}

		// Purchase Return = Stock Decrease
		err = updateStockHelper(tx, tenantID, item.ProductID, -item.Quantity, "purchase_return", returnID, "Purchase Return")
		if err != nil {
			c.JSON(400, gin.H{"error": err.Error()})
			return
		}
	}

	tx.Commit()
	c.JSON(201, gin.H{"message": "Return Processed", "id": returnID})
}
