"use client";

import { usePublicPlans } from "@/hooks/use-plans";
import { useState } from "react";
import clsx from "clsx";

export default function PricingPage() {
    const [currency, setCurrency] = useState("USD");
    const { data: plans, isLoading } = usePublicPlans(currency);

    return (
        <div className="max-w-7xl mx-auto py-20 px-4">
            <div className="text-center mb-16">
                <h1 className="text-5xl font-extrabold mb-6 tracking-tight text-gray-900">Simple, Transparent Pricing</h1>
                <p className="text-xl text-gray-500 mb-8">Choose the plan that fits your business needs.</p>

                <div className="inline-flex bg-gray-100 p-1 rounded-lg">
                    {['USD', 'LKR'].map((c) => (
                        <button
                            key={c}
                            onClick={() => setCurrency(c)}
                            className={clsx(
                                "px-6 py-2 rounded-md font-medium text-sm transition-all",
                                currency === c ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-900"
                            )}
                        >
                            {c}
                        </button>
                    ))}
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full"></div></div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {plans?.map((plan) => (
                        <div key={plan.id} className="relative bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-xl transition-shadow flex flex-col">
                            {plan.package_type === 'advanced' && (
                                <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl uppercase tracking-wider">
                                    Recommended
                                </div>
                            )}
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                            <div className="mb-6">
                                <span className="text-4xl font-extrabold text-gray-900">
                                    {currency === 'USD' ? '$' : 'Rs.'}{plan.price}
                                </span>
                                <span className="text-gray-500 font-medium">/{plan.duration_type === '2y' ? '2 yrs' : plan.duration_type.replace('ly', '')}</span>
                            </div>

                            <ul className="space-y-4 mb-8 flex-1">
                                <FeatureItem enabled={true} text="POS System" />
                                <FeatureItem enabled={true} text="Inventory Management" />
                                <FeatureItem enabled={!!plan.features.multi_branch} text="Multi-Branch Support" />
                                <FeatureItem enabled={!!plan.features.stock} text="Stock Transfers" />
                                <FeatureItem enabled={!!plan.features.reports} text="Advanced Reporting" />
                            </ul>

                            <a href="/register" className={clsx(
                                "block w-full py-3 rounded-xl font-bold text-center transition-colors",
                                plan.package_type === 'advanced'
                                    ? "bg-blue-600 text-white hover:bg-blue-700"
                                    : "bg-gray-50 text-gray-900 hover:bg-gray-100 border border-gray-200"
                            )}>
                                Start Free Trial
                            </a>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function FeatureItem({ enabled, text }: { enabled: boolean, text: string }) {
    return (
        <li className={clsx("flex items-center gap-3 text-sm", enabled ? "text-gray-700" : "text-gray-400 line-through decoration-gray-300")}>
            <div className={clsx("w-5 h-5 rounded-full flex items-center justify-center shrink-0", enabled ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400")}>
                {enabled ? '✓' : 'x'}
            </div>
            {text}
        </li>
    );
}
