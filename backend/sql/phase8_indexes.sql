-- Phase 8: Performance Indexes
-- Add indexes for commonly queried columns

-- Users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);

-- Products
CREATE INDEX IF NOT EXISTS idx_products_tenant_barcode ON products(tenant_id, barcode);
CREATE INDEX IF NOT EXISTS idx_products_tenant_active ON products(tenant_id, is_active);

-- Sales
CREATE INDEX IF NOT EXISTS idx_sales_tenant_created ON sales(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_invoice ON sales(invoice_number);

-- Stock Ledger
CREATE INDEX IF NOT EXISTS idx_stock_ledger_tenant_product ON stock_ledger(tenant_id, product_id);
CREATE INDEX IF NOT EXISTS idx_stock_ledger_created ON stock_ledger(created_at DESC);

-- Purchases
CREATE INDEX IF NOT EXISTS idx_purchases_tenant_created ON purchases(tenant_id, created_at DESC);

-- Audit Logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_created ON audit_logs(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- Subscription Events
CREATE INDEX IF NOT EXISTS idx_subscription_events_tenant_created ON subscription_events(tenant_id, created_at DESC);
