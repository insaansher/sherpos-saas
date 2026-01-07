"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription, Badge, Button } from "@/components/ui/primitives";
import { Shield, Lock, Globe, AlertTriangle, UserCheck, Key, Eye } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function SecurityCenterPage() {
    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Security Center</h1>
                <p className="text-muted-foreground">Monitor threats, manage access controls, and enforce compliance.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-sm font-medium">Auth Attempts (24h)</CardTitle>
                        <Lock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">14,203</div>
                        <p className="text-xs text-green-500 font-medium">+2.5% vs yesterday</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">128</div>
                        <p className="text-xs text-muted-foreground">0.9% failure rate</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-sm font-medium">Blocked IPs</CardTitle>
                        <Globe className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">42</div>
                        <p className="text-xs text-muted-foreground">Auto-blocked by WAF</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-sm font-medium">Active Admin Sessions</CardTitle>
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">3</div>
                        <p className="text-xs text-muted-foreground">Currently online</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Security Alerts</CardTitle>
                        <CardDescription>Suspicious activities detected by the system.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Event</TableHead>
                                    <TableHead>Severity</TableHead>
                                    <TableHead>Time</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell>
                                        <div className="font-medium">Multiple failed logins</div>
                                        <div className="text-xs text-muted-foreground">IP: 45.23.12.99</div>
                                    </TableCell>
                                    <TableCell><Badge variant="destructive">Medium</Badge></TableCell>
                                    <TableCell className="text-xs text-muted-foreground">10 mins ago</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>
                                        <div className="font-medium">New Admin Login</div>
                                        <div className="text-xs text-muted-foreground">User: manuj</div>
                                    </TableCell>
                                    <TableCell><Badge variant="outline">Info</Badge></TableCell>
                                    <TableCell className="text-xs text-muted-foreground">1 hour ago</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>
                                        <div className="font-medium">API Rate Limit Exceeded</div>
                                        <div className="text-xs text-muted-foreground">Tenant: RetailPro</div>
                                    </TableCell>
                                    <TableCell><Badge variant="warning">Low</Badge></TableCell>
                                    <TableCell className="text-xs text-muted-foreground">3 hours ago</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Security Configuration</CardTitle>
                        <CardDescription>Global enforcement policies.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between border pl-4 py-3 pr-4 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Key className="text-blue-500" />
                                <div>
                                    <div className="font-medium">MFA Enforcement</div>
                                    <div className="text-xs text-muted-foreground">Require 2FA for all admins</div>
                                </div>
                            </div>
                            <Button variant="outline" size="sm">Configure</Button>
                        </div>
                        <div className="flex items-center justify-between border pl-4 py-3 pr-4 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Eye className="text-indigo-500" />
                                <div>
                                    <div className="font-medium">Session Timeout</div>
                                    <div className="text-xs text-muted-foreground">Auto-logout after 15 mins</div>
                                </div>
                            </div>
                            <Button variant="outline" size="sm">Edit</Button>
                        </div>
                        <div className="flex items-center justify-between border pl-4 py-3 pr-4 rounded-lg bg-red-50 dark:bg-red-950/10 border-red-100 dark:border-red-900">
                            <div className="flex items-center gap-3">
                                <Shield className="text-red-500" />
                                <div>
                                    <div className="font-medium text-red-700 dark:text-red-400">Emergency Lockdown</div>
                                    <div className="text-xs text-red-600/80 dark:text-red-400/80">Revoke all active sessions</div>
                                </div>
                            </div>
                            <Button variant="destructive" size="sm">Engage</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
