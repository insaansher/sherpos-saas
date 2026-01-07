-- PHASE 7: SUBSCRIPTION LIFECYCLE & DELETION POLICY EXTENSIONS

-- 1) Extend tenant_subscription with lifecycle fields
ALTER TABLE tenant_subscription 
ADD COLUMN IF NOT EXISTS renewal_window_end_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS grace_end_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS read_only_end_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS late_fee_amount NUMERIC(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_status_change_at TIMESTAMP WITH TIME ZONE;

-- 2) Subscription Events Table
CREATE TABLE IF NOT EXISTS subscription_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    old_status VARCHAR(20),
    new_status VARCHAR(20) NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3) Deletion Queue Table
CREATE TABLE IF NOT EXISTS deletion_queue (
    tenant_id UUID PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
    scheduled_delete_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) CHECK (status IN ('scheduled', 'processing', 'done')) DEFAULT 'scheduled',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4) Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscription_events_tenant ON subscription_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_created ON subscription_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_deletion_queue_scheduled ON deletion_queue(scheduled_delete_at) WHERE status = 'scheduled';
