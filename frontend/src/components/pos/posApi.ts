import api from "@/lib/api";

export interface POSProduct {
    id: string;
    tenant_id: string;
    name: string;
    sku: string;
    barcode: string;
    price: number;
    stock_quantity: number;
}

export interface SaleItemRequest {
    product_id: string;
    quantity: number;
}

export interface CreateSaleRequest {
    items: SaleItemRequest[];
    discount_amount: number;
    payment_method: string;
    payment_received: number;
}

export const posApi = {
    getProducts: async (search: string = "") => {
        try {
            const res = await api.get<POSProduct[]>(`/pos/products?search=${encodeURIComponent(search)}`);
            // Cache only if full list (no search) to ensure integrity, or just cache always?
            // Strategy: Cache full list initially. Search offline is limited to local cache logic (we'll implement local filter if needed)
            // For MVP: Cache what we fetch.
            if (!search) {
                const { cacheProducts } = await import("@/lib/db");
                await cacheProducts(res.data);
            }
            return res.data;
        } catch (err) {
            console.warn("Offline or API Error, using cache", err);
            const { getCachedProducts } = await import("@/lib/db");
            const cached = await getCachedProducts();
            if (search) {
                const lower = search.toLowerCase();
                return cached.filter((p: POSProduct) => p.name.toLowerCase().includes(lower) || p.sku.toLowerCase().includes(lower));
            }
            return cached as POSProduct[];
        }
    },

    createSale: async (data: CreateSaleRequest) => {
        const res = await api.post("/pos/sales", data);
        return res.data;
    }
};
