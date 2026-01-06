"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export interface DBProduct {
    id: string;
    tenant_id: string;
    name: string;
    sku: string;
    barcode: string;
    price: number;
    stock_quantity: number;
}

export function usePOSProducts(search: string = "") {
    return useQuery({
        queryKey: ["pos", "products", search],
        queryFn: async () => {
            const res = await api.get(`/pos/products?search=${search}`);
            return res.data as DBProduct[];
        }
    });
}

export function useCreateSale() {
    return useMutation({
        mutationFn: async (data: any) => {
            const res = await api.post("/pos/sales", data);
            return res.data;
        }
    });
}
