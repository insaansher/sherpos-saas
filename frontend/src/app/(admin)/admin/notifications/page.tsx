"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/primitives";
import { Mail, Bell, MessageSquare } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function NotificationsPage() {
    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Communications Hub</h1>
                <p className="text-muted-foreground">Manage system alerts, email logs, and customer announcements.</p>
            </div>

            <Tabs defaultValue="alerts">
                <TabsList>
                    <TabsTrigger value="alerts">System Alerts</TabsTrigger>
                    <TabsTrigger value="emails">Email Logs</TabsTrigger>
                    <TabsTrigger value="announcements">Announcements</TabsTrigger>
                </TabsList>
                <TabsContent value="alerts" className="mt-6">
                    <Card>
                        <CardHeader><CardTitle>System Notifications</CardTitle></CardHeader>
                        <CardContent className="h-64 flex items-center justify-center text-muted-foreground bg-muted/5 border-dashed border-2 rounded-xl mx-6 mb-6">
                            No active system alerts.
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="emails" className="mt-6">
                    <Card>
                        <CardHeader><CardTitle>Transactional Email Log</CardTitle></CardHeader>
                        <CardContent className="h-64 flex items-center justify-center text-muted-foreground bg-muted/5 border-dashed border-2 rounded-xl mx-6 mb-6">
                            <Mail className="mr-2" /> Email service (SendGrid/SES) integration required.
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
