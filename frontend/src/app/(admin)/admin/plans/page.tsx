"use client";

import { useAdminPlans, useAdminPlanMutations } from "@/hooks/use-admin-plans";
import PlanEditor from "@/components/admin/plan-editor";
import clsx from "clsx";
import { useState } from "react";
import { Plan } from "@/hooks/use-plans";

export default function AdminPlansPage() {
    const { data: plans, isLoading } = useAdminPlans();
    const { clonePlan } = useAdminPlanMutations();
    const [activeTab, setActiveTab] = useState<'basic' | 'advanced'>('basic');

    // Editor State
    const [editorOpen, setEditorOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    if (isLoading) return <div className="p-8 text-white">Loading plans...</div>;

    const basicPlans = plans?.filter(p => p.package_type === 'basic') || [];
    const advancedPlans = plans?.filter(p => p.package_type === 'advanced' || p.package_type === 'advanced_growth') || [];

    const currentList = activeTab === 'basic' ? basicPlans : advancedPlans;

    const handleEdit = (plan: Plan) => {
        setEditingPlan(plan);
        setIsCreating(false);
        setEditorOpen(true);
    };

    const handleCreate = () => {
        setEditingPlan(null);
        setIsCreating(true);
        setEditorOpen(true);
    };

    const handleClone = (id: string, e: any) => {
        e.stopPropagation();
        if (confirm("Clone this plan?")) {
            clonePlan.mutate(id);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white">Manage Plans</h1>
                <button
                    onClick={handleCreate}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition"
                >
                    Create Plan
                </button>
            </div>

            <div className="mb-6 flex space-x-4 border-b border-slate-700">
                <button
                    onClick={() => setActiveTab('basic')}
                    className={clsx("pb-3 px-1 font-medium text-sm transition", activeTab === 'basic' ? "text-blue-400 border-b-2 border-blue-400" : "text-slate-400 hover:text-slate-200")}
                >
                    Basic Plans ({basicPlans.length})
                </button>
                <button
                    onClick={() => setActiveTab('advanced')}
                    className={clsx("pb-3 px-1 font-medium text-sm transition", activeTab === 'advanced' ? "text-blue-400 border-b-2 border-blue-400" : "text-slate-400 hover:text-slate-200")}
                >
                    Advanced Plans ({advancedPlans.length})
                </button>
            </div>

            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-900/50 text-slate-400 font-medium">
                        <tr>
                            <th className="p-4">Name</th>
                            <th className="p-4">Code</th>
                            <th className="p-4">Duration</th>
                            <th className="p-4">USD Price</th>
                            <th className="p-4">Active</th>
                            <th className="p-4">Public</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentList.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="p-8 text-center text-slate-500">
                                    No plans found for this package. (Debug: Total plans fetched = {plans?.length})
                                </td>
                            </tr>
                        ) : (
                            currentList.map(plan => {
                                const usdPrice = plan.prices?.find((p: any) => p.currency === 'USD');
                                return (
                                    <tr
                                        key={plan.id}
                                        onClick={() => handleEdit(plan)}
                                        className="border-t border-slate-700 hover:bg-slate-700/50 transition cursor-pointer"
                                    >
                                        <td className="p-4 font-bold text-white">{plan.name}</td>
                                        <td className="p-4 font-mono text-xs text-slate-400">{plan.code}</td>
                                        <td className="p-4 capitalize">{plan.duration_type?.replace('ly', '')}</td>
                                        <td className="p-4 font-mono">${usdPrice?.amount || '0'}</td>
                                        <td className="p-4">
                                            <span className={clsx("px-2 py-0.5 rounded text-xs", plan.is_active ? "text-green-400 bg-green-400/10" : "text-red-400 bg-red-400/10")}>
                                                {plan.is_active ? 'Yes' : 'No'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={clsx("px-2 py-0.5 rounded text-xs", plan.is_public ? "text-blue-400 bg-blue-400/10" : "text-slate-400 bg-slate-400/10")}>
                                                {plan.is_public ? 'Yes' : 'No'}
                                            </span>
                                        </td>
                                        <td className="p-4 flex gap-2">
                                            <button className="text-blue-400 hover:text-blue-300">Edit</button>
                                            <button
                                                onClick={(e) => handleClone(plan.id, e)}
                                                className="text-slate-400 hover:text-slate-300"
                                            >
                                                Clone
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <PlanEditor
                isOpen={editorOpen}
                onClose={() => setEditorOpen(false)}
                plan={editingPlan}
                isCreating={isCreating}
            />
        </div>
    );
}
