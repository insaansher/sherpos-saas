"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

export interface User {
    id: string;
    email: string;
    full_name: string;
    role: string;
}

export interface Tenant {
    id: string;
    name: string;
    status: string;
    onboarding_completed: boolean;
    timezone: string;
    currency: string;
}

interface AuthState {
    user: User | null;
    tenant: Tenant | null;
    isLoading: boolean;
    error: any;
}

export function useAuth() {
    const { data, isLoading, error } = useQuery({
        queryKey: ["auth", "me"],
        queryFn: async () => {
            try {
                const res = await api.get("/me");
                return res.data;
            } catch (err) {
                throw err;
            }
        },
        retry: false,
        staleTime: 1000 * 60, // 1 min freshness check
    });

    return {
        user: data?.user ?? null,
        tenant: data?.tenant ?? null,
        isLoading,
        error,
        isAuthenticated: !!data?.user,
    };
}

export function useLogin() {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: async (creds: any) => {
            const res = await api.post("/auth/login", creds);
            return res.data;
        },
        onSuccess: (data) => {
            // Explicit redirect logic based on response Role
            // This is faster than waiting for useAuth to re-fetch
            queryClient.invalidateQueries({ queryKey: ["auth"] });

            const role = data.user.role;
            if (role === 'platform_admin') {
                router.push("/admin");
            } else {
                router.push("/app/dashboard"); // Guard will redirect to onboarding if needed
            }
        }
    });
}

export function useRegister() {
    const router = useRouter();

    return useMutation({
        mutationFn: async (data: any) => {
            const res = await api.post("/auth/register", data);
            return res.data;
        },
        onSuccess: () => {
            router.push("/login?registered=true");
        }
    });
}

export function useLogout() {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: async () => {
            await api.post("/auth/logout");
        },
        onSuccess: () => {
            queryClient.setQueryData(["auth", "me"], null);
            router.push("/login");
        }
    });
}
