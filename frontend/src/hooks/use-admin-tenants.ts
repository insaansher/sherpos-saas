"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export interface Tenant {
    id: string;
    name: string;
    email: string;
    status: 'active' | 'trial' | 'suspended';
    plan: string;
    created_at: string;
    renews_at: string;
    phone?: string;
    address?: string;
    stats?: {
        revenue?: number;
        orders?: number;
    };
}

export function useAdminTenants() {
    return useQuery({
        queryKey: ["admin", "tenants"],
        queryFn: async () => {
            // Simulated generic admin endpoint
            try {
                const res = await api.get("/admin/tenants");
                return res.data as Tenant[];
            } catch (e) {
                // Fallback Mock Data for UI Dev
                return [
                    { id: "1", name: "Coffee House Ltd", email: "contact@coffeehouse.com", status: "active", plan: "Enterprise", created_at: "2024-01-15T00:00:00Z", renews_at: "2026-02-01T00:00:00Z", stats: { revenue: 5000, orders: 1200 } },
                    { id: "2", name: "Retail Pro Inc", email: "admin@retailpro.com", status: "trial", plan: "Pro", created_at: "2025-12-20T00:00:00Z", renews_at: "2026-01-20T00:00:00Z", stats: { revenue: 0, orders: 50 } },
                    { id: "3", name: "Boutique Fashion", email: "sarah@boutique.co", status: "suspended", plan: "Basic", created_at: "2023-11-05T00:00:00Z", renews_at: "2025-12-05T00:00:00Z", stats: { revenue: 12000, orders: 3000 } },
                ] as Tenant[];
            }
        }
    });
}

export function useAdminTenant(id: string) {
    return useQuery({
        queryKey: ["admin", "tenants", id],
        queryFn: async () => {
            const res = await api.get(`/admin/tenants/${id}`);
            return res.data as (Tenant & { stats: any });
        }
    });
}
