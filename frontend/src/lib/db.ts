import { openDB } from "idb";

const DB_NAME = "sherpos_pos";
const DB_VERSION = 1;

export async function initDB() {
    return openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            // 1. Products Cache
            if (!db.objectStoreNames.contains("products_cache")) {
                db.createObjectStore("products_cache", { keyPath: "id" });
            }
            // 2. Offline Sales Queue
            if (!db.objectStoreNames.contains("offline_sales_queue")) {
                const store = db.createObjectStore("offline_sales_queue", { keyPath: "local_sale_id" });
                store.createIndex("status", "status");
            }
        },
    });
}

export async function cacheProducts(products: any[]) {
    const db = await initDB();
    const tx = db.transaction("products_cache", "readwrite");
    const store = tx.objectStore("products_cache");
    await store.clear();
    for (const p of products) {
        store.put(p);
    }
    await tx.done;
}

export async function getCachedProducts() {
    const db = await initDB();
    return db.getAll("products_cache");
}

export async function queueOfflineSale(sale: any) {
    const db = await initDB();
    return db.put("offline_sales_queue", sale);
}

export async function getQueuedSales() {
    const db = await initDB();
    return db.getAllFromIndex("offline_sales_queue", "status", "queued");
}

export async function updateSaleStatus(localId: string, status: string, error?: string, serverData?: any) {
    const db = await initDB();
    const sale = await db.get("offline_sales_queue", localId);
    if (!sale) return;
    sale.status = status;
    if (error) sale.error_message = error;
    if (serverData) sale.server_data = serverData;
    await db.put("offline_sales_queue", sale);
}

export async function getAllOfflineSales() {
    const db = await initDB();
    return db.getAll("offline_sales_queue"); // For UI list
}
