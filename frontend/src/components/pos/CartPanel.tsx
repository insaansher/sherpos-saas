"use client";

import { useCartStore } from "./useCartStore";
import { posApi } from "./posApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import clsx from "clsx";
import { Trash2, Plus, Minus, CreditCard, Banknote } from "lucide-react";

export default function CartPanel() {
    const { state, removeItem, setQty, setDiscount, setPayment, clearCart } = useCartStore();
    const queryClient = useQueryClient();
    const [submitting, setSubmitting] = useState(false);
    const [lastInvoice, setLastInvoice] = useState<any>(null);

    // Totals Logic
    const subtotal = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    // Assuming simple tax for now (e.g. 0% or handled in price). Prompt said "taxRate" in store but backend doesn't support tax logic yet. 
    // I'll stick to 0 tax to match backend until Phase 5.
    const taxTotal = 0;
    const grandTotal = Math.max(0, subtotal + taxTotal - state.discount);

    const changeDue = Math.max(0, state.paymentReceived - grandTotal);
    const canCheckout = state.items.length > 0 && state.paymentReceived >= grandTotal;

    const checkoutMutation = useMutation({
        mutationFn: () => posApi.createSale({
            items: state.items.map(i => ({ product_id: i.id, quantity: i.quantity })),
            discount_amount: state.discount,
            payment_method: state.paymentMethod,
            payment_received: state.paymentReceived
        }),
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
            <div className="flex flex-col h-full bg-white dark:bg-slate-950 p-8 items-center justify-center text-center">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 text-4xl">✓</div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Sale Complete</h2>
                <p className="text-slate-500 mb-6">Invoice: {lastInvoice.invoice_number}</p>
                <div className="text-5xl font-bold text-slate-800 dark:text-white mb-8">${lastInvoice.final_amount.toFixed(2)}</div>
                <button
                    onClick={() => setLastInvoice(null)}
                    className="w-full max-w-sm bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg"
                >
                    Start New Sale
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-950 border-l border-slate-300 dark:border-slate-800 shadow-2xl relative">
            {/* Header */}
            <div className="p-4 border-b dark:border-slate-800 bg-slate-50 dark:bg-black/20">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Current Order</h2>
                <div className="text-sm text-slate-500">{state.items.reduce((s, i) => s + i.quantity, 0)} Items</div>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {state.items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-50">
                        <div className="text-6xl mb-4">🛒</div>
                        <div>Cart is empty</div>
                    </div>
                ) : (
                    state.items.map(item => (
                        <div key={item.id} className="flex justify-between items-start group">
                            <div className="flex-1 pr-2">
                                <div className="font-medium text-slate-900 dark:text-white">{item.name}</div>
                                <div className="text-xs text-slate-500">${item.price.toFixed(2)} / unit</div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <div className="font-bold text-slate-900 dark:text-white">${(item.price * item.quantity).toFixed(2)}</div>
                                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 rounded-lg p-0.5 border dark:border-slate-700">
                                    <button
                                        onClick={() => item.quantity > 1 ? setQty(item.id, item.quantity - 1) : removeItem(item.id)}
                                        className="w-7 h-7 flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300 transition"
                                    >
                                        <Minus size={14} />
                                    </button>
                                    <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                                    <button
                                        onClick={() => setQty(item.id, item.quantity + 1)}
                                        className="w-7 h-7 flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300 transition"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Footer / Controls */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t dark:border-slate-800 space-y-3 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
                {/* Calculations */}
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                    </div>
                    {/* Discount Input */}
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                        <span>Discount</span>
                        <div className="flex items-center gap-1">
                            <span className="text-xs">-$</span>
                            <input
                                type="number"
                                min="0"
                                className="w-16 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded px-1 py-0.5 text-right focus:ring-2 ring-blue-500 outline-none"
                                value={state.discount}
                                onChange={e => setDiscount(parseFloat(e.target.value) || 0)}
                            />
                        </div>
                    </div>

                    <div className="flex justify-between text-xl font-bold text-slate-900 dark:text-white pt-2 border-t dark:border-slate-700">
                        <span>Grand Total</span>
                        <span>${grandTotal.toFixed(2)}</span>
                    </div>
                </div>

                {/* Payment Section */}
                <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border dark:border-slate-700 space-y-3">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPayment('cash', state.paymentReceived)}
                            className={clsx("flex-1 py-2 text-sm rounded flex items-center justify-center gap-2 border", state.paymentMethod === 'cash' ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300" : "hover:bg-slate-50 dark:hover:bg-slate-700 dark:border-slate-600")}
                        >
                            <Banknote size={16} /> Cash
                        </button>
                        <button
                            onClick={() => setPayment('card', state.paymentReceived)}
                            className={clsx("flex-1 py-2 text-sm rounded flex items-center justify-center gap-2 border", state.paymentMethod === 'card' ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300" : "hover:bg-slate-50 dark:hover:bg-slate-700 dark:border-slate-600")}
                        >
                            <CreditCard size={16} /> Card
                        </button>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                        <label className="text-xs font-bold uppercase text-slate-500">Received</label>
                        <div className="flex-1 relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                            <input
                                type="number"
                                className="w-full pl-7 pr-3 py-2 bg-slate-100 dark:bg-slate-900 border dark:border-slate-700 rounded-lg font-bold text-right outline-none focus:ring-2 focus:ring-blue-500"
                                value={state.paymentReceived || ''}
                                placeholder={grandTotal.toFixed(2)}
                                onChange={e => setPayment(state.paymentMethod, parseFloat(e.target.value) || 0)}
                            />
                        </div>
                    </div>
                    {changeDue > 0 && (
                        <div className="flex justify-between text-sm font-bold text-green-600 dark:text-green-400">
                            <span>Change Due</span>
                            <span>${changeDue.toFixed(2)}</span>
                        </div>
                    )}
                </div>

                {/* Checkout Button */}
                <button
                    disabled={!canCheckout || submitting}
                    onClick={handleCheckout}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-lg font-bold py-4 rounded-xl shadow-lg shadow-blue-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                    {submitting ? "Processing..." : `Complete Sale ($${grandTotal.toFixed(2)})`}
                </button>
            </div>

            {/* Blocking Overlay */}
            {submitting && (
                <div className="absolute inset-0 bg-white/50 dark:bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                </div>
            )}
        </div>
    );
}
