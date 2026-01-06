"use client";

import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { POSProduct } from "./posApi";

export interface CartItem {
    id: string; // product id
    name: string;
    price: number;
    quantity: number;
    stockMax: number;
    sku: string;
}

interface CartState {
    items: CartItem[];
    discount: number;
    paymentMethod: string;
    paymentReceived: number;
}

type CartAction =
    | { type: 'ADD_ITEM'; product: POSProduct }
    | { type: 'REMOVE_ITEM'; id: string }
    | { type: 'SET_QTY'; id: string; qty: number }
    | { type: 'CLEAR_CART' }
    | { type: 'SET_DISCOUNT'; amount: number }
    | { type: 'SET_PAYMENT'; method: string; received: number };

const initialState: CartState = {
    items: [],
    discount: 0,
    paymentMethod: 'cash',
    paymentReceived: 0,
};

function cartReducer(state: CartState, action: CartAction): CartState {
    switch (action.type) {
        case 'ADD_ITEM': {
            const existingIdx = state.items.findIndex(i => i.id === action.product.id);
            if (existingIdx >= 0) {
                const item = state.items[existingIdx];
                if (item.quantity >= item.stockMax) return state; // Stock limit

                const newItems = [...state.items];
                newItems[existingIdx] = { ...item, quantity: item.quantity + 1 };
                return { ...state, items: newItems };
            }
            if (action.product.stock_quantity <= 0) return state; // Out of stock
            return {
                ...state,
                items: [...state.items, {
                    id: action.product.id,
                    name: action.product.name,
                    price: action.product.price,
                    quantity: 1,
                    stockMax: action.product.stock_quantity,
                    sku: action.product.sku
                }]
            };
        }
        case 'REMOVE_ITEM':
            return { ...state, items: state.items.filter(i => i.id !== action.id) };
        case 'SET_QTY':
            if (action.qty <= 0) return state; // Min 1
            return {
                ...state,
                items: state.items.map(i => {
                    if (i.id === action.id) {
                        return { ...i, quantity: Math.min(action.qty, i.stockMax) };
                    }
                    return i;
                })
            };
        case 'CLEAR_CART':
            return initialState;
        case 'SET_DISCOUNT':
            return { ...state, discount: Math.max(0, action.amount) };
        case 'SET_PAYMENT':
            return { ...state, paymentMethod: action.method, paymentReceived: action.received };
        default:
            return state;
    }
}

const CartContext = createContext<{
    state: CartState;
    addItem: (p: POSProduct) => void;
    removeItem: (id: string) => void;
    setQty: (id: string, qty: number) => void;
    clearCart: () => void;
    setDiscount: (amount: number) => void;
    setPayment: (method: string, received: number) => void;
} | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(cartReducer, initialState);

    const addItem = (p: POSProduct) => dispatch({ type: 'ADD_ITEM', product: p });
    const removeItem = (id: string) => dispatch({ type: 'REMOVE_ITEM', id });
    const setQty = (id: string, qty: number) => dispatch({ type: 'SET_QTY', id, qty });
    const clearCart = () => dispatch({ type: 'CLEAR_CART' });
    const setDiscount = (amount: number) => dispatch({ type: 'SET_DISCOUNT', amount });
    const setPayment = (method: string, received: number) => dispatch({ type: 'SET_PAYMENT', method, received });

    return (
        <CartContext.Provider value={{ state, addItem, removeItem, setQty, clearCart, setDiscount, setPayment }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCartStore() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCartStore must be used within CartProvider");
    return ctx;
}
