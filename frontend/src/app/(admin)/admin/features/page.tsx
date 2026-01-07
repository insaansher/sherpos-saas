"use client";

import { Badge, Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/primitives";
import { Switch } from "@/components/ui/form-elements";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, FlaskConical, Globe, Zap } from "lucide-react";
import { useState } from "react";
import api from "@/lib/api";

type FeatureFlag = {
    key: string;
    name: string;
    description: string;
    status: 'enabled' | 'disabled' | 'beta';
    scope: 'global' | 'plan_limited';
    rollout_percentage: number;
};

export default function FeatureFlagsPage() {
    const queryClient = useQueryClient();

    // Mock Data
    const { data: features, isLoading } = useQuery({
        queryKey: ["admin", "features"],
        queryFn: async () => {
            return [
                { key: "ai_insights", name: "AI Analytics Assistant", description: "Generative AI insights on dashboard.", status: "beta", scope: "global", rollout_percentage: 20 },
                { key: "pay_by_crypto", name: "Crypto Payments", description: "Accept BTC/ETH/USDC via gateways.", status: "disabled", scope: "global", rollout_percentage: 0 },
                { key: "multi_location_sync", name: "Real-time Multi-Location Sync", description: "WebSocket sync for inventory.", status: "enabled", scope: "plan_limited", rollout_percentage: 100 },
                { key: "new_pos_ui", name: "POS UI v3 (React)", description: "New touch-friendly POS interface.", status: "enabled", scope: "global", rollout_percentage: 100 },
            ] as FeatureFlag[];
        }
    });

    const toggleFeature = useMutation({
        mutationFn: async ({ key, status }: { key: string, status: string }) => {
            // await api.put...
            return { key, status };
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "features"] })
    });

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Feature Flags & Experiments</h1>
                <p className="text-muted-foreground">Manage platform capabilities, rollouts, and kill-switches.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/20 dark:to-background border-indigo-200 dark:border-indigo-900">
                    <CardHeader>
                        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                            <FlaskConical size={24} />
                            <CardTitle>Active Experiments</CardTitle>
                        </div>
                        <CardDescription>Features currently in Beta or A/B testing.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1 Beta Feature</div>
                        <p className="text-sm text-muted-foreground mt-1">AI Analytics Assistant (20% rollout)</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-pink-50 to-white dark:from-pink-950/20 dark:to-background border-pink-200 dark:border-pink-900">
                    <CardHeader>
                        <div className="flex items-center gap-2 text-pink-600 dark:text-pink-400">
                            <Zap size={24} />
                            <CardTitle>Global Kill Switches</CardTitle>
                        </div>
                        <CardDescription>Emergency disable for critical subsystems.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">All Systems Nominal</div>
                        <p className="text-sm text-muted-foreground mt-1">No emergency overrides active.</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Platform Feature Registry</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Feature Name</TableHead>
                                <TableHead>Key</TableHead>
                                <TableHead>Scope</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Rollout %</TableHead>
                                <TableHead className="text-right">Control</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow><TableCell colSpan={6} className="h-24 text-center">Loading features...</TableCell></TableRow>
                            ) : (
                                features?.map((feature) => (
                                    <TableRow key={feature.key}>
                                        <TableCell>
                                            <div className="font-medium">{feature.name}</div>
                                            <div className="text-xs text-muted-foreground">{feature.description}</div>
                                        </TableCell>
                                        <TableCell className="font-mono text-xs text-muted-foreground">{feature.key}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{feature.scope === 'global' ? 'Global' : 'Plan Limited'}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                feature.status === 'enabled' ? 'success' :
                                                    feature.status === 'beta' ? 'warning' : 'secondary'
                                            } className="capitalize">
                                                {feature.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                                                    <div className="h-full bg-primary" style={{ width: `${feature.rollout_percentage}%` }}></div>
                                                </div>
                                                <span className="text-xs">{feature.rollout_percentage}%</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end">
                                                <Switch checked={feature.status !== 'disabled'} />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
