"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Button, Card, CardHeader, CardTitle, Badge } from "@/components/ui/primitives";
import { Plus, Trash2, ArrowUp, ArrowDown, ExternalLink, Save, Check, Loader2, HelpCircle } from "lucide-react";
import { useState, use } from "react";
import Link from "next/link";

const SECTION_TYPES = [
    { type: 'hero', label: 'Hero Landing', icon: '🚀' },
    { type: 'logo_cloud', label: 'Trust Logos', icon: '🏢' },
    { type: 'features_grid', label: 'Feature Grid', icon: '📦' },
    { type: 'split_content', label: 'Split Content', icon: '↔️' },
    { type: 'stats', label: 'Stats Band', icon: '📊' },
    { type: 'testimonials', label: 'Social Proof', icon: '💬' },
    { type: 'pricing', label: 'Pricing Table', icon: '💰' },
    { type: 'faq', label: 'FAQ Accordion', icon: '❓' },
    { type: 'cta_band', label: 'CTA Section', icon: '🎯' },
];

export default function PageSectionsEditor({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const queryClient = useQueryClient();
    const [editingSectionId, setEditingSectionId] = useState<string | null>(null);

    const { data: sections, isLoading } = useQuery({
        queryKey: ["admin", "cms", "sections", id],
        queryFn: () => api.get(`/api/v1/admin/cms/sections?page_id=${id}`).then(res => res.data)
    });

    const createSectionMutation = useMutation({
        mutationFn: (type: string) => {
            let defaultContent: any = {};
            if (type === 'hero') defaultContent = { headline: "World-Class POS for Retail", subheadline: "Scale your commerce with ease.", cta_text: "Get Started Free", badge: "NEW v4.0" };
            if (type === 'logo_cloud') defaultContent = { title: "Trusted by Industry Leaders" };
            if (type === 'features_grid') defaultContent = { title: "Why Choose SherPOS?", items: [{ title: "Ultra Fast Checkout", desc: "Process sales in milliseconds." }] };
            if (type === 'split_content') defaultContent = { tag: "MANAGEMENT", headline: "Control everything from one place", body: "Powerful dashboard with real-time updates.", bullets: ["Live Inventory", "Sales Analytics", "Staff Tracking"], image_side: "right" };
            if (type === 'stats') defaultContent = { stats: [{ value: "99.9%", label: "Uptime" }, { value: "50k+", label: "Users" }] };
            if (type === 'testimonials') defaultContent = { testimonials: [{ quote: "Best POS we ever used.", author: "John Doe", role: "Cafe Owner" }] };
            if (type === 'pricing') defaultContent = { title: "Simple Pricing", plans: [{ name: "Starter", price: "0", features: ["1 Store", "Basics"], popular: false }] };
            if (type === 'faq') defaultContent = { faqs: [{ question: "Is it free?", answer: "Yes, we have a free starter plan." }] };
            if (type === 'cta_band') defaultContent = { title: "Ready to scale?", description: "Join 50,000+ businesses today.", cta_label: "Get Started" };

            return api.post("/api/v1/admin/cms/sections", {
                page_id: id,
                type,
                content: defaultContent
            });
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "cms", "sections", id] })
    });

    const updateSectionMutation = useMutation({
        mutationFn: ({ sectionId, data }: any) => api.put(`/api/v1/admin/cms/sections/${sectionId}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "cms", "sections", id] });
            setEditingSectionId(null);
        }
    });

    const deleteSectionMutation = useMutation({
        mutationFn: (sectionId: string) => api.delete(`/api/v1/admin/cms/sections/${sectionId}`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "cms", "sections", id] })
    });

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black italic uppercase tracking-tight">Marketing Page Builder</h1>
                    <p className="text-muted-foreground font-medium">Design premium landing pages with a single click.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {SECTION_TYPES.map(s => (
                        <Button key={s.type} variant="secondary" size="sm" className="font-bold gap-2 bg-primary/5 hover:bg-primary/10 border border-primary/10" onClick={() => createSectionMutation.mutate(s.type)}>
                            <span>{s.icon}</span> {s.label}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="grid gap-6">
                {isLoading ? (
                    <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary" size={40} /></div>
                ) : (
                    sections?.map((section: any, index: number) => (
                        <Card key={section.id} className={cn("overflow-hidden border-2 transition-all", editingSectionId === section.id ? "border-primary shadow-xl" : "border-muted hover:border-muted-foreground/30")}>
                            <CardHeader className="bg-muted/30 p-4 flex flex-row items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-slate-950 text-white flex items-center justify-center font-black italic text-xs">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <CardTitle className="text-sm font-black uppercase italic tracking-widest">{section.type.replace(/_/g, ' ')}</CardTitle>
                                        <p className="text-[10px] text-muted-foreground font-mono truncate max-w-[200px]">{section.id}</p>
                                    </div>
                                    {!section.enabled && <Badge variant="destructive">Disabled</Badge>}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteSectionMutation.mutate(section.id)}><Trash2 size={16} /></Button>
                                    <div className="flex flex-col gap-1 mx-2 overflow-hidden rounded bg-muted">
                                        <button className="p-1 hover:bg-primary/20 transition-colors"><ArrowUp size={12} /></button>
                                        <button className="p-1 hover:bg-primary/20 transition-colors"><ArrowDown size={12} /></button>
                                    </div>
                                    <Button className="font-bold italic uppercase text-xs tracking-widest" size="sm" onClick={() => setEditingSectionId(editingSectionId === section.id ? null : section.id)}>
                                        {editingSectionId === section.id ? "Close" : "Edit Design"}
                                    </Button>
                                </div>
                            </CardHeader>
                            {editingSectionId === section.id && (
                                <div className="p-8 border-t bg-card animate-in fade-in slide-in-from-top-4 duration-300">
                                    <SectionForm section={section} onSave={(formContent: any) => updateSectionMutation.mutate({ sectionId: section.id, data: formContent })} isLoading={updateSectionMutation.isPending} />
                                </div>
                            )}
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}

function SectionForm({ section, onSave, isLoading }: any) {
    const [content, setContent] = useState(section.content);

    const handleChange = (key: string, val: any) => {
        setContent({ ...content, [key]: val });
    };

    return (
        <div className="space-y-8 max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {section.type === 'hero' && (
                    <>
                        <div className="space-y-4">
                            <label className="text-xs font-black uppercase tracking-widest italic">Headline</label>
                            <textarea className="w-full bg-muted/50 border-2 border-muted rounded-xl p-4 min-h-[100px] font-bold text-lg" value={content.headline} onChange={(e) => handleChange('headline', e.target.value)} />
                        </div>
                        <div className="space-y-4">
                            <label className="text-xs font-black uppercase tracking-widest italic">Sub-headline</label>
                            <textarea className="w-full bg-muted/50 border-2 border-muted rounded-xl p-4 min-h-[100px] font-medium" value={content.subheadline} onChange={(e) => handleChange('subheadline', e.target.value)} />
                        </div>
                    </>
                )}

                {section.type === 'split_content' && (
                    <>
                        <div className="space-y-4">
                            <label className="text-xs font-black uppercase tracking-widest italic">Headline</label>
                            <input className="w-full bg-muted/50 border-2 border-muted rounded-xl p-4 font-bold" value={content.headline} onChange={(e) => handleChange('headline', e.target.value)} />
                        </div>
                        <div className="space-y-4">
                            <label className="text-xs font-black uppercase tracking-widest italic">Body Content</label>
                            <textarea className="w-full bg-muted/50 border-2 border-muted rounded-xl p-4 min-h-[100px]" value={content.body} onChange={(e) => handleChange('body', e.target.value)} />
                        </div>
                    </>
                )}
            </div>

            <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-widest italic block">Dynamic Data (JSON)</label>
                <div className="relative group">
                    <div className="absolute top-2 right-2 flex gap-2">
                        <Badge variant="outline" className="bg-slate-900/50 text-green-400 font-mono text-[10px]">VALID JSON</Badge>
                    </div>
                    <textarea
                        className="w-full font-mono text-xs bg-[#0F172A] text-blue-100 p-6 rounded-2xl h-[300px] border-4 border-slate-800 shadow-inner focus:border-primary/50 transition-colors"
                        value={JSON.stringify(content, null, 2)}
                        onChange={(e) => {
                            try { setContent(JSON.parse(e.target.value)) } catch (err) { }
                        }}
                    />
                </div>
                <p className="text-xs text-muted-foreground font-medium flex items-center gap-2">
                    <HelpCircle size={14} /> Power user tip: Edit the raw JSON for nested lists like pricing plans, FAQs, and stats.
                </p>
            </div>

            <Button onClick={() => onSave({ content })} disabled={isLoading} className="w-full h-14 gap-2 font-black italic uppercase tracking-widest shadow-xl shadow-primary/20">
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                {isLoading ? "Publishing Changes..." : "Publish to Production"}
            </Button>
        </div>
    );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}
