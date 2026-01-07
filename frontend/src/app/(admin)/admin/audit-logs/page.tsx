"use client";

import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge, Button, Input, Card, CardHeader, CardTitle, CardContent } from "@/components/ui/primitives";
import { format } from "date-fns";
import { Search, Filter, FileJson } from "lucide-react";
import { useState } from "react";
import api from "@/lib/api";

interface AuditLog {
    id: string;
    action: string;
    resource: string;
    admin_name: string;
    ip_address: string;
    created_at: string;
    details: any;
}

export default function AuditLogsPage() {
    const [search, setSearch] = useState("");

    // Mock Data simulating generic admin endpoint
    const { data: logs, isLoading } = useQuery({
        queryKey: ["admin", "audit-logs"],
        queryFn: async () => {
            // Mock because backend audit might not be ready
            return [
                { id: "1", action: "update_plan", resource: "plan_basic", admin_name: "Super Admin", ip_address: "192.168.1.1", created_at: new Date().toISOString(), details: { before: "10", after: "20" } },
                { id: "2", action: "block_tenant", resource: "tenant_xyz", admin_name: "Super Admin", ip_address: "192.168.1.1", created_at: new Date(Date.now() - 3600000).toISOString(), details: { reason: "spam" } },
                { id: "3", action: "login", resource: "auth", admin_name: "Super Admin", ip_address: "192.168.1.1", created_at: new Date(Date.now() - 7200000).toISOString(), details: {} },
            ] as AuditLog[];
        }
    });

    const filtered = logs?.filter(l => l.action.includes(search) || l.resource.includes(search));

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
                <p className="text-muted-foreground">Track all system activities and security events.</p>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex justify-between">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search logs..."
                                className="pl-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Button variant="outline"><Filter size={16} className="mr-2" /> Filter</Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Timestamp</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>Resource</TableHead>
                                <TableHead>Admin</TableHead>
                                <TableHead>IP</TableHead>
                                <TableHead className="text-right">Metadata</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow><TableCell colSpan={6} className="h-24 text-center">Loading logs...</TableCell></TableRow>
                            ) : filtered?.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell className="font-mono text-xs text-muted-foreground">
                                        {format(new Date(log.created_at), "yyyy-MM-dd HH:mm:ss")}
                                    </TableCell>
                                    <TableCell><Badge variant="outline" className="font-mono text-xs uppercase">{log.action}</Badge></TableCell>
                                    <TableCell className="font-mono text-xs">{log.resource}</TableCell>
                                    <TableCell>{log.admin_name}</TableCell>
                                    <TableCell className="font-mono text-xs text-muted-foreground">{log.ip_address}</TableCell>
                                    <TableCell className="text-right">
                                        <Button size="icon" variant="ghost" title="View JSON"><FileJson size={16} /></Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
