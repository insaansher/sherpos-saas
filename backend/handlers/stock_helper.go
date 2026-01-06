package handlers

import (
	"database/sql"
	"fmt"
)

// updateStockHelper handles both inventory_stock update and stock_ledger insert
// Must be called within an existing transaction
func updateStockHelper(tx *sql.Tx, tenantID, productID string, qtyChange int, refType, refID, note string) error {
	// 1. Get Current Stock (Locking)
	var currentQty int
	err := tx.QueryRow("SELECT quantity FROM inventory_stock WHERE product_id=$1 AND tenant_id=$2 FOR UPDATE", productID, tenantID).Scan(&currentQty)
	if err == sql.ErrNoRows {
		// If product has no stock record, treat as 0 and insert
		currentQty = 0
		// Insert record first if not exists
		_, err = tx.Exec("INSERT INTO inventory_stock (tenant_id, product_id, quantity) VALUES ($1, $2, 0) ON CONFLICT DO NOTHING", tenantID, productID)
		if err != nil {
			return err
		}
	} else if err != nil {
		return err
	}

	newQty := currentQty + qtyChange
	if newQty < 0 {
		return fmt.Errorf("insufficient stock for product %s. Current: %d, Requested Change: %d", productID, currentQty, qtyChange)
	}

	// 2. Update Stock
	_, err = tx.Exec("UPDATE inventory_stock SET quantity=$1, updated_at=now() WHERE product_id=$2 AND tenant_id=$3", newQty, productID, tenantID)
	if err != nil {
		return err
	}

	// 3. Insert Ledger
	_, err = tx.Exec(`INSERT INTO stock_ledger (tenant_id, product_id, ref_type, ref_id, qty_change, qty_after, note)
        VALUES ($1, $2, $3, $4, $5, $6, $7)`,
		tenantID, productID, refType, refID, qtyChange, newQty, note)

	return err
}
