"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, CardContent, Button, Badge } from "@/components/ui/primitives";
import { Layers, Plus, Pencil, Trash2, ExternalLink, Settings } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function PagesManager() {
    const queryClient = useQueryClient();
    const { data: pages, isLoading } = useQuery({
        queryKey: ["admin", "cms", "pages"],
        queryFn: () => api.get("/api/v1/admin/cms/pages").then(res => res.data)
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => api.post("/api/v1/admin/cms/pages", data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "cms", "pages"] })
    });

    const handleCreateDefault = () => {
        const title = prompt("Enter Page Title:");
        const slug = prompt("Enter Slug (e.g. features):");
        if (title && slug) {
            createMutation.mutate({ title, slug });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Pages Builder</h1>
                    <p className="text-muted-foreground">Create and manage your website pages and their sections.</p>
                </div>
                <Button onClick={handleCreateDefault} className="gap-2">
                    <Plus size={18} />
                    Create New Page
                </Button>
            </div>

            <div className="grid gap-4">
                {isLoading ? (
                    <div>Loading...</div>
                ) : (
                    pages?.map((page: any) => (
                        <Card key={page.id} className="hover:border-primary/50 transition-colors">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="bg-muted p-2 rounded-lg">
                                        <Layers className="text-muted-foreground" size={20} />
                                    </div>
                                    <div>
                                        <div className="font-bold flex items-center gap-2">
                                            {page.title}
                                            <Badge variant={page.status === 'published' ? 'success' : 'outline'}>
                                                {page.status}
                                            </Badge>
                                        </div>
                                        <div className="text-sm text-muted-foreground italic">/{page.slug === 'home' ? '' : page.slug}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Link href={`/${page.slug === 'home' ? '' : page.slug}`} target="_blank">
                                        <Button variant="ghost" size="icon" title="View Public"><ExternalLink size={18} /></Button>
                                    </Link>
                                    <Link href={`/admin/cms/pages/${page.id}`}>
                                        <Button variant="ghost" size="icon" title="Edit Sections"><Pencil size={18} /></Button>
                                    </Link>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10"><Trash2 size={18} /></Button>
                                    <Button variant="outline" size="sm" className="ml-2 gap-2">
                                        <Settings size={14} />
                                        SEO Meta
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
