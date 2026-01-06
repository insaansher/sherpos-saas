"use client";

import { useOfflineSync } from "@/hooks/use-offline-sync";
import { useNotification } from "@/components/ui/toast";
import { RefreshCcw, Wifi, WifiOff, AlertCircle } from "lucide-react";
import { useState } from "react";

export default function SyncDrawer() {
    const { showNotification } = useNotification();
    const { isOnline, pendingCount, syncNow, allOfflineSales } = useOfflineSync(showNotification);
    const [isOpen, setIsOpen] = useState(false);

    // Filter to show failing ones prominently if needed, but for now simple list
    const failed = allOfflineSales.filter(x => x.status === "failed");

    return (
        <div className="fixed bottom-4 left-4 z-50">
            {/* Toggle Button / Status Indicator */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg font-bold transition-all ${isOnline
                    ? (pendingCount > 0 ? "bg-yellow-100 text-yellow-800 animate-pulse" : "bg-green-100 text-green-800")
                    : "bg-red-100 text-red-800"
                    }`}
            >
                {isOnline ? <Wifi size={18} /> : <WifiOff size={18} />}
                {isOnline ? (pendingCount > 0 ? "Syncing..." : "Online") : "Offline"}
                {pendingCount > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{pendingCount}</span>}
            </button>

            {/* Drawer */}
            {isOpen && (
                <div className="absolute bottom-12 left-0 w-80 bg-white dark:bg-slate-900 border dark:border-slate-800 shadow-2xl rounded-xl overflow-hidden flex flex-col max-h-[500px]">
                    <div className="p-4 border-b dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
                        <h3 className="font-bold">Sync Center</h3>
                        {isOnline && pendingCount > 0 && (
                            <button onClick={syncNow} className="p-1 hover:bg-slate-200 rounded">
                                <RefreshCcw size={16} />
                            </button>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {allOfflineSales.length === 0 && <div className="text-center text-gray-400 py-8">No offline records.</div>}

                        {allOfflineSales.map(sale => (
                            <div key={sale.local_sale_id} className={`p-3 rounded border text-sm ${sale.status === 'failed' ? 'border-red-200 bg-red-50' :
                                sale.status === 'synced' ? 'border-green-200 bg-green-50' :
                                    'border-gray-200 bg-gray-50'
                                }`}>
                                <div className="flex justify-between font-medium mb-1">
                                    <span>#{sale.local_sale_id.slice(0, 5)}...</span>
                                    <span className={`capitalize ${sale.status === 'failed' ? 'text-red-700' :
                                        sale.status === 'synced' ? 'text-green-700' :
                                            'text-yellow-700'
                                        }`}>{sale.status}</span>
                                </div>
                                <div className="flex justify-between text-gray-500 text-xs">
                                    <span>${sale.computed_totals?.grand_total.toFixed(2)}</span>
                                    <span>{new Date(sale.created_at).toLocaleTimeString()}</span>
                                </div>
                                {sale.status === 'failed' && (
                                    <div className="mt-2 text-xs text-red-600 flex items-start gap-1 p-2 bg-red-100 rounded">
                                        <AlertCircle size={12} className="mt-0.5" />
                                        {sale.error_message || "Unknown Error"}
                                    </div>
                                )}
                                {sale.status === 'synced' && sale.server_data && (
                                    <div className="mt-1 text-xs text-green-700 font-mono">
                                        {'->'} {sale.server_data.invoice_number}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
