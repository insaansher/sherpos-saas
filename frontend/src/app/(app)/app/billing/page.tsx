"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Badge } from "@/components/ui/primitives";
import { Check, CreditCard } from "lucide-react";

export default function BillingPage() {
    return (
        <div className="space-y-8 animate-fade-in max-w-5xl mx-auto py-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Billing & Plans</h1>
                <p className="text-muted-foreground">Manage your subscription and payment methods.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <Card className="border-primary/50 bg-primary/5">
                    <CardHeader>
                        <Badge className="w-fit mb-2">Current Plan</Badge>
                        <CardTitle className="text-2xl">Pro Plan</CardTitle>
                        <CardDescription>Everything you need to grow.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-3xl font-bold">$29<span className="text-lg font-normal text-muted-foreground">/mo</span></div>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2"><Check size={16} className="text-green-500" /> Unlimited Products</li>
                            <li className="flex items-center gap-2"><Check size={16} className="text-green-500" /> Advanced Analytics</li>
                            <li className="flex items-center gap-2"><Check size={16} className="text-green-500" /> 24/7 Support</li>
                        </ul>
                        <div className="pt-4">
                            <Button className="w-full">Manage Subscription</Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Invoices</CardTitle>
                        <CardDescription>Recent billing history.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-muted p-2 rounded">
                                            <CreditCard size={16} />
                                        </div>
                                        <div>
                                            <div className="font-medium">Invoice #INV-2024-00{i}</div>
                                            <div className="text-xs text-muted-foreground">Jan {i}, 2026</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold">$29.00</div>
                                        <div className="text-xs text-green-600 font-medium">Paid</div>
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
