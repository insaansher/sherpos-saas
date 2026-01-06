-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Tenants
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'trialing',
    onboarding_completed BOOLEAN DEFAULT FALSE,
    timezone VARCHAR(50) DEFAULT 'UTC',
    currency VARCHAR(10) DEFAULT 'USD',
    invoice_prefix_default VARCHAR(20) DEFAULT 'INV-',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'owner',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Plans
CREATE TABLE IF NOT EXISTS plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    package_type VARCHAR(20) CHECK (package_type IN ('basic', 'advanced')) DEFAULT 'basic',
    duration_type VARCHAR(20) CHECK (duration_type IN ('monthly', 'annual', '2y', '3y', '4y', 'lifetime')) DEFAULT 'monthly',
    is_active BOOLEAN DEFAULT TRUE,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Plan Prices
CREATE TABLE IF NOT EXISTS plan_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID REFERENCES plans(id) ON DELETE CASCADE,
    currency VARCHAR(10) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    setup_fee NUMERIC(12, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(plan_id, currency)
);

-- 5. Plan Limits
CREATE TABLE IF NOT EXISTS plan_limits (
    plan_id UUID PRIMARY KEY REFERENCES plans(id) ON DELETE CASCADE,
    branch_limit INT DEFAULT 1,
    user_limit INT DEFAULT 1,
    pos_device_limit INT DEFAULT 1
);

-- 6. Plan Features
CREATE TABLE IF NOT EXISTS plan_features (
    plan_id UUID PRIMARY KEY REFERENCES plans(id) ON DELETE CASCADE,
    multi_branch BOOLEAN DEFAULT FALSE,
    stock_transfer BOOLEAN DEFAULT FALSE,
    advanced_reports BOOLEAN DEFAULT FALSE,
    manufacturing BOOLEAN DEFAULT FALSE,
    reward_points BOOLEAN DEFAULT FALSE,
    quotations BOOLEAN DEFAULT FALSE,
    delivery_management BOOLEAN DEFAULT FALSE,
    offline_pos BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Tenant Subscriptions
CREATE TABLE IF NOT EXISTS tenant_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE UNIQUE,
    plan_id UUID REFERENCES plans(id),
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    status VARCHAR(20) CHECK (status IN ('trialing', 'active', 'renewal_window', 'grace_penalty', 'read_only', 'blocked')) DEFAULT 'trialing',
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    blocked_at TIMESTAMP WITH TIME ZONE,
    delete_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Refresh Tokens
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. POS Devices
CREATE TABLE IF NOT EXISTS pos_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    device_hash VARCHAR(255) NOT NULL,
    user_agent TEXT,
    last_active_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- PHASE 4: CORE POS ENGINE ---

-- 11. Products
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sku VARCHAR(100) NOT NULL, -- Unique per tenant logic handled in app or composite index
    barcode VARCHAR(100),
    price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    cost_price NUMERIC(12, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, sku)
);

-- 12. Product Variants (Simplified for Core, often 1-1 with product if no variants)
CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL, -- e.g. "Size L, Red"
    sku VARCHAR(100),
    barcode VARCHAR(100),
    price_override NUMERIC(12, 2), -- If null, use product price
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. Inventory Stock
CREATE TABLE IF NOT EXISTS inventory_stock (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE, -- Nullable if no variant
    branch_id UUID, -- Null for now (Phase 4 Core), or future proof
    quantity INT NOT NULL DEFAULT 0, 
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, product_id, variant_id) -- Simple constraints
);

-- 14. Sales
CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    invoice_number VARCHAR(50) NOT NULL, -- e.g. INV-2023-00001
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(12, 2) DEFAULT 0,
    tax_amount NUMERIC(12, 2) DEFAULT 0,
    final_amount NUMERIC(12, 2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'cash',
    payment_received NUMERIC(12, 2) DEFAULT 0,
    change_due NUMERIC(12, 2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'completed', -- completed, refunded, void
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- 15. Sale Items
CREATE TABLE IF NOT EXISTS sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID REFERENCES sales(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL, -- Snapshot
    quantity INT NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL,
    total_price NUMERIC(12, 2) NOT NULL
);

-- Phase 5 Additions ---

-- 16. Suppliers
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 17. Purchases
CREATE TABLE IF NOT EXISTS purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    reference_no VARCHAR(100) NOT NULL, -- e.g. PO-2026-001
    subtotal NUMERIC(12, 2) DEFAULT 0,
    tax_total NUMERIC(12, 2) DEFAULT 0,
    discount_total NUMERIC(12, 2) DEFAULT 0,
    grand_total NUMERIC(12, 2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'received', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    received_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(tenant_id, reference_no)
);

-- 18. Purchase Items
CREATE TABLE IF NOT EXISTS purchase_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_id UUID REFERENCES purchases(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    name_snapshot VARCHAR(255),
    cost_price NUMERIC(12, 2) DEFAULT 0,
    quantity INT NOT NULL,
    line_total NUMERIC(12, 2) DEFAULT 0
);

-- 19. Stock Ledger (History)
CREATE TABLE IF NOT EXISTS stock_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    ref_type VARCHAR(50) NOT NULL CHECK (ref_type IN ('sale', 'purchase', 'sale_return', 'purchase_return', 'adjustment', 'initial')),
    ref_id UUID NOT NULL, -- ID of the sale, purchase, etc.
    qty_change INT NOT NULL, -- Can be negative
    qty_after INT NOT NULL, -- Snapshot of stock after change
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 20. Adjustments
CREATE TABLE IF NOT EXISTS adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    reason VARCHAR(50) NOT NULL CHECK (reason IN ('damage', 'correction', 'count', 'theft', 'other')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- 21. Adjustment Items
CREATE TABLE IF NOT EXISTS adjustment_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    adjustment_id UUID REFERENCES adjustments(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    qty_change INT NOT NULL, -- Positive or negative
    note TEXT
);

-- 22. Sale Returns
CREATE TABLE IF NOT EXISTS sale_returns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    sale_id UUID REFERENCES sales(id) ON DELETE CASCADE NOT NULL,
    reason TEXT,
    refund_amount NUMERIC(12, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- 23. Sale Return Items
CREATE TABLE IF NOT EXISTS sale_return_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_return_id UUID REFERENCES sale_returns(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    quantity INT NOT NULL
);

-- 24. Purchase Returns
CREATE TABLE IF NOT EXISTS purchase_returns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    purchase_id UUID REFERENCES purchases(id) ON DELETE CASCADE NOT NULL,
    reason TEXT,
    refund_amount NUMERIC(12, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- 25. Purchase Return Items
CREATE TABLE IF NOT EXISTS purchase_return_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_return_id UUID REFERENCES purchase_returns(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    quantity INT NOT NULL
);
- -   P h a s e   6 :   O f f l i n e   P O S   S y n c   M a p  
 C R E A T E   T A B L E   I F   N O T   E X I S T S   o f f l i n e _ s y n c _ m a p   (  
         t e n a n t _ i d   U U I D   R E F E R E N C E S   t e n a n t s ( i d )   O N   D E L E T E   C A S C A D E   N O T   N U L L ,  
         l o c a l _ s a l e _ i d   U U I D   N O T   N U L L ,  
         s e r v e r _ s a l e _ i d   U U I D   R E F E R E N C E S   s a l e s ( i d )   O N   D E L E T E   C A S C A D E   N O T   N U L L ,  
         c r e a t e d _ a t   T I M E S T A M P   W I T H   T I M E   Z O N E   D E F A U L T   C U R R E N T _ T I M E S T A M P ,  
         U N I Q U E ( t e n a n t _ i d ,   l o c a l _ s a l e _ i d )  
 ) ;  
 