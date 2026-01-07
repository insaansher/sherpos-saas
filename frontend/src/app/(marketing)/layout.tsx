import type { Metadata } from "next";
import QueryProvider from "@/providers/query-provider";
import WebsiteNavbar from "@/components/website/navbar";
import Link from "next/link";
import { Rocket } from "lucide-react";

export const metadata: Metadata = {
    title: "SherPOS - The Modern Cloud POS",
    description: "Enterprise-grade point of sale, inventory, and analytics for growing businesses.",
};

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <QueryProvider>
            <div className="flex flex-col min-h-screen font-sans bg-background selection:bg-primary/20 transition-colors duration-300">
                <WebsiteNavbar />

                <main className="flex-1 w-full pt-16">
                    {children}
                </main>

                <footer className="border-t border-border bg-muted/30 py-16">
                    <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-12">
                        <div className="col-span-2 md:col-span-1">
                            <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-4">
                                <div className="bg-primary p-1 rounded-lg text-white"><Rocket size={18} /></div>
                                <span>SherPOS</span>
                            </Link>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Empowering retailers with next-gen tools to manage operations seamlessly. Built for the future of commerce.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold text-sm uppercase tracking-wider mb-6">Product</h4>
                            <ul className="space-y-4 text-sm text-muted-foreground">
                                <li><Link href="/features" className="hover:text-primary transition-colors">Features</Link></li>
                                <li><Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
                                <li><Link href="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-sm uppercase tracking-wider mb-6">Company</h4>
                            <ul className="space-y-4 text-sm text-muted-foreground">
                                <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                                <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
                                <li><Link href="/careers" className="hover:text-primary transition-colors">Careers</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-sm uppercase tracking-wider mb-6">Legal</h4>
                            <ul className="space-y-4 text-sm text-muted-foreground">
                                <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                                <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="max-w-7xl mx-auto px-4 mt-16 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
                        <p>© {new Date().getFullYear()} SherPOS Inc. All rights reserved.</p>
                        <div className="flex gap-4">
                            <span>Designed with ❤️ in 2026</span>
                        </div>
                    </div>
                </footer>
            </div>
        </QueryProvider>
    );
}
