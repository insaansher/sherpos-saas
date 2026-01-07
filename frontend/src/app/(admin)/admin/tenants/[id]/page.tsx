"use client";

import { useAdminTenant } from "@/hooks/use-admin-tenants";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Badge } from "@/components/ui/primitives";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft, Building, Mail, Phone, Calendar, DollarSign, Activity, AlertTriangle, Shield, Archive } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function TenantDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const { data: tenant, isLoading } = useAdminTenant(id);

    if (isLoading) return <div className="p-8">Loading tenant details...</div>;
    if (!tenant) return <div className="p-8">Tenant not found.</div>;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
                <div>
                    <Link href="/admin/tenants" className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm mb-2">
                        <ArrowLeft size={14} /> Back to Tenants
                    </Link>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight">{tenant.name}</h1>
                        <Badge variant={tenant.status === 'active' ? 'success' : 'destructive'} className="capitalize">
                            {tenant.status}
                        </Badge>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 border-red-200 dark:border-red-900">
                        <Archive size={16} className="mr-2" /> Archive
                    </Button>
                    <Button>
                        <Shield size={16} className="mr-2" /> Admin Access
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Profile Card */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Organization Profile</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">Email</label>
                            <div className="flex items-center gap-2">
                                <Mail size={14} className="text-muted-foreground" />
                                <span>{tenant.email}</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">Phone</label>
                            <div className="flex items-center gap-2">
                                <Phone size={14} className="text-muted-foreground" />
                                <span>{tenant.phone || 'N/A'}</span>
                            </div>
                        </div>
                        <div className="space-y-1 md:col-span-2">
                            <label className="text-xs font-medium text-muted-foreground">Address</label>
                            <div className="flex items-center gap-2">
                                <Building size={14} className="text-muted-foreground" />
                                <span>{tenant.address || 'N/A'}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Subscription Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Subscription</CardTitle>
                        <CardDescription>Current Plan Status</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-sm font-medium text-muted-foreground">Plan</span>
                            <Badge variant="secondary" className="font-mono">{tenant.plan}</Badge>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-sm font-medium text-muted-foreground">Joined</span>
                            <span className="text-sm">{format(new Date(tenant.created_at), "MMM d, yyyy")}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-muted-foreground">Renews</span>
                            <div className="flex items-center gap-2">
                                <Calendar size={14} className="text-primary" />
                                <span className="text-sm font-medium text-primary">{format(new Date(tenant.renews_at), "MMM d, yyyy")}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Lifetime Revenue</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold flex items-center gap-2">
                            <DollarSign className="text-green-500" size={24} />
                            ${tenant.stats?.revenue?.toLocaleString() || 0}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold flex items-center gap-2">
                            <Activity className="text-blue-500" size={24} />
                            {tenant.stats?.orders?.toLocaleString() || 0}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Users</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{tenant.stats?.users || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Branches</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{tenant.stats?.branches || 0}</div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
