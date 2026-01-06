"use client";

import { useOps } from "@/hooks/use-ops";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export default function ReturnsPage() {
    const { useProducts } = useOps();
    const queryClient = useQueryClient();
    const [tab, setTab] = useState<'sale' | 'purchase'>('sale');

    // Form
    const [refId, setRefId] = useState("");
    const [reason, setReason] = useState("Damaged");
    const [productId, setProductId] = useState("");
    const [qty, setQty] = useState(1);

    const { data: products } = useProducts();

    const returnMutation = useMutation({
        mutationFn: (data: any) => api.post(tab === 'sale' ? '/returns/sales' : '/returns/purchases', data),
        onSuccess: () => {
            alert('Return Processed Successfully');
            setRefId(""); setQty(1);
            queryClient.invalidateQueries({ queryKey: ['ops', 'products'] });
        },
        onError: (err: any) => alert(err.response?.data?.error || "Failed")
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        returnMutation.mutate({
            [tab === 'sale' ? 'sale_id' : 'purchase_id']: refId,
            reason,
            items: [{ product_id: productId, quantity: qty }]
        });
    };

    return (
        <div className="max-w-xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Process Returns</h1>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="flex border-b">
                    <button
                        onClick={() => setTab('sale')}
                        className={`flex-1 p-4 font-bold text-center ${tab === 'sale' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                    >
                        Sale Return
                    </button>
                    <button
                        onClick={() => setTab('purchase')}
                        className={`flex-1 p-4 font-bold text-center ${tab === 'purchase' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                    >
                        Purchase Return
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="bg-blue-50 p-4 rounded text-sm text-blue-800">
                        {tab === 'sale' ?
                            "Processing a Sale Return will INCREASE stock inventory." :
                            "Processing a Purchase Return will DECREASE stock inventory."
                        }
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            {tab === 'sale' ? "Sale ID (UUID)" : "Purchase ID (UUID)"}
                        </label>
                        <input className="w-full border p-2 rounded" required value={refId} onChange={e => setRefId(e.target.value)} placeholder="e.g. 550e8400-e29b..." />
                        <p className="text-xs text-gray-400 mt-1">Copy ID from Sales/Purchase list (Debug mode)</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Product</label>
                        <select className="w-full border p-2 rounded" required value={productId} onChange={e => setProductId(e.target.value)}>
                            <option value="">Select Product...</option>
                            {products?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Quantity</label>
                            <input type="number" min="1" className="w-full border p-2 rounded" required value={qty} onChange={e => setQty(parseInt(e.target.value))} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Reason</label>
                            <select className="w-full border p-2 rounded" value={reason} onChange={e => setReason(e.target.value)}>
                                <option>Damaged</option>
                                <option>Wrong Item</option>
                                <option>Expired</option>
                                <option>Other</option>
                            </select>
                        </div>
                    </div>

                    <button disabled={returnMutation.isPending} className="w-full bg-blue-600 text-white font-bold py-3 rounded hover:bg-blue-700">
                        {returnMutation.isPending ? "Processing..." : "Submit Return"}
                    </button>
                </form>
            </div>
        </div>
    );
}
