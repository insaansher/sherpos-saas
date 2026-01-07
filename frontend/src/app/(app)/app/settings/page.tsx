"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Input } from "@/components/ui/primitives";
import { Label, Switch } from "@/components/ui/form-elements";
import { Store, Shield, CreditCard, Bell } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="space-y-8 animate-fade-in max-w-4xl mx-auto py-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your store preferences and account.</p>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Store className="text-primary" />
                            <CardTitle>General Store Settings</CardTitle>
                        </div>
                        <CardDescription>Configure your store details and operating currency.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Store Name</Label>
                                <Input defaultValue="Demo Store" />
                            </div>
                            <div className="space-y-2">
                                <Label>Support Email</Label>
                                <Input defaultValue="support@sherpos.com" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Currency</Label>
                            <Input defaultValue="USD ($)" disabled />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Shield className="text-primary" />
                            <CardTitle>Security & Access</CardTitle>
                        </div>
                        <CardDescription>Manage password and team access.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between border p-4 rounded-lg">
                            <div className="space-y-0.5">
                                <Label className="text-base">Two-Factor Authentication</Label>
                                <p className="text-sm text-muted-foreground">Add an extra layer of security to your account.</p>
                            </div>
                            <Switch />
                        </div>
                        <Button variant="outline">Change Password</Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Bell className="text-primary" />
                            <CardTitle>Notifications</CardTitle>
                        </div>
                        <CardDescription>Control what alerts you receive.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label>Email Alerts for Low Stock</Label>
                            <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label>Push Notifications for New Orders</Label>
                            <Switch defaultChecked />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
