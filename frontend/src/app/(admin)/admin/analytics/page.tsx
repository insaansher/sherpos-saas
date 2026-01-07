"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/primitives";
import { BarChart3, TrendingUp, Users, DollarSign } from "lucide-react";

export default function AnalyticsPage() {
    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Business Intelligence</h1>
                <p className="text-muted-foreground">Deep dive into platform growth and financial metrics.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="col-span-2 h-96 flex items-center justify-center border-dashed">
                    <div className="text-center space-y-2">
                        <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="text-lg font-medium">Revenue Analytics Engine</h3>
                        <p className="text-muted-foreground">Connect Stripe/Paddle to visualize MRR/ARR trends.</p>
                    </div>
                </Card>
            </div>
        </div>
    );
}
