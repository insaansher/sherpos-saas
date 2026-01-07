"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@/components/ui/primitives";
import { Database, Download, Trash2, Archive, AlertCircle, Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function DataGovernancePage() {
    const { data: stats, isLoading, isError, error } = useQuery({
        queryKey: ["admin", "data-governance"],
        queryFn: async () => {
            console.log("Fetching data governance stats...");
            const res = await api.get("/admin/data-governance");
            console.log("Data governance response:", res.data);
            return res.data;
        },
        retry: 1
    });

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <AlertCircle className="h-12 w-12 text-destructive" />
                <div className="text-xl font-semibold">Failed to load data governance</div>
                <p className="text-muted-foreground">{(error as any)?.message || "Internal Server Error"}</p>
                <Button onClick={() => window.location.reload()} variant="outline">Try Again</Button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Data Governance</h1>
                    <p className="text-muted-foreground">Manage tenant data retention, exports, and GDPR compliance.</p>
                </div>
                <Button variant="outline" className="gap-2">
                    <Archive size={16} /> Global Cleanup
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Database size={14} className="text-blue-500" />
                            Total Storage
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        ) : (
                            <div className="text-2xl font-bold">{stats?.storage_used || '0.0 TB'}</div>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Trash2 size={14} className="text-red-500" />
                            Pending deletions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        ) : (
                            <div className="text-2xl font-bold">{stats?.pending_deletions ?? 0}</div>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Download size={14} className="text-green-500" />
                            Data Exports (24h)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        ) : (
                            <div className="text-2xl font-bold">{stats?.exports_24h ?? 0}</div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Deletion Requests (GDPR/Churn)</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tenant</TableHead>
                                <TableHead>Request Date</TableHead>
                                <TableHead>Deadline</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10">
                                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                                    </TableCell>
                                </TableRow>
                            ) : (stats?.deletion_requests || [])?.length > 0 ? (
                                (stats?.deletion_requests || []).map((req: any, idx: number) => (
                                    <TableRow key={idx}>
                                        <TableCell className="font-medium">{req.tenant_name}</TableCell>
                                        <TableCell>{req.request_date}</TableCell>
                                        <TableCell>{req.deadline}</TableCell>
                                        <TableCell>{req.status}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="destructive" size="sm" className="gap-2">
                                                <Trash2 size={14} /> Approve Purge
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground italic">
                                        No active deletion requests.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
