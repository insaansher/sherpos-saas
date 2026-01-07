"use client";

import React from "react";

import { useCartStore } from "./useCartStore";
import { posApi } from "./posApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useOfflineSync } from "@/hooks/use-offline-sync";
import { queueOfflineSale } from "@/lib/db";
import { cn } from "@/lib/utils";
import { Trash2, Plus, Minus, CreditCard, Banknote, ShoppingCart, ArrowRight } from "lucide-react";
import { Button, Input, Card } from "@/components/ui/primitives";

export default function CartPanel() {
    const { state, removeItem, setQty, setDiscount, setPayment, clearCart } = useCartStore();
    const queryClient = useQueryClient();
    const [submitting, setSubmitting] = useState(false);
    const [lastInvoice, setLastInvoice] = useState<any>(null);

    // Totals Logic
    const subtotal = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxTotal = 0;
    const grandTotal = Math.max(0, subtotal + taxTotal - state.discount);
    const changeDue = Math.max(0, state.paymentReceived - grandTotal);
    const canCheckout = state.items.length > 0 && state.paymentReceived >= grandTotal;

    const { isOnline } = useOfflineSync();

    const checkoutMutation = useMutation({
        mutationFn: async () => {
            const doOfflineQueue = async () => {
                const localId = crypto.randomUUID();
                const offlineSale = {
                    local_sale_id: localId,
                    created_at: new Date().toISOString(),
                    items: state.items.map(i => ({ product_id: i.id, quantity: i.quantity })),
                    discount_amount: state.discount,
                    payment_method: state.paymentMethod,
                    payment_received: state.paymentReceived,
                    computed_totals: { grand_total: grandTotal },
                    status: "queued"
                };
                await queueOfflineSale(offlineSale);
                return { ...offlineSale, invoice_number: `OFF-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${localId.slice(0, 4)}`, final_amount: grandTotal, isOffline: true };
            };

            if (!isOnline && !navigator.onLine) {
                return doOfflineQueue();
            }

            try {
                return await posApi.createSale({
                    items: state.items.map(i => ({ product_id: i.id, quantity: i.quantity })),
                    discount_amount: state.discount,
                    payment_method: state.paymentMethod,
                    payment_received: state.paymentReceived
                });
            } catch (err: any) {
                if (err.code === "ERR_NETWORK" || !err.response || err.response.status >= 500) {
                    return doOfflineQueue();
                }
                throw err;
            }
        },
        onSuccess: (data) => {
            setLastInvoice(data);
            clearCart();
            queryClient.invalidateQueries({ queryKey: ["pos", "products"] });
            setSubmitting(false);
        },
        onError: (err: any) => {
            alert("Sale Failed: " + (err.response?.data?.error || err.message));
            setSubmitting(false);
        }
    });

    const handleCheckout = () => {
        if (!canCheckout || submitting) return;
        setSubmitting(true);
        checkoutMutation.mutate();
    };

    if (lastInvoice) {
        return (
            <div className="flex flex-col h-full bg-card p-10 items-center justify-center text-center animate-in fade-in zoom-in-95 duration-300">
                <div className="w-24 h-24 bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded-full flex items-center justify-center mb-6 shadow-inner ring-4 ring-green-50 dark:ring-green-900/10">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <h2 className="text-3xl font-bold tracking-tight mb-2">Sale Complete</h2>
                <p className="text-muted-foreground mb-8 text-lg font-mono">{lastInvoice.invoice_number}</p>

                <div className="text-6xl font-bold text-foreground mb-12 tracking-tighter">
                    ${lastInvoice.final_amount.toFixed(2)}
                </div>

                <Button
                    onClick={() => setLastInvoice(null)}
                    size="lg"
                    className="w-full h-14 text-lg rounded-full shadow-xl shadow-primary/20"
                >
                    Start New Sale
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-card border-l border-border shadow-2xl relative z-20">
            {/* Header */}
            <div className="p-6 border-b flex justify-between items-center bg-background/50 backdrop-blur-sm">
                <div>
                    <h2 className="text-xl font-bold tracking-tight">Current Order</h2>
                    <p className="text-sm text-muted-foreground">
                        {state.items.reduce((s, i) => s + i.quantity, 0)} items in cart
                    </p>
                </div>
                <Button variant="ghost" size="icon" onClick={clearCart} disabled={state.items.length === 0} className="text-muted-foreground hover:text-destructive">
                    <Trash2 size={20} />
                </Button>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {state.items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground/40 space-y-4">
                        <ShoppingCart size={64} strokeWidth={1} />
                        <p className="text-lg font-medium">Cart is empty</p>
                    </div>
                ) : (
                    state.items.map(item => (
                        <Card key={item.id} className="flex p-3 gap-3 hover:border-primary/50 transition-colors group">
                            {/* Quantity Controls */}
                            <div className="flex flex-col items-center justify-center bg-muted/50 rounded-lg p-1 gap-1">
                                <button
                                    onClick={() => setQty(item.id, item.quantity + 1)}
                                    className="w-8 h-8 flex items-center justify-center hover:bg-background rounded-md text-foreground transition-colors"
                                >
                                    <Plus size={14} />
                                </button>
                                <span className="font-bold text-sm w-full text-center">{item.quantity}</span>
                                <button
                                    onClick={() => item.quantity > 1 ? setQty(item.id, item.quantity - 1) : removeItem(item.id)}
                                    className="w-8 h-8 flex items-center justify-center hover:bg-background rounded-md text-muted-foreground hover:text-destructive transition-colors"
                                >
                                    <Minus size={14} />
                                </button>
                            </div>

                            <div className="flex-1 py-1">
                                <div className="font-semibold text-foreground leading-snug">{item.name}</div>
                                <div className="text-xs text-muted-foreground mt-1">${item.price.toFixed(2)} unit</div>
                            </div>

                            <div className="flex flex-col items-end justify-center py-1">
                                <div className="font-bold text-lg text-foreground tracking-tight">
                                    ${(item.price * item.quantity).toFixed(2)}
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            {/* Footer */}
            <div className="p-6 bg-muted/10 border-t space-y-6">

                {/* Calculations */}
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                        <span>Subtotal</span>
                        <span className="font-medium text-foreground">${subtotal.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between items-center text-muted-foreground">
                        <span>Discount</span>
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                className="w-20 h-8 text-right font-medium"
                                placeholder="0.00"
                                value={state.discount > 0 ? state.discount : ''}
                                onChange={e => setDiscount(parseFloat(e.target.value) || 0)}
                            />
                        </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t">
                        <span className="text-lg font-bold">Total</span>
                        <span className="text-3xl font-extrabold tracking-tighter text-primary">${grandTotal.toFixed(2)}</span>
                    </div>
                </div>

                {/* Payment Method */}
                <div className="grid grid-cols-2 gap-3 p-1 bg-muted rounded-xl">
                    <button
                        onClick={() => setPayment('cash', state.paymentReceived)}
                        className={cn(
                            "py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all",
                            state.paymentMethod === 'cash' ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Banknote size={16} /> Cash
                    </button>
                    <button
                        onClick={() => setPayment('card', state.paymentReceived)}
                        className={cn(
                            "py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all",
                            state.paymentMethod === 'card' ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <CreditCard size={16} /> Card
                    </button>
                </div>

                {/* Tendered Amount */}
                <div className="relative">
                    <label className="absolute -top-2.5 left-3 bg-card px-1 text-xs font-semibold text-muted-foreground">Amount Tendered</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">$</span>
                        <input
                            type="number"
                            className="w-full h-14 pl-8 pr-4 bg-background border rounded-xl text-xl font-bold text-right focus:ring-2 ring-primary outline-none transition-all"
                            placeholder={grandTotal.toFixed(2)}
                            value={state.paymentReceived || ''}
                            onChange={e => setPayment(state.paymentMethod, parseFloat(e.target.value) || 0)}
                        />
                    </div>
                </div>

                {changeDue > 0 && (
                    <div className="flex justify-between items-center bg-green-500/10 text-green-700 dark:text-green-400 px-4 py-3 rounded-xl border border-green-500/20">
                        <span className="font-semibold text-sm">Change Due</span>
                        <span className="font-bold text-xl">${changeDue.toFixed(2)}</span>
                    </div>
                )}

                {/* Action Button */}
                <Button
                    size="lg"
                    className={cn(
                        "w-full h-16 text-xl rounded-xl shadow-lg border-0",
                        "bg-[#0F172A] text-white dark:bg-primary",
                        !canCheckout || submitting ? "opacity-50 grayscale" : "hover:opacity-90 active:scale-[0.98]"
                    )}
                    disabled={!canCheckout || submitting}
                    onClick={handleCheckout}
                >
                    {submitting ? (
                        <>Processing...</>
                    ) : (
                        <div className="flex w-full justify-between items-center px-2">
                            <span>Charge</span>
                            <ArrowRight className="opacity-50" />
                        </div>
                    )}
                </Button>
            </div>

            {/* Blocking Overlay */}
            {submitting && (
                <div className="absolute inset-0 bg-background/80 z-50 flex items-center justify-center backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                        <p className="font-medium animate-pulse">Processing Transaction...</p>
                    </div>
                </div>
            )}
        </div>
    );
}
