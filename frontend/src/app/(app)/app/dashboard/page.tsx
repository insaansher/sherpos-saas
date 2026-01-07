"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/primitives";
import { DollarSign, ShoppingCart, Activity, AlertCircle, ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
    const kpis = [
        {
            title: "Total Revenue",
            value: "$45,231.89",
            change: "+20.1% from last month",
            trend: "up",
            icon: DollarSign,
            color: "text-blue-600"
        },
        {
            title: "Active Orders",
            value: "+2350",
            change: "+180.1% from last month",
            trend: "up",
            icon: ShoppingCart,
            color: "text-green-600"
        },
        {
            title: "Low Stock Items",
            value: "12",
            change: "Requires attention",
            trend: "down",
            icon: AlertCircle,
            color: "text-amber-600"
        },
        {
            title: "Net Profit",
            value: "$12,234.00",
            change: "+19% from last month",
            trend: "up",
            icon: Activity,
            color: "text-purple-600"
        }
    ];

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">Overview of your business performance.</p>
                </div>
                <div className="flex items-center space-x-2 bg-background border p-1 rounded-lg">
                    <span className="px-3 py-1 text-sm font-medium bg-muted rounded-md shadow-sm">Today</span>
                    <span className="px-3 py-1 text-sm font-medium text-muted-foreground hover:bg-muted/50 cursor-pointer rounded-md">Week</span>
                    <span className="px-3 py-1 text-sm font-medium text-muted-foreground hover:bg-muted/50 cursor-pointer rounded-md">Month</span>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {kpis.map((kpi, i) => (
                    <Card key={i} className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {kpi.title}
                            </CardTitle>
                            <kpi.icon className={cn("h-4 w-4", kpi.color)} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">{kpi.value}</div>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center">
                                {kpi.trend === "up" ? (
                                    <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                                ) : (
                                    <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                                )}
                                <span className={kpi.trend === "up" ? "text-green-500 font-medium" : "text-amber-500 font-medium"}>
                                    {kpi.change}
                                </span>
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-7 gap-6">
                {/* Main Chart Area */}
                <Card className="col-span-4 lg:col-span-4 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Revenue Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px] w-full flex items-end justify-between px-4 pb-4 gap-2">
                            {/* Mock Bar Chart */}
                            {[40, 60, 45, 78, 55, 65, 80, 70, 90, 85, 60, 95].map((h, i) => (
                                <div key={i} className="flex flex-col items-center justify-end h-full w-full group">
                                    <div
                                        className="w-full bg-primary/20 rounded-t-sm group-hover:bg-primary/40 transition-colors relative"
                                        style={{ height: `${h}%` }}
                                    >
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-sm border">
                                            {h * 100}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between px-4 text-xs text-muted-foreground cart-caption mt-2 border-t pt-2">
                            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                            <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Right Side Cards */}
                <div className="col-span-3 space-y-6">
                    {/* Recent Sales */}
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle className="text-lg">Recent Sales</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {[
                                    { name: "John Doe", email: "john@example.com", amount: "+$1,999.00", initial: "JD" },
                                    { name: "Jackson Lee", email: "jackson@example.com", amount: "+$39.00", initial: "JL" },
                                    { name: "Isabella Nguyen", email: "isabella@example.com", amount: "+$299.00", initial: "IN" },
                                    { name: "William Kim", email: "will@example.com", amount: "+$99.00", initial: "WK" },
                                    { name: "Sofia Davis", email: "sofia@example.com", amount: "+$39.00", initial: "SD" }
                                ].map((sale, i) => (
                                    <div key={i} className="flex items-center justify-between group">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-muted group-hover:bg-primary/10 transition-colors text-xs font-medium">
                                                {sale.initial}
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium leading-none">{sale.name}</p>
                                                <p className="text-xs text-muted-foreground">{sale.email}</p>
                                            </div>
                                        </div>
                                        <div className="font-bold text-sm">{sale.amount}</div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-4">
                <Card className="hover:border-primary/50 transition-colors cursor-pointer bg-gradient-to-br from-card to-muted/20">
                    <CardContent className="p-6 flex items-center space-x-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-lg">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <h3 className="font-semibold">View Reports</h3>
                            <p className="text-sm text-muted-foreground">Detailed sales analytics</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="hover:border-primary/50 transition-colors cursor-pointer bg-gradient-to-br from-card to-muted/20">
                    <CardContent className="p-6 flex items-center space-x-4">
                        <div className="p-3 bg-green-100 dark:bg-green-900/20 text-green-600 rounded-lg">
                            <ShoppingCart size={24} />
                        </div>
                        <div>
                            <h3 className="font-semibold">Manage Inventory</h3>
                            <p className="text-sm text-muted-foreground">Update stock levels</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="hover:border-primary/50 transition-colors cursor-pointer bg-gradient-to-br from-card to-muted/20">
                    <CardContent className="p-6 flex items-center space-x-4">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/20 text-purple-600 rounded-lg">
                            <Activity size={24} />
                        </div>
                        <div>
                            <h3 className="font-semibold">Audit Logs</h3>
                            <p className="text-sm text-muted-foreground">Track system activity</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
