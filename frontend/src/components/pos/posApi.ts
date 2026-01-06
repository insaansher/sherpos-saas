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
        const res = await api.get<POSProduct[]>(`/pos/products?search=${encodeURIComponent(search)}`);
        return res.data;
    },

    createSale: async (data: CreateSaleRequest) => {
        const res = await api.post("/pos/sales", data);
        return res.data;
    }
};
