"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Button, Card, CardHeader, CardTitle, CardContent } from "@/components/ui/primitives";
import { Save, Loader2, Globe, Mail, Phone, Share2, Rocket } from "lucide-react";
import { useState, useEffect } from "react";

export default function CMSSettingsPage() {
    const queryClient = useQueryClient();
    const [settings, setSettings] = useState<any>({
        siteName: "SherPOS",
        supportEmail: "support@sherpos.com",
        supportPhone: "+1 (555) 000-0000",
        social: {
            twitter: "https://twitter.com/sherpos",
            linkedin: "https://linkedin.com/company/sherpos"
        }
    });

    // In a real app, this would fetch from a /admin/cms/settings endpoint
    // For now, we'll store it in a special CMS page or nav record 'settings'
    const { data, isLoading } = useQuery({
        queryKey: ["admin", "cms", "global-settings"],
        queryFn: () => api.get("/public/cms/nav").then(res => res.data.settings)
    });

    useEffect(() => {
        if (data) setSettings(data);
    }, [data]);

    const saveMutation = useMutation({
        mutationFn: (newSettings: any) => api.post("/api/v1/admin/cms/nav", {
            location: "settings",
            items: newSettings
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "cms", "global-settings"] });
            alert("Global settings updated successfully!");
        }
    });

    const handleChange = (path: string, value: string) => {
        const parts = path.split('.');
        if (parts.length === 1) {
            setSettings({ ...settings, [path]: value });
        } else {
            setSettings({
                ...settings,
                [parts[0]]: { ...settings[parts[0]], [parts[1]]: value }
            });
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black italic uppercase tracking-tight">Global CMS Control</h1>
                    <p className="text-muted-foreground font-medium">Manage branding, contact info, and social presence across the entire website.</p>
                </div>
                <Button
                    size="lg"
                    className="h-14 px-8 font-black italic uppercase tracking-widest gap-2 shadow-xl shadow-primary/20"
                    onClick={() => saveMutation.mutate(settings)}
                    disabled={saveMutation.isPending}
                >
                    {saveMutation.isPending ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                    Save Platform Settings
                </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <Card className="border-2 border-muted overflow-hidden">
                    <CardHeader className="bg-muted/30 border-b-2 border-muted p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary"><Globe size={20} /></div>
                            <CardTitle className="text-lg font-black uppercase italic tracking-widest">Brand Identity</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest italic opacity-60">Site Display Name</label>
                            <input
                                className="w-full bg-muted/50 border-2 border-muted rounded-xl p-4 font-bold text-lg focus:border-primary outline-none transition-all"
                                value={settings.siteName}
                                onChange={(e) => handleChange('siteName', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest italic opacity-60">Logo URL (Icon)</label>
                            <input
                                className="w-full bg-muted/50 border-2 border-muted rounded-xl p-4 font-mono text-sm focus:border-primary outline-none transition-all"
                                value={settings.logoUrl}
                                placeholder="https://..."
                                onChange={(e) => handleChange('logoUrl', e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-2 border-muted overflow-hidden">
                    <CardHeader className="bg-muted/30 border-b-2 border-muted p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary"><Mail size={20} /></div>
                            <CardTitle className="text-lg font-black uppercase italic tracking-widest">Support & Reach</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest italic opacity-60">Customer Support Email</label>
                            <input
                                className="w-full bg-muted/50 border-2 border-muted rounded-xl p-4 font-bold focus:border-primary outline-none transition-all"
                                value={settings.supportEmail}
                                onChange={(e) => handleChange('supportEmail', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest italic opacity-60">Public Phone Number</label>
                            <input
                                className="w-full bg-muted/50 border-2 border-muted rounded-xl p-4 font-bold focus:border-primary outline-none transition-all"
                                value={settings.supportPhone}
                                onChange={(e) => handleChange('supportPhone', e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-2 border-muted overflow-hidden col-span-full">
                    <CardHeader className="bg-muted/30 border-b-2 border-muted p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary"><Share2 size={20} /></div>
                            <CardTitle className="text-lg font-black uppercase italic tracking-widest">Social Media Connections</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 grid md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest italic opacity-60">Twitter Profile</label>
                            <input
                                className="w-full bg-muted/50 border-2 border-muted rounded-xl p-4 font-medium focus:border-primary outline-none transition-all"
                                value={settings.social?.twitter}
                                onChange={(e) => handleChange('social.twitter', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest italic opacity-60">LinkedIn Page</label>
                            <input
                                className="w-full bg-muted/50 border-2 border-muted rounded-xl p-4 font-medium focus:border-primary outline-none transition-all"
                                value={settings.social?.linkedin}
                                onChange={(e) => handleChange('social.linkedin', e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="bg-[#0F172A] p-12 rounded-[2.5rem] border-4 border-slate-800 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px]" />
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-2">
                        <h3 className="text-2xl font-black text-white italic tracking-tight uppercase underline decoration-primary decoration-4 underline-offset-8">Live Website Preview</h3>
                        <p className="text-slate-400 font-medium">Your changes are published instantly after saving. Changes affect navbar, footer, and emails.</p>
                    </div>
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 h-12 px-6 rounded-full font-bold gap-2">
                        <Rocket size={18} /> View Live Website
                    </Button>
                </div>
            </div>
        </div>
    );
}
