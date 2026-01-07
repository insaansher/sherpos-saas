"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription, Button, Input } from "@/components/ui/primitives";
import { Label, Switch } from "@/components/ui/form-elements";
import { Save, AlertTriangle } from "lucide-react";

export default function AdminSettingsPage() {
    return (
        <div className="space-y-8 animate-fade-in max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
                <p className="text-muted-foreground">Global configuration for the SherPOS platform.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>General Configuration</CardTitle>
                    <CardDescription>Basic platform identity and defaults.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <Label>Platform Name</Label>
                        <Input defaultValue="SherPOS SaaS" />
                    </div>
                    <div className="grid gap-2">
                        <Label>Contact Email</Label>
                        <Input defaultValue="support@sherpos.com" />
                    </div>
                </CardContent>
            </Card>

            <Card className="border-red-200 dark:border-red-900/50">
                <CardHeader>
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                        <AlertTriangle size={20} />
                        <CardTitle>Danger Zone</CardTitle>
                    </div>
                    <CardDescription>Sensitive system controls.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between border-t pt-4">
                        <div>
                            <div className="font-medium">Maintenance Mode</div>
                            <div className="text-sm text-muted-foreground">Disable all tenant access temporarily.</div>
                        </div>
                        <div className="flex items-center h-6">
                            <Switch id="maintenance-mode" className="data-[state=checked]:bg-red-500" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button className="gap-2"><Save size={16} /> Save Changes</Button>
            </div>
        </div>
    );
}
