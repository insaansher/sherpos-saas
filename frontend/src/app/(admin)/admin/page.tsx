"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/primitives";
import { Users, AlertTriangle, DollarSign, Activity, CreditCard, Download } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/primitives";
import { Button } from "@/components/ui/primitives"; // Button is in Primitives usually
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export default function AdminDashboardPage() {
    const { data: stats, isLoading } = useQuery({
        queryKey: ["admin", "dashboard"],
        queryFn: async () => {
            const res = await api.get("/admin/dashboard/stats");
            return res.data;
        }
    });

    const kpis = stats?.kpis || [];

    const recentActivity = [
        { id: 1, action: "New Tenant Registered", detail: "Coffee House Ltd.", time: "2 mins ago" },
        { id: 2, action: "Subscription Upgrade", detail: "TechWorks (Pro -> Enterprise)", time: "15 mins ago" },
        { id: 3, action: "System Alert", detail: "Database high latency (resolved)", time: "1 hour ago" },
        { id: 4, action: "Tenant Blocked", detail: "Spam Account #22", time: "3 hours ago" },
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Platform Control Tower</h1>
                    <p className="text-muted-foreground">Welcome back, Super Admin.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export Report</Button>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {isLoading ? (
                    <div>Loading stats...</div>
                ) : kpis.map((kpi: any, i: number) => {
                    // Need to map icon string to Lucide component dynamically or hardcode map order
                    // Simplified: Just use fallback icon if dynamic mapping is hard
                    const Icon = kpi.icon === 'Users' ? Users : kpi.icon === 'DollarSign' ? DollarSign : kpi.icon === 'CreditCard' ? CreditCard : AlertTriangle;

                    return (
                        <Card key={i} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-transparent hover:border-l-primary/50">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.title}</CardTitle>
                                <Icon className={`h-4 w-4 ${kpi.color}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{kpi.value}</div>
                                <p className="text-xs text-muted-foreground mt-1">{kpi.change}</p>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Charts & Activity */}
            <div className="grid gap-6 md:grid-cols-7">

                {/* Main Graph (Placeholder) */}
                <Card className="col-span-4 lg:col-span-5">
                    <CardHeader>
                        <CardTitle>Tenant Growth & Revenue</CardTitle>
                        <CardDescription>Performance over the last 30 days</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] flex items-end justify-between gap-2 px-4 pb-4">
                        {/* CSS-only Bar Chart Mockup */}
                        {[35, 45, 30, 60, 55, 70, 65, 80, 75, 90, 85, 95, 80, 70, 85, 100].map((h, i) => (
                            <div key={i} className="flex-1 bg-primary/10 hover:bg-primary/30 rounded-t-sm transition-all" style={{ height: `${h}%` }}></div>
                        ))}
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="col-span-3 lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Live Activity</CardTitle>
                        <CardDescription>Real-time system events</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {recentActivity.map((activity) => (
                                <div key={activity.id} className="flex items-start gap-4">
                                    <div className="bg-muted p-2 rounded-full mt-1">
                                        <Activity size={12} className="text-primary" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-none">{activity.action}</p>
                                        <p className="text-xs text-muted-foreground">{activity.detail}</p>
                                        <p className="text-[10px] text-muted-foreground pt-1">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
