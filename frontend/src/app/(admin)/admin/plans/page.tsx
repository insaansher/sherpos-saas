"use client";

import { useAdminPlans, useAdminPlanMutations } from "@/hooks/use-admin-plans";
import PlanEditor from "@/components/admin/plan-editor";
import { useState } from "react";
import { Plan } from "@/hooks/use-plans";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge, Button, Card, CardContent } from "@/components/ui/primitives";
import { Edit2, Copy, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminPlansPage() {
    const { data: plans, isLoading } = useAdminPlans();
    const { clonePlan } = useAdminPlanMutations();
    const [activeTab, setActiveTab] = useState<'basic' | 'advanced'>('basic');

    // Editor State
    const [editorOpen, setEditorOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
    const [isCreating, setIsCreating] = useState(false);

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
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Plans & Pricing</h1>
                    <p className="text-muted-foreground">Manage subscription tiers and limits.</p>
                </div>
                <Button onClick={handleCreate} className="gap-2">
                    <Plus size={16} /> Create Plan
                </Button>
            </div>

            <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
                <button
                    onClick={() => setActiveTab('basic')}
                    className={cn(
                        "px-4 py-2 rounded-md text-sm font-medium transition-all",
                        activeTab === 'basic' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    Basic Plans
                </button>
                <button
                    onClick={() => setActiveTab('advanced')}
                    className={cn(
                        "px-4 py-2 rounded-md text-sm font-medium transition-all",
                        activeTab === 'advanced' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    Advanced Plans
                </button>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Code</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>USD Price</TableHead>
                                <TableHead>Active</TableHead>
                                <TableHead>Public</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow><TableCell colSpan={7} className="h-24 text-center">Loading plans...</TableCell></TableRow>
                            ) : currentList.length === 0 ? (
                                <TableRow><TableCell colSpan={7} className="h-24 text-center text-muted-foreground">No plans found.</TableCell></TableRow>
                            ) : (
                                currentList.map(plan => {
                                    const usdPrice = plan.prices?.find((p: any) => p.currency === 'USD');
                                    return (
                                        <TableRow
                                            key={plan.id}
                                            onClick={() => handleEdit(plan)}
                                            className="group cursor-pointer"
                                        >
                                            <TableCell className="font-medium">{plan.name}</TableCell>
                                            <TableCell className="font-mono text-xs text-muted-foreground">{plan.code}</TableCell>
                                            <TableCell className="capitalize">{plan.duration_type?.replace('ly', '')}</TableCell>
                                            <TableCell className="font-mono">${usdPrice?.amount || '0'}</TableCell>
                                            <TableCell>
                                                <Badge variant={plan.is_active ? 'success' : 'destructive'}>
                                                    {plan.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={plan.is_public ? 'outline' : 'secondary'}>
                                                    {plan.is_public ? 'Public' : 'Hidden'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(plan)}><Edit2 size={16} /></Button>
                                                    <Button variant="ghost" size="icon" onClick={(e) => handleClone(plan.id, e)}><Copy size={16} /></Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <PlanEditor
                isOpen={editorOpen}
                onClose={() => setEditorOpen(false)}
                plan={editingPlan}
                isCreating={isCreating}
            />
        </div>
    );
}
