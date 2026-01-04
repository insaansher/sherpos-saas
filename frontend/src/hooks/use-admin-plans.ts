"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Plan } from "@/hooks/use-plans";

export function useAdminPlans() {
    return useQuery({
        queryKey: ["admin", "plans"],
        queryFn: async () => {
            const res = await api.get("/admin/plans");
            return res.data as Plan[];
        }
    });
}

export function useAdminPlanMutations() {
    const queryClient = useQueryClient();

    const createPlan = useMutation({
        mutationFn: (data: any) => api.post("/admin/plans", data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "plans"] })
    });

    const updateMeta = useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => api.put(`/admin/plans/${id}`, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "plans"] })
    });

    const updateVisibility = useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => api.put(`/admin/plans/${id}/visibility`, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "plans"] })
    });

    const updatePrices = useMutation({
        mutationFn: ({ id, prices }: { id: string, prices: any[] }) => api.put(`/admin/plans/${id}/prices`, { prices }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "plans"] })
    });

    const updateLimits = useMutation({
        mutationFn: ({ id, limits }: { id: string, limits: any }) => api.put(`/admin/plans/${id}/limits`, limits),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "plans"] })
    });

    const updateFeatures = useMutation({
        mutationFn: ({ id, features }: { id: string, features: any }) => api.put(`/admin/plans/${id}/features`, features),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "plans"] })
    });

    const clonePlan = useMutation({
        mutationFn: (id: string) => api.post(`/admin/plans/${id}/clone`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "plans"] })
    });

    return { createPlan, updateMeta, updateVisibility, updatePrices, updateLimits, updateFeatures, clonePlan };
}
