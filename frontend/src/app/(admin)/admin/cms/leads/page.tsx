"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, CardContent, Badge, Button } from "@/components/ui/primitives";
import { Mail, MessageSquare, Download, CheckCircle2 } from "lucide-react";

export default function GrowthLeads() {
    const { data: leads, isLoading: leadsLoading } = useQuery({
        queryKey: ["admin", "cms", "leads"],
        queryFn: () => api.get("/api/v1/admin/cms/leads").then(res => res.data)
    });

    const { data: messages, isLoading: msgsLoading } = useQuery({
        queryKey: ["admin", "cms", "messages"],
        queryFn: () => api.get("/api/v1/admin/cms/contact-messages").then(res => res.data)
    });

    return (
        <div className="space-y-12">
            {/* Contact Messages */}
            <section className="space-y-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <MessageSquare className="text-primary" />
                            Contact Inbox
                        </h2>
                        <p className="text-sm text-muted-foreground">Inquiries from the contact form.</p>
                    </div>
                </div>

                <div className="border rounded-xl overflow-hidden bg-card">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-muted text-muted-foreground font-medium border-b">
                            <tr>
                                <th className="px-6 py-4">Sender</th>
                                <th className="px-6 py-4">Subject & Message</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {messages?.map((m: any) => (
                                <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold">{m.name}</div>
                                        <div className="text-xs text-muted-foreground">{m.email}</div>
                                    </td>
                                    <td className="px-6 py-4 max-w-md">
                                        <div className="font-medium truncate">{m.subject}</div>
                                        <div className="text-xs text-muted-foreground line-clamp-2">{m.message}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant={m.status === 'new' ? 'default' : 'outline'}>{m.status}</Badge>
                                    </td>
                                    <td className="px-6 py-4 text-right text-muted-foreground text-xs whitespace-nowrap">
                                        {new Date(m.created_at).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {(!messages || messages.length === 0) && (
                        <div className="py-20 text-center text-muted-foreground">No messages yet.</div>
                    )}
                </div>
            </section>

            {/* Newsletter Leads */}
            <section className="space-y-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <Mail className="text-green-500" />
                            Newsletter Leads
                        </h2>
                        <p className="text-sm text-muted-foreground">Email subscribers for marketing.</p>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2">
                        <Download size={14} />
                        Export CSV
                    </Button>
                </div>

                <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {leads?.map((l: any) => (
                        <Card key={l.id} className="bg-gradient-to-br from-background to-muted/20">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="p-2 rounded-full bg-green-500/10 text-green-600">
                                    <CheckCircle2 size={18} />
                                </div>
                                <div className="flex-1 truncate">
                                    <div className="font-bold text-sm truncate">{l.email}</div>
                                    <div className="text-[10px] text-muted-foreground">Joined {new Date(l.created_at).toLocaleDateString()}</div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {(!leads || leads.length === 0) && (
                        <div className="col-span-full py-12 text-center border-2 border-dashed rounded-xl text-muted-foreground">
                            No newsletter signups yet.
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
