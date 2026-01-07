"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import Link from "next/link";
import { Button } from "@/components/ui/primitives";
import { Menu, X, Rocket } from "lucide-react";
import { useState } from "react";

export default function WebsiteNavbar() {
    const [isOpen, setIsOpen] = useState(false);

    const { data: navs } = useQuery({
        queryKey: ["public", "nav"],
        queryFn: async () => {
            const res = await api.get("/public/cms/nav");
            return res.data;
        }
    });

    const headerLinks = navs?.header || [
        { label: "Features", href: "/features" },
        { label: "Pricing", href: "/pricing" },
        { label: "Contact", href: "/contact" }
    ];

    return (
        <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="bg-primary p-1.5 rounded-lg text-white">
                            <Rocket size={20} />
                        </div>
                        <span className="font-bold text-xl tracking-tight">SherPOS</span>
                    </Link>

                    {/* Desktop */}
                    <div className="hidden md:flex items-center gap-8">
                        {headerLinks.map((link: any, i: number) => (
                            <Link key={i} href={link.href} className="text-sm font-medium hover:text-primary transition-colors">
                                {link.label}
                            </Link>
                        ))}
                        <Link href="/login">
                            <Button variant="ghost" size="sm">Login</Button>
                        </Link>
                        <Link href="/register">
                            <Button size="sm">Get Started</Button>
                        </Link>
                    </div>

                    {/* Mobile toggle */}
                    <div className="md:hidden">
                        <button onClick={() => setIsOpen(!isOpen)} className="p-2">
                            {isOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isOpen && (
                <div className="md:hidden bg-background border-b border-border p-4 space-y-4 animate-in slide-in-from-top duration-200">
                    {headerLinks.map((link: any, i: number) => (
                        <Link key={i} href={link.href} className="block text-lg font-medium py-2" onClick={() => setIsOpen(false)}>
                            {link.label}
                        </Link>
                    ))}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <Link href="/login" className="w-full"><Button variant="outline" className="w-full">Login</Button></Link>
                        <Link href="/register" className="w-full"><Button className="w-full">Sign Up</Button></Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
