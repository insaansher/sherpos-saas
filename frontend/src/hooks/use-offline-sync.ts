import { useEffect, useState } from "react";
import { getQueuedSales, updateSaleStatus, getAllOfflineSales } from "@/lib/db";
import api from "@/lib/api";

export function useOfflineSync(showNotification?: (type: "offline" | "online") => void) {
    const [isOnline, setIsOnline] = useState(true);
    const [pendingCount, setPendingCount] = useState(0);
    const [allOfflineSales, setAllOfflineSales] = useState<any[]>([]);

    useEffect(() => {
        setIsOnline(navigator.onLine);
        const handleOnline = () => {
            setIsOnline(true);
            if (showNotification) showNotification("online");
            sync();
        };
        const handleOffline = () => {
            setIsOnline(false);
            if (showNotification) showNotification("offline");
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        refreshList(); // Initial load

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const refreshList = async () => {
        const queued = await getQueuedSales();
        setPendingCount(queued.length);
        const all = await getAllOfflineSales();
        setAllOfflineSales(all.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    };

    const sync = async () => {
        const queue = await getQueuedSales();
        if (queue.length === 0) return;

        for (const sale of queue) {
            await updateSaleStatus(sale.local_sale_id, "syncing");
            refreshList(); // Update UI

            try {
                const res = await api.post('/pos/offline-sync/sales', {
                    local_sale_id: sale.local_sale_id,
                    items: sale.items,
                    discount_amount: sale.discount_amount,
                    payment_method: sale.payment_method,
                    payment_received: sale.payment_received,
                    created_at: sale.created_at
                });

                await updateSaleStatus(sale.local_sale_id, "synced", undefined, res.data);
            } catch (err: any) {
                console.error("Sync failed", err);
                const msg = err.response?.data?.error || "Network Error";
                await updateSaleStatus(sale.local_sale_id, "failed", msg);
            }
        }
        refreshList();
    };

    return {
        isOnline,
        pendingCount,
        allOfflineSales,
        syncNow: sync,
        refreshList
    };
}
