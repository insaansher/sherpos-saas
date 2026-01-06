"use client";

import { useOps } from "@/hooks/use-ops";
import { useState } from "react";
import { Plus, Check } from "lucide-react";
import { format } from "date-fns";

export default function PurchasesPage() {
    const { usePurchases, receivePurchase, createPurchase, useSuppliers, useProducts } = useOps();
    const { data: purchases, isLoading } = usePurchases();
    const { data: suppliers } = useSuppliers();
    const { data: products } = useProducts();

    // Create Mode
    const [isCreateOpen, setCreateOpen] = useState(false);
    const [refNo, setRefNo] = useState("");
    const [supplierId, setSupplierId] = useState("");
    const [items, setItems] = useState<{ product_id: string, quantity: number, cost_price: number }[]>([]);

    // Temp Item State
    const [selProd, setSelProd] = useState("");
    const [selQty, setSelQty] = useState(1);
    const [selCost, setSelCost] = useState(0);

    const handleAddLine = () => {
        if (!selProd) return;
        setItems([...items, { product_id: selProd, quantity: selQty, cost_price: selCost }]);
        setSelProd(""); setSelQty(1); setSelCost(0);
    };

    const handleCreate = () => {
        createPurchase.mutate({
            reference_no: refNo,
            supplier_id: supplierId,
            status: 'draft', // default to draft, allow receive later
            items: items
        }, {
            onSuccess: () => {
                setCreateOpen(false);
                setRefNo(""); setSupplierId(""); setItems([]);
            }
        });
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Purchases (PO)</h1>
                <button onClick={() => setCreateOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2">
                    <Plus size={16} /> New PO
                </button>
            </div>

            {isLoading ? <div>Loading...</div> : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="p-4">Ref No</th>
                                <th className="p-4">Supplier</th>
                                <th className="p-4">Date</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Total</th>
                                <th className="p-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {purchases?.map(p => (
                                <tr key={p.id} className="hover:bg-gray-50">
                                    <td className="p-4 font-mono font-medium">{p.reference_no}</td>
                                    <td className="p-4">{p.supplier_name || "-"}</td>
                                    <td className="p-4 text-gray-500">{format(new Date(p.created_at), "MMM d, yyyy")}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs uppercase font-bold ${p.status === 'received' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">${p.grand_total.toFixed(2)}</td>
                                    <td className="p-4 text-right">
                                        {p.status === 'draft' && (
                                            <button
                                                onClick={() => receivePurchase.mutate(p.id)}
                                                disabled={receivePurchase.isPending}
                                                className="text-blue-600 hover:text-blue-800 text-sm font-bold flex items-center gap-1 justify-end ml-auto"
                                            >
                                                <Check size={14} /> Receive Stock
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {purchases?.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-gray-400">No purchase orders found.</td></tr>}
                        </tbody>
                    </table>
                </div>
            )}

            {isCreateOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-[600px] max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">Create Purchase Order</h2>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium">Ref No</label>
                                <input className="w-full border p-2 rounded" placeholder="PO-001" value={refNo} onChange={e => setRefNo(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Supplier</label>
                                <select className="w-full border p-2 rounded" value={supplierId} onChange={e => setSupplierId(e.target.value)}>
                                    <option value="">Select Supplier</option>
                                    {suppliers?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="border-t border-b py-4 my-4 bg-gray-50 p-4 rounded">
                            <h3 className="font-bold text-sm mb-2">Add Items</h3>
                            <div className="flex gap-2 mb-2">
                                <select className="flex-1 border p-2 rounded" value={selProd} onChange={e => {
                                    setSelProd(e.target.value);
                                    const p = products?.find(x => x.id === e.target.value);
                                    if (p) setSelCost(p.cost_price);
                                }}>
                                    <option value="">Product...</option>
                                    {products?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                                <input type="number" className="w-20 border p-2 rounded" placeholder="Qty" value={selQty} onChange={e => setSelQty(parseInt(e.target.value))} />
                                <input type="number" className="w-24 border p-2 rounded" placeholder="Cost" value={selCost} onChange={e => setSelCost(parseFloat(e.target.value))} />
                                <button onClick={handleAddLine} className="bg-slate-800 text-white px-3 rounded">+</button>
                            </div>

                            <div className="space-y-1">
                                {items.map((it, idx) => (
                                    <div key={idx} className="flex justify-between text-sm bg-white p-2 border rounded">
                                        <span>{products?.find(p => p.id === it.product_id)?.name}</span>
                                        <span className="text-gray-500">{it.quantity} x ${it.cost_price}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2">
                            <button onClick={() => setCreateOpen(false)} className="px-4 py-2 border rounded">Cancel</button>
                            <button onClick={handleCreate} disabled={items.length === 0 || !refNo} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">Create Draft</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
