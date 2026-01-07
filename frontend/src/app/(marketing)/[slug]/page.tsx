"use client";

import React, { use } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { SectionRenderer } from "@/components/website/section-renderer";
import { Loader2 } from "lucide-react";

export default function DynamicCmsPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);

    const { data, isLoading, error } = useQuery({
        queryKey: ["public", "page", slug],
        queryFn: async () => {
            const res = await api.get(`/public/cms/page/${slug}`);
            return res.data;
        },
        retry: false
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={40} />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
                <h1 className="text-4xl font-bold mb-4">404</h1>
                <p className="text-muted-foreground text-xl">The page you are looking for doesn't exist.</p>
            </div>
        );
    }

    return (
        <main className="min-h-screen">
            <div className="bg-slate-50 dark:bg-slate-900 py-20 border-b border-border">
                <div className="max-w-7xl mx-auto px-4">
                    <h1 className="text-4xl md:text-5xl font-bold">{data.page.title}</h1>
                </div>
            </div>
            <SectionRenderer sections={data.sections} />
        </main>
    );
}
