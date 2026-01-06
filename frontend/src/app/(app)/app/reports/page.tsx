"use client";

import { useOps } from "@/hooks/use-ops";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { format } from "date-fns";
import { AlertTriangle, TrendingUp, DollarSign } from "lucide-react";

export default function ReportsPage() {
    // Daily Sales
    const { data: dailySales } = useQuery({
        queryKey: ['reports', 'daily'],
        queryFn: async () => (await api.get<any[]>('/reports/daily-sales')).data
    });

    // Stock Alerts
    const { data: alerts } = useQuery({
        queryKey: ['reports', 'alerts'],
        queryFn: async () => (await api.get<any[]>('/reports/stock-alerts')).data
    });

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Reports</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Sales Chart (Table for MVP) */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <TrendingUp className="text-blue-600" /> Daily Sales (Last 30 Days)
                    </h2>
                    <div className="overflow-y-auto max-h-80">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="p-3">Date</th>
                                    <th className="p-3 text-right">Count</th>
                                    <th className="p-3 text-right">Revenue</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {dailySales?.map((d, i) => (
                                    <tr key={i}>
                                        <td className="p-3 text-gray-600">{d.date}</td>
                                        <td className="p-3 text-right">{d.transaction_count}</td>
                                        <td className="p-3 text-right font-bold">${d.total_sales.toFixed(2)}</td>
                                    </tr>
                                ))}
                                {dailySales?.length === 0 && <tr><td colSpan={3} className="p-4 text-center text-gray-400">No sales data.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Stock Alerts */}
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-red-700">
                        <AlertTriangle /> Low Stock Alerts (&lt; 10)
                    </h2>
                    <div className="overflow-y-auto max-h-80">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-red-50 sticky top-0 text-red-900">
                                <tr>
                                    <th className="p-3">SKU</th>
                                    <th className="p-3">Product</th>
                                    <th className="p-3 text-right">Stock</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {alerts?.map((a: any, i: number) => (
                                    <tr key={i}>
                                        <td className="p-3 text-gray-500 font-mono text-xs">{a.sku}</td>
                                        <td className="p-3 font-medium">{a.name}</td>
                                        <td className="p-3 text-right font-bold text-red-600">{a.stock}</td>
                                    </tr>
                                ))}
                                {alerts?.length === 0 && <tr><td colSpan={3} className="p-4 text-center text-green-600">All stock levels healthy.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
