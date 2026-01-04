"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

// Unified Plan Interface matching Backend Models
export interface Plan {
    id: string;
    code: string;
    name: string;
    package_type: string; // Matched to JSON from backend
    duration_type: string; // Matched to JSON from backend
    is_active: boolean;
    is_public: boolean;

    // Public API returns flat price/setup_fee, Admin returns arrays
    price?: number;
    setup_fee?: number;
    prices?: { currency: string, amount: number, setup_fee: number }[];

    // Limits
    limits?: {
        branch_limit: number;
        user_limit: number;
        pos_device_limit: number;
    };

    features: {
        multi_branch: boolean;
        stock_transfer?: boolean; // Admin API uses stock_transfer
        stock?: boolean;         // Public API uses stock (legacy alias, should fix later)
        advanced_reports?: boolean;
        reports?: boolean;
        manufacturing?: boolean;
        reward_points?: boolean;
        quotations?: boolean;
        delivery_management?: boolean;
        offline_pos?: boolean;
    };
}

export function usePublicPlans(currency: string = "USD") {
    return useQuery({
        queryKey: ["public-plans", currency],
        queryFn: async () => {
            const res = await api.get(`/public/plans?currency=${currency}`);
            // Map legacy public API format to new Interface if needed, or update backend PublicPlans to use Struct.
            // Currently PublicPlans returns manual JSON { "package": ..., "duration": ... }
            // We map it here to ensure consistency
            return (res.data as any[]).map(p => ({
                ...p,
                package_type: p.package,
                duration_type: p.duration,
            })) as Plan[];
        }
    });
}

export function useTenantBilling() {
    return useQuery({
        queryKey: ["billing", "current"],
        queryFn: async () => {
            const res = await api.get("/billing/current");
            return res.data;
        }
    });
}

export function useChoosePlan() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { plan_id: string, currency: string }) => {
            await api.post("/billing/choose-plan", data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["billing"] });
            queryClient.invalidateQueries({ queryKey: ["auth"] });
        }
    });
}
