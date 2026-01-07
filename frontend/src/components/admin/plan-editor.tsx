"use client";

import { useForm } from "react-hook-form";
import { Plan } from "@/hooks/use-plans";
import { useAdminPlanMutations } from "@/hooks/use-admin-plans";
import { useState, useEffect } from "react";
import clsx from "clsx";

interface PlanEditorProps {
    plan?: Plan | null;
    isOpen: boolean;
    onClose: () => void;
    isCreating?: boolean;
}

export default function PlanEditor({ plan, isOpen, onClose, isCreating }: PlanEditorProps) {
    const { createPlan, updateMeta, updatePrices, updateLimits, updateFeatures, updateVisibility } = useAdminPlanMutations();
    const [activeTab, setActiveTab] = useState("meta");

    // FORM STATES (Simplification: multiple forms or one big state? Separate forms per section is cleaner for partial updates)
    // For Creating: we need one big form. For Editing: separate sections preferable.

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
            <div className="w-[600px] bg-background h-full shadow-2xl overflow-y-auto border-l border-border p-6 animate-slide-in">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-foreground">{isCreating ? "Create New Plan" : `Edit ${plan?.name}`}</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">Close</button>
                </div>

                {isCreating ? (
                    <CreatePlanForm onClose={onClose} createFn={createPlan.mutate} />
                ) : (
                    plan && (
                        <div className="space-y-8">
                            {/* Tabs */}
                            <div className="flex border-b border-border space-x-4 mb-4">
                                {['meta', 'prices', 'limits', 'features', 'visibility'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={clsx("pb-2 capitalize text-sm font-medium transition-colors", activeTab === tab ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground")}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            {activeTab === 'meta' && <MetaForm plan={plan} updateFn={updateMeta.mutate} />}
                            {activeTab === 'visibility' && <VisibilityForm plan={plan} updateFn={updateVisibility.mutate} />}
                            {activeTab === 'prices' && <PricesForm plan={plan} updateFn={updatePrices.mutate} />}
                            {activeTab === 'limits' && <LimitsForm plan={plan} updateFn={updateLimits.mutate} />}
                            {activeTab === 'features' && <FeaturesForm plan={plan} updateFn={updateFeatures.mutate} />}
                        </div>
                    )
                )}
            </div>
        </div>
    );
}

// --- SUB-FORMS ---

function CreatePlanForm({ onClose, createFn }: any) {
    const { register, handleSubmit } = useForm({
        defaultValues: {
            code: "", name: "", package_type: "basic", duration_type: "monthly",
            prices: [{ currency: 'USD', amount: 0, setup_fee: 0 }, { currency: 'LKR', amount: 0, setup_fee: 0 }],
            limits: { branch_limit: 1, user_limit: 1, pos_device_limit: 1 },
            features: { multi_branch: false, offline_pos: true },
            is_active: true, is_public: false
        }
    });

    const onSubmit = (data: any) => {
        createFn(data, { onSuccess: onClose });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input {...register("name")} placeholder="Plan Name" className="w-full bg-input border-border text-foreground rounded-md p-2" required />
            <input {...register("code")} placeholder="Unique Code (e.g. basic_monthly)" className="w-full bg-input border-border text-foreground rounded-md p-2" required />
            <div className="grid grid-cols-2 gap-2">
                <select {...register("package_type")} className="bg-input border-border text-foreground rounded-md p-2">
                    <option value="basic">Basic</option>
                    <option value="advanced">Advanced</option>
                </select>
                <select {...register("duration_type")} className="bg-input border-border text-foreground rounded-md p-2">
                    <option value="monthly">Monthly</option>
                    <option value="annual">Annual</option>
                    <option value="lifetime">Lifetime</option>
                    <option value="2y">2 Years</option>
                </select>
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded font-bold">Create Plan</button>
        </form>
    )
}

function MetaForm({ plan, updateFn }: any) {
    const { register, handleSubmit } = useForm({ defaultValues: { name: plan.name, code: plan.code, package_type: plan.package_type, duration_type: plan.duration_type } });
    return (
        <form onSubmit={handleSubmit((data) => updateFn({ id: plan.id, data }))} className="space-y-4">
            <input {...register("name")} className="w-full bg-input border-border text-foreground rounded-md p-2" />
            <input {...register("code")} className="w-full bg-input border-border text-foreground rounded-md p-2" />
            <div className="grid grid-cols-2 gap-2">
                <select {...register("package_type")} className="bg-slate-800 border-slate-700 text-white rounded p-2">
                    <option value="basic">Basic</option>
                    <option value="advanced">Advanced</option>
                </select>
                <select {...register("duration_type")} className="bg-slate-800 border-slate-700 text-white rounded p-2">
                    <option value="monthly">Monthly</option>
                    <option value="annual">Annual</option>
                    <option value="lifetime">Lifetime</option>
                    <option value="2y">2 Years</option>
                    <option value="3y">3 Years</option>
                    <option value="4y">4 Years</option>
                </select>
            </div>
            <button className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded">Save Meta</button>
        </form>
    )
}

function VisibilityForm({ plan, updateFn }: any) {
    const { register, handleSubmit } = useForm({ defaultValues: { is_active: plan.is_active, is_public: plan.is_public } });
    return (
        <form onSubmit={handleSubmit((data) => updateFn({ id: plan.id, data }))} className="space-y-4">
            <label className="flex items-center space-x-2 text-white">
                <input type="checkbox" {...register("is_active")} /> <span>Active (Enabled)</span>
            </label>
            <label className="flex items-center space-x-2 text-white">
                <input type="checkbox" {...register("is_public")} /> <span>Public (Visible on Pricing Page)</span>
            </label>
            <button className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded">Save Visibility</button>
        </form>
    )
}

function PricesForm({ plan, updateFn }: any) {
    // Flatten prices for form? Or nice dynamic list. Simpler: Fixed USD/LKR/EUR fields for this phase.
    const usd = plan.prices?.find((p: any) => p.currency === 'USD') || { amount: 0, setup_fee: 0 };
    const lkr = plan.prices?.find((p: any) => p.currency === 'LKR') || { amount: 0, setup_fee: 0 };

    const { register, handleSubmit } = useForm({
        defaultValues: {
            usd_amount: usd.amount, usd_setup: usd.setup_fee,
            lkr_amount: lkr.amount, lkr_setup: lkr.setup_fee,
        }
    });

    const onSubmit = (data: any) => {
        const prices = [
            { currency: 'USD', amount: parseFloat(data.usd_amount), setup_fee: parseFloat(data.usd_setup) },
            { currency: 'LKR', amount: parseFloat(data.lkr_amount), setup_fee: parseFloat(data.lkr_setup) },
        ];
        updateFn({ id: plan.id, prices });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-white">
            <div className="grid grid-cols-3 gap-2 text-sm font-bold mb-1">
                <span>Currency</span><span>Amount</span><span>Setup Fee</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
                <span className="py-2">USD</span>
                <input {...register("usd_amount")} type="number" step="0.01" className="bg-slate-800 border-slate-700 rounded p-1" />
                <input {...register("usd_setup")} type="number" step="0.01" className="bg-slate-800 border-slate-700 rounded p-1" />
            </div>
            <div className="grid grid-cols-3 gap-2">
                <span className="py-2">LKR</span>
                <input {...register("lkr_amount")} type="number" step="0.01" className="bg-slate-800 border-slate-700 rounded p-1" />
                <input {...register("lkr_setup")} type="number" step="0.01" className="bg-slate-800 border-slate-700 rounded p-1" />
            </div>
            <button className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded mt-4">Save Prices</button>
        </form>
    )
}

function LimitsForm({ plan, updateFn }: any) {
    const { register, handleSubmit } = useForm({ defaultValues: plan.limits || {} });
    return (
        <form onSubmit={handleSubmit((data) => updateFn({
            id: plan.id, limits: {
                branch_limit: parseInt(data.branch_limit),
                user_limit: parseInt(data.user_limit),
                pos_device_limit: parseInt(data.pos_device_limit)
            }
        }))} className="space-y-4 text-white">
            <div className="space-y-2">
                <label className="block text-xs">Branch Limit</label>
                <input {...register("branch_limit")} type="number" className="w-full bg-slate-800 border-slate-700 rounded p-2" />
            </div>
            <div className="space-y-2">
                <label className="block text-xs">User Limit</label>
                <input {...register("user_limit")} type="number" className="w-full bg-slate-800 border-slate-700 rounded p-2" />
            </div>
            <div className="space-y-2">
                <label className="block text-xs">POS Device Limit</label>
                <input {...register("pos_device_limit")} type="number" className="w-full bg-slate-800 border-slate-700 rounded p-2" />
            </div>
            <button className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded">Save Limits</button>
        </form>
    )
}

function FeaturesForm({ plan, updateFn }: any) {
    const { register, handleSubmit } = useForm({ defaultValues: plan.features || {} });
    return (
        <form onSubmit={handleSubmit((data) => updateFn({ id: plan.id, features: data }))} className="space-y-3 text-white">
            <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center space-x-2"><input type="checkbox" {...register("multi_branch")} /> <span>Multi Branch</span></label>
                <label className="flex items-center space-x-2"><input type="checkbox" {...register("stock_transfer")} /> <span>Stock Transfer</span></label>
                <label className="flex items-center space-x-2"><input type="checkbox" {...register("advanced_reports")} /> <span>Adv Reports</span></label>
                <label className="flex items-center space-x-2"><input type="checkbox" {...register("manufacturing")} /> <span>Manufacturing</span></label>
                <label className="flex items-center space-x-2"><input type="checkbox" {...register("reward_points")} /> <span>Reward Points</span></label>
                <label className="flex items-center space-x-2"><input type="checkbox" {...register("quotations")} /> <span>Quotations</span></label>
                <label className="flex items-center space-x-2"><input type="checkbox" {...register("delivery_management")} /> <span>Delivery Mgmt</span></label>
                <label className="flex items-center space-x-2"><input type="checkbox" {...register("offline_pos")} /> <span>Offline POS</span></label>
            </div>
            <button className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded mt-4">Save Features</button>
        </form>
    )
}
