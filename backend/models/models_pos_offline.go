package models

import "time"

// ... Existing models ...

type OfflineSyncSaleRequest struct {
	LocalSaleID     string            `json:"local_sale_id" binding:"required"`
	Items           []SaleItemRequest `json:"items" binding:"required,min=1"`
	DiscountAmount  float64           `json:"discount_amount"`
	PaymentMethod   string            `json:"payment_method" binding:"required"`
	PaymentReceived float64           `json:"payment_received"`
	CreatedAt       time.Time         `json:"created_at"` // Client time
}
