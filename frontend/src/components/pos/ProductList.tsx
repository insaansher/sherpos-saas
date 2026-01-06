"use client";

import { useQuery } from "@tanstack/react-query";
import { posApi } from "./posApi";
import { useCartStore } from "./useCartStore";
import { useState } from "react";
import clsx from "clsx";
import { Search } from "lucide-react";

export default function ProductList() {
    const [search, setSearch] = useState("");
    const { addItem } = useCartStore();

    const { data: products, isLoading, error } = useQuery({
        queryKey: ["pos", "products", search],
        queryFn: () => posApi.getProducts(search),
    });

    if (error) return <div className="p-4 text-red-500 bg-red-100 rounded">Error loading products.</div>;

    return (
        <div className="flex flex-col h-full bg-slate-100 dark:bg-slate-900 border-r border-slate-300 dark:border-slate-800">
            {/* Header / Search */}
            <div className="p-4 bg-white dark:bg-slate-900 shadow-sm z-10">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search products by name, SKU or barcode..."
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        autoFocus
                    />
                </div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-4">
                {isLoading ? (
                    <div className="flex justify-center items-center h-40 text-slate-500">Loading catalog...</div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
                        {products?.length === 0 && <div className="col-span-full text-center text-slate-500 py-10">No products found.</div>}

                        {products?.map(product => (
                            <button
                                key={product.id}
                                onClick={() => addItem(product)}
                                disabled={product.stock_quantity <= 0}
                                className={clsx(
                                    "flex flex-col justify-between p-4 rounded-xl border text-left transition-all active:scale-95 h-36 relative overflow-hidden group",
                                    product.stock_quantity > 0
                                        ? "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:shadow-md cursor-pointer"
                                        : "bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 opacity-60 cursor-not-allowed"
                                )}
                            >
                                <div className="z-10">
                                    <h3 className="font-bold text-slate-800 dark:text-slate-100 leading-tight line-clamp-2">{product.name}</h3>
                                    <div className="text-xs text-slate-500 font-mono mt-1">{product.sku}</div>
                                </div>
                                <div className="flex justify-between items-end mt-2 z-10">
                                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">${product.price.toFixed(2)}</div>
                                    <div className={clsx("text-xs font-bold px-1.5 py-0.5 rounded", product.stock_quantity > 0 ? "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300" : "bg-red-100 text-red-600")}>
                                        {product.stock_quantity} Left
                                    </div>
                                </div>
                                {/* Click Ripple Effect logic could go here, omitting for simple CSS hover */}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
