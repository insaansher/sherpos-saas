"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from "@/components/ui/primitives";
import { Layers, FileText, Image as ImageIcon, Users, MessageSquare, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function CMSOverview() {
    const { data: pages } = useQuery({ queryKey: ["admin", "cms", "pages"], queryFn: () => api.get("/api/v1/admin/cms/pages").then(res => res.data) });
    const { data: leads } = useQuery({ queryKey: ["admin", "cms", "leads"], queryFn: () => api.get("/api/v1/admin/cms/leads").then(res => res.data) });
    const { data: messages } = useQuery({ queryKey: ["admin", "cms", "messages"], queryFn: () => api.get("/api/v1/admin/cms/contact-messages").then(res => res.data) });

    const stats = [
        { title: "Published Pages", value: pages?.filter((p: any) => p.status === 'published').length || 0, icon: Layers, color: "text-blue-500", link: "/admin/cms/pages" },
        { title: "Growth Leads", value: leads?.length || 0, icon: Users, color: "text-green-500", link: "/admin/cms/leads" },
        { title: "Inbound Messages", value: messages?.length || 0, icon: MessageSquare, color: "text-purple-500", link: "/admin/cms/contact-messages" },
    ];

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Marketing CMS Control</h1>
                    <p className="text-muted-foreground">Manage your website content, blog, and growth leads.</p>
                </div>
                <Link href="/" target="_blank">
                    <Button variant="outline" className="gap-2">
                        <ExternalLink size={16} />
                        View Website
                    </Button>
                </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                            <stat.icon size={20} className={stat.color} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <Link href={stat.link} className="text-xs text-muted-foreground hover:text-primary mt-1 block">
                                Manage &rarr;
                            </Link>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Messages</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {messages?.slice(0, 5).map((m: any) => (
                                <div key={m.id} className="flex justify-between items-center p-3 rounded-lg border bg-muted/30">
                                    <div>
                                        <div className="font-medium">{m.subject || "No Subject"}</div>
                                        <div className="text-xs text-muted-foreground">{m.name} ({m.email})</div>
                                    </div>
                                    <Badge variant={m.status === 'new' ? 'default' : 'secondary'}>{m.status}</Badge>
                                </div>
                            ))}
                            {(!messages || messages.length === 0) && (
                                <div className="text-center py-8 text-muted-foreground">No messages yet.</div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Leads</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {leads?.slice(0, 5).map((l: any) => (
                                <div key={l.id} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                        {l.email[0].toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-medium">{l.email}</div>
                                        <div className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleDateString()} via {l.source}</div>
                                    </div>
                                </div>
                            ))}
                            {(!leads || leads.length === 0) && (
                                <div className="text-center py-8 text-muted-foreground">No leads yet.</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
