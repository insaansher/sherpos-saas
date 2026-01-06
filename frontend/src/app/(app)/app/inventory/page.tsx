"use client";

import { useOps } from "@/hooks/use-ops";
import { format } from "date-fns";

export default function LedgerPage() {
    const { useLedger } = useOps();
    const { data: ledger, isLoading } = useLedger(); // Get all ledger

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Inventory Ledger</h1>

            {isLoading ? <div>Loading...</div> : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="p-4">Date</th>
                                <th className="p-4">Product</th>
                                <th className="p-4">Type</th>
                                <th className="p-4 text-right">Change</th>
                                <th className="p-4 text-right">After</th>
                                <th className="p-4">Note</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {ledger?.map((l: any) => (
                                <tr key={l.id} className="hover:bg-gray-50">
                                    <td className="p-4 text-gray-500 whitespace-nowrap">
                                        {format(new Date(l.created_at), "MMM d, HH:mm")}
                                    </td>
                                    <td className="p-4 font-medium">{l.product_name}</td>
                                    <td className="p-4 capitalize">
                                        <span className={`px-2 py-0.5 rounded text-xs border ${l.ref_type === 'sale' ? 'bg-green-50 text-green-700 border-green-200' :
                                                l.ref_type === 'purchase' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                    'bg-gray-100 text-gray-700 border-gray-200'
                                            }`}>
                                            {l.ref_type.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className={`p-4 text-right font-bold ${l.qty_change > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                        {l.qty_change > 0 ? '+' : ''}{l.qty_change}
                                    </td>
                                    <td className="p-4 text-right text-gray-500">{l.qty_after}</td>
                                    <td className="p-4 text-gray-400 italic max-w-xs truncate">{l.note}</td>
                                </tr>
                            ))}
                            {ledger?.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-gray-400">No stock history found.</td></tr>}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
