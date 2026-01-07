"use client";

import React from "react";

import { useQuery } from "@tanstack/react-query";
import { posApi } from "./posApi";
import { useCartStore } from "./useCartStore";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Search, Loader2, PackageOpen, LayoutGrid, ListFilter } from "lucide-react";
import { Input } from "@/components/ui/primitives";
import { Card } from "@/components/ui/primitives";

export default function ProductList() {
    const [search, setSearch] = useState("");
    const { addItem } = useCartStore();

    const { data: products, isLoading, error } = useQuery({
        queryKey: ["pos", "products", search],
        queryFn: () => posApi.getProducts(search),
    });

    if (error) return (
        <div className="flex flex-col items-center justify-center h-full text-destructive p-8 bg-destructive/5 rounded-xl border border-destructive/20 m-4">
            <p className="font-semibold text-lg">Failed to load catalog</p>
            <p className="text-sm opacity-80 mt-1">Check internet connection or try again.</p>
        </div>
    );

    return (
        <div className="flex flex-col h-full bg-muted/20">
            {/* Header / Search */}
            <header className="p-4 bg-background/80 backdrop-blur-md border-b sticky top-0 z-10 space-y-4">
                <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                        <Input
                            type="text"
                            placeholder="Search products..."
                            className="w-full h-12 pl-12 pr-4 text-lg rounded-full shadow-sm bg-muted/50 border-transparent focus:bg-background focus:border-primary transition-all"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>
            </header>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-primary" />
                        <p className="text-sm font-medium animate-pulse">Loading collection...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 pb-24">
                        {products?.length === 0 && (
                            <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground opacity-50">
                                <PackageOpen size={48} strokeWidth={1} />
                                <p className="mt-4 font-medium text-lg">No products found</p>
                                <p className="text-sm">Try searching for a different item</p>
                            </div>
                        )}

                        {products?.map(product => {
                            const hasStock = product.stock_quantity > 0;
                            return (
                                <button
                                    key={product.id}
                                    onClick={() => addItem(product)}
                                    disabled={!hasStock}
                                    className={cn(
                                        "group relative flex flex-col justify-between p-5 rounded-2xl border text-left transition-all duration-300 h-[180px] hover:shadow-xl active:scale-95 outline-none focus-visible:ring-4 ring-primary/20",
                                        hasStock
                                            ? "bg-card border-border hover:border-primary/50 hover:-translate-y-1"
                                            : "bg-muted/50 border-transparent opacity-60 cursor-not-allowed"
                                    )}
                                >
                                    <div className="w-full">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase bg-muted px-2 py-0.5 rounded-full">
                                                ID: {product.sku || 'N/A'}
                                            </div>
                                        </div>
                                        <h3 className={cn(
                                            "font-bold text-foreground leading-snug line-clamp-2",
                                            product.name.length < 20 ? "text-lg" : "text-base"
                                        )}>
                                            {product.name}
                                        </h3>
                                    </div>

                                    <div className="flex justify-between items-end mt-4">
                                        <div className="text-xl font-bold text-primary tracking-tight">
                                            ${product.price.toFixed(2)}
                                        </div>

                                        <div className={cn(
                                            "text-xs font-bold px-2 py-1 rounded-md",
                                            hasStock
                                                ? "bg-success/10 text-success"
                                                : "bg-destructive/10 text-destructive"
                                        )}>
                                            {product.stock_quantity} left
                                        </div>
                                    </div>

                                    {/* Decoration */}
                                    <div className="absolute inset-0 rounded-2xl ring-2 ring-primary opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                </button>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
