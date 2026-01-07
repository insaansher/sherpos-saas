"use client";

import { Card, CardContent } from "@/components/ui/primitives";

export default function SubscriptionsPage() {
    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
                <p className="text-muted-foreground">Monitor revenue and billing cycles.</p>
            </div>

            <Card>
                <CardContent className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center h-64 border-dashed border-2">
                    <p>Subscription management module coming in next sprint.</p>
                    <p className="text-xs mt-2">Tracks Stripe/Paddle webhooks and invoices.</p>
                </CardContent>
            </Card>
        </div>
    );
}
