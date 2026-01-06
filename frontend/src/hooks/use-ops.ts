import api from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Types matching backend models
export type Product = {
    id: string; name: string; sku: string; price: number; stock_quantity: number; cost_price: number;
    barcode?: string; is_active: boolean;
};

export type Supplier = {
    id: string; name: string; phone?: string; email?: string; address?: string;
};

export type LedgerEntry = {
    id: string; product_id: string; product_name: string;
    ref_type: string; ref_id: string;
    qty_change: number; qty_after: number; note?: string; created_at: string;
};

export type Purchase = {
    id: string; reference_no: string; grand_total: number; status: string; created_at: string; supplier_name?: string;
};

// Hook
export function useOps() {
    const queryClient = useQueryClient();

    // Products
    const useProducts = () => useQuery({
        queryKey: ['ops', 'products'],
        queryFn: async () => (await api.get<Product[]>('/products')).data
    });

    const createProduct = useMutation({
        mutationFn: (data: Partial<Product>) => api.post('/products', data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ops', 'products'] })
    });

    // Inventory
    const useLedger = (productId?: string) => useQuery({
        queryKey: ['ops', 'ledger', productId],
        queryFn: async () => (await api.get<LedgerEntry[]>(`/inventory/ledger?product_id=${productId || ''}`)).data
    });

    const adjustStock = useMutation({
        mutationFn: (data: any) => api.post('/inventory/adjustments', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ops', 'products'] });
            queryClient.invalidateQueries({ queryKey: ['ops', 'ledger'] });
        }
    });

    // Suppliers
    const useSuppliers = () => useQuery({
        queryKey: ['ops', 'suppliers'],
        queryFn: async () => (await api.get<Supplier[]>('/suppliers')).data
    });

    const createSupplier = useMutation({
        mutationFn: (data: Partial<Supplier>) => api.post('/suppliers', data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ops', 'suppliers'] })
    });

    // Purchases
    const usePurchases = () => useQuery({
        queryKey: ['ops', 'purchases'],
        queryFn: async () => (await api.get<Purchase[]>('/purchases')).data
    });

    const createPurchase = useMutation({
        mutationFn: (data: any) => api.post('/purchases', data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ops', 'purchases'] })
    });

    const receivePurchase = useMutation({
        mutationFn: (id: string) => api.put(`/purchases/${id}/receive`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ops', 'purchases'] });
            queryClient.invalidateQueries({ queryKey: ['ops', 'products'] }); // stock updates
        }
    });

    return {
        useProducts, createProduct,
        useLedger, adjustStock,
        useSuppliers, createSupplier,
        usePurchases, createPurchase, receivePurchase,
    };
}
