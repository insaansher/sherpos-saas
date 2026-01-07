"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription, Badge, Button, Input } from "@/components/ui/primitives";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, UserPlus, Shield } from "lucide-react";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export default function AdminUsersPage() {
    const { data: users, isLoading } = useQuery({
        queryKey: ["admin", "users"],
        queryFn: async () => {
            const res = await api.get("/admin/users");
            return res.data;
        }
    });

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Platform Users</h1>
                    <p className="text-muted-foreground">Manage super admins and support staff access.</p>
                </div>
                <Button className="gap-2"><UserPlus size={16} /> Invite Admin</Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Team Members</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search team..." className="pl-9" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Last Active</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow><TableCell colSpan={5} className="text-center h-24">Loading users...</TableCell></TableRow>
                            ) : users?.map((user: any) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="font-medium">{user.name}</div>
                                        <div className="text-xs text-muted-foreground">{user.email}</div>
                                    </TableCell>
                                    <TableCell><Badge variant="default">{user.role}</Badge></TableCell>
                                    <TableCell><Badge variant="success">Active</Badge></TableCell>
                                    <TableCell className="text-xs text-muted-foreground">{user.last_active}</TableCell>
                                    <TableCell className="text-right"><Button variant="ghost" size="sm">Manage</Button></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
