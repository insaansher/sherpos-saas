"use client";

import { CartProvider } from "@/components/pos/useCartStore";
import ProductList from "@/components/pos/ProductList";
import CartPanel from "@/components/pos/CartPanel";
import SyncCenter from "@/components/pos/SyncCenter";
import { NotificationProvider } from "@/components/ui/toast";

export default function POSPage() {
    return (
        <NotificationProvider>
            <CartProvider>
                <div className="flex h-screen w-full overflow-hidden font-sans">
                    {/* Left: Product Grid (Flexible width) */}
                    <div className="flex-1 h-full overflow-hidden">
                        <ProductList />
                    </div>

                    {/* Right: Cart Panel (Fixed width 400px) */}
                    <div className="w-[400px] h-full flex-shrink-0 z-20 shadow-2xl">
                        <CartPanel />
                    </div>
                </div>
                <SyncCenter />
            </CartProvider>
        </NotificationProvider>
    );
}
