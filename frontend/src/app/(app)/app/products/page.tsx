"use client";

import { useOps } from "@/hooks/use-ops";
import { useState } from "react";
import { Plus } from "lucide-react";

export default function ProductsPage() {
    const { useProducts, createProduct } = useOps();
    const { data: products, isLoading } = useProducts();
    const [isCreateOpen, setCreateOpen] = useState(false);
    const [formData, setFormData] = useState({ name: "", sku: "", price: 0, cost_price: 0 });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createProduct.mutate(formData as any, {
            onSuccess: () => {
                setCreateOpen(false);
                setFormData({ name: "", sku: "", price: 0, cost_price: 0 });
            }
        });
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Products</h1>
                <button onClick={() => setCreateOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2">
                    <Plus size={16} /> New Product
                </button>
            </div>

            {isLoading ? <div>Loading...</div> : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="p-4">Name</th>
                                <th className="p-4">SKU</th>
                                <th className="p-4 text-right">Price</th>
                                <th className="p-4 text-right">Stock</th>
                                <th className="p-4 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {products?.map(p => (
                                <tr key={p.id} className="hover:bg-gray-50">
                                    <td className="p-4 font-medium">{p.name}</td>
                                    <td className="p-4 text-gray-500">{p.sku}</td>
                                    <td className="p-4 text-right">${p.price.toFixed(2)}</td>
                                    <td className="p-4 text-right font-bold">{p.stock_quantity}</td>
                                    <td className="p-4 text-center">
                                        <span className={`px-2 py-1 rounded text-xs ${p.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {p.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {isCreateOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-96">
                        <h2 className="text-xl font-bold mb-4">Create Product</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium">Name</label>
                                <input className="w-full border p-2 rounded" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">SKU</label>
                                <input className="w-full border p-2 rounded" required value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium">Price</label>
                                    <input type="number" step="0.01" className="w-full border p-2 rounded" required value={formData.price} onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Cost</label>
                                    <input type="number" step="0.01" className="w-full border p-2 rounded" required value={formData.cost_price} onChange={e => setFormData({ ...formData, cost_price: parseFloat(e.target.value) })} />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={() => setCreateOpen(false)} className="px-4 py-2 border rounded">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
