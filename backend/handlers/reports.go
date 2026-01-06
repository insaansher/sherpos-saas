package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/insaansher/sherpos/backend/db"
)

type DailySales struct {
	Date             string  `json:"date"`
	TotalSales       float64 `json:"total_sales"`
	TransactionCount int     `json:"transaction_count"`
}

func GetDailySalesReport(c *gin.Context) {
	tenantID := c.GetString("tenantID")
	// simple last 30 days
	rows, err := db.DB.Query(`
        SELECT to_char(created_at, 'YYYY-MM-DD') as day, sum(final_amount), count(id) 
        FROM sales 
        WHERE tenant_id=$1 AND created_at > now() - interval '30 days'
        GROUP BY day ORDER BY day DESC
    `, tenantID)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var report []DailySales
	for rows.Next() {
		var r DailySales
		rows.Scan(&r.Date, &r.TotalSales, &r.TransactionCount)
		report = append(report, r)
	}
	if report == nil {
		report = []DailySales{}
	}
	c.JSON(200, report)
}

func GetStockAlerts(c *gin.Context) {
	tenantID := c.GetString("tenantID")
	// Items with < 10 stock
	rows, err := db.DB.Query(`
        SELECT p.name, p.sku, COALESCE(sum(i.quantity), 0) as stock 
        FROM products p LEFT JOIN inventory_stock i ON p.id=i.product_id 
        WHERE p.tenant_id=$1 
        GROUP BY p.id HAVING COALESCE(sum(i.quantity), 0) < 10
    `, tenantID)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	type Alert struct {
		Name  string `json:"name"`
		Sku   string `json:"sku"`
		Stock int    `json:"stock"`
	}
	var alerts []Alert
	for rows.Next() {
		var a Alert
		rows.Scan(&a.Name, &a.Sku, &a.Stock)
		alerts = append(alerts, a)
	}
	if alerts == nil {
		alerts = []Alert{}
	}
	c.JSON(200, alerts)
}
