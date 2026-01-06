-- Phase 6: Offline POS Sync Map
CREATE TABLE IF NOT EXISTS offline_sync_map (
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    local_sale_id UUID NOT NULL,
    server_sale_id UUID REFERENCES sales(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, local_sale_id)
);
