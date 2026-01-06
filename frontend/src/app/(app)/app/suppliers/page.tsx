"use client";

import { useOps } from "@/hooks/use-ops";
import { useState } from "react";
import { Plus } from "lucide-react";

export default function SuppliersPage() {
    const { useSuppliers, createSupplier } = useOps();
    const { data: suppliers, isLoading } = useSuppliers();
    const [isCreateOpen, setCreateOpen] = useState(false);
    const [formData, setFormData] = useState({ name: "", email: "", phone: "", address: "" });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createSupplier.mutate(formData, {
            onSuccess: () => {
                setCreateOpen(false);
                setFormData({ name: "", email: "", phone: "", address: "" });
            }
        });
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Suppliers</h1>
                <button onClick={() => setCreateOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2">
                    <Plus size={16} /> New Supplier
                </button>
            </div>

            {isLoading ? <div>Loading...</div> : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="p-4">Name</th>
                                <th className="p-4">Email</th>
                                <th className="p-4">Phone</th>
                                <th className="p-4">Address</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {suppliers?.map(s => (
                                <tr key={s.id} className="hover:bg-gray-50">
                                    <td className="p-4 font-medium">{s.name}</td>
                                    <td className="p-4 text-gray-500">{s.email}</td>
                                    <td className="p-4 text-gray-500">{s.phone}</td>
                                    <td className="p-4 text-gray-500 max-w-xs truncate">{s.address}</td>
                                </tr>
                            ))}
                            {suppliers?.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-gray-400">No suppliers found.</td></tr>}
                        </tbody>
                    </table>
                </div>
            )}

            {isCreateOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-96">
                        <h2 className="text-xl font-bold mb-4">Add Supplier</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium">Name</label>
                                <input className="w-full border p-2 rounded" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Email</label>
                                <input className="w-full border p-2 rounded" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Phone</label>
                                <input className="w-full border p-2 rounded" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Address</label>
                                <textarea className="w-full border p-2 rounded" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={() => setCreateOpen(false)} className="px-4 py-2 border rounded">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
