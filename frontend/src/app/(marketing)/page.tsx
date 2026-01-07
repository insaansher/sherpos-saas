"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { SectionRenderer } from "@/components/website/section-renderer";
import { Loader2 } from "lucide-react";

export default function LandingPage() {
    const { data, isLoading, error } = useQuery({
        queryKey: ["public", "page", "home"],
        queryFn: async () => {
            const res = await api.get("/public/cms/page/home");
            return res.data;
        }
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
                <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
                <p className="text-muted-foreground">We couldn't load the homepage. Please try again later.</p>
            </div>
        );
    }

    return (
        <main className="min-h-screen h-full w-full">
            <SectionRenderer sections={data.sections} />
        </main>
    );
}
