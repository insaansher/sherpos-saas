"use client";

import { usePublicPlans, useTenantBilling, useChoosePlan } from "@/hooks/use-plans";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import clsx from "clsx";

export default function BillingPage() {
    const { tenant } = useAuth();
    const { data: billing, isLoading: loadingBilling } = useTenantBilling();
    const [currency, setCurrency] = useState(tenant?.currency || "USD"); // Default to tenant currency if set
    const { data: plans } = usePublicPlans(currency);
    const { mutate: choosePlan, isPending } = useChoosePlan();

    if (loadingBilling) return <div>Loading...</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Billing & Subscription</h1>

            {/* Current Subscription Card */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-10">
                <h2 className="text-lg font-semibold mb-4 text-gray-800">Current Plan</h2>
                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <div className="text-3xl font-bold text-blue-600">{billing?.plan_name || "Free Trial"}</div>
                        <div className="text-sm text-gray-500 mt-1 uppercase tracking-wider font-semibold">{billing?.status}</div>
                    </div>
                    {billing?.end && (
                        <div className="text-right">
                            <div className="text-sm text-gray-500">Renews on</div>
                            <div className="font-bold">{new Date(billing.end).toLocaleDateString()}</div>
                        </div>
                    )}
                </div>
            </div>

            <h2 className="text-lg font-semibold mb-4 text-gray-800">Available Plans</h2>
            <div className="grid md:grid-cols-3 gap-6">
                {plans?.map((plan) => (
                    <div key={plan.id} className="bg-white border p-6 rounded-xl hover:shadow-lg transition">
                        <div className="font-bold text-lg mb-2">{plan.name}</div>
                        <div className="text-2xl font-bold mb-4">{currency === 'USD' ? '$' : 'Rs.'}{plan.price}</div>
                        <button
                            onClick={() => choosePlan({ plan_id: plan.id, currency })}
                            disabled={isPending}
                            className={clsx(
                                "w-full py-2 rounded-lg font-semibold transition",
                                billing?.plan_name === plan.name
                                    ? "bg-green-100 text-green-700 cursor-default"
                                    : "bg-blue-600 text-white hover:bg-blue-700"
                            )}>
                            {billing?.plan_name === plan.name ? "Current Plan" : "Switch Plan"}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
