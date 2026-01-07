"use client";

import { useAdminTenants } from "@/hooks/use-admin-tenants";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge, Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/primitives";
import { format } from "date-fns";
import { Search, Filter, MoreHorizontal, Shield, Ban, RefreshCw } from "lucide-react";
import { useState } from "react";

export default function TenantsPage() {
    const { data: tenants, isLoading } = useAdminTenants();
    const [search, setSearch] = useState("");

    const filtered = tenants?.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.email.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Tenants</h1>
                    <p className="text-muted-foreground">Manage all organizations on the platform.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline"><Filter size={16} className="mr-2" /> Filter</Button>
                    <Button><Shield size={16} className="mr-2" /> Create Tenant</Button>
                </div>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name or email..."
                            className="pl-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead onClick={() => { }} className="cursor-pointer hover:bg-muted/50">Details</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Plan</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead>Renewal</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow><TableCell colSpan={6} className="h-24 text-center">Loading tenants...</TableCell></TableRow>
                            ) : filtered?.length === 0 ? (
                                <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No tenants found.</TableCell></TableRow>
                            ) : (
                                filtered?.map((tenant) => (
                                    <TableRow key={tenant.id} className="group">
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{tenant.name}</span>
                                                <span className="text-xs text-muted-foreground">{tenant.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                tenant.status === 'active' ? 'success' :
                                                    tenant.status === 'trial' ? 'warning' : 'destructive'
                                            } className="capitalize">
                                                {tenant.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="font-mono">{tenant.plan}</Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {tenant.created_at ? format(new Date(tenant.created_at), "MMM d, yyyy") : "-"}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {tenant.renews_at ? format(new Date(tenant.renews_at), "MMM d, yyyy") : "Lifetime"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button size="icon" variant="ghost" title="Impersonate"><Shield size={16} /></Button>
                                                <Button size="icon" variant="ghost" title="Sync"><RefreshCw size={16} /></Button>
                                                <Button size="icon" variant="ghost" title="More"><MoreHorizontal size={16} /></Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
