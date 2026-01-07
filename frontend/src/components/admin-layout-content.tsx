"use client";

import { useAuth } from "@/hooks/use-auth";
import LogoutButton from "@/components/logout-button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Users,
    CreditCard,
    Layers,
    Activity,
    Settings,
    Shield,
    Bell,
    Menu,
    X,
    Search,
    Lock,
    FileText,
    Database
} from "lucide-react";
import { Button, Badge } from "@/components/ui/primitives";
import { useState } from "react";

export default function AdminLayoutContent({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);

    const sections = [
        {
            title: "Executive",
            links: [
                { href: "/admin", label: "Control Tower", icon: LayoutDashboard },
                { href: "/admin/analytics", label: "Business Intelligence", icon: Activity },
            ]
        },
        {
            title: "Tenant Operations",
            links: [
                { href: "/admin/tenants", label: "Tenants Lifecycle", icon: Users },
                { href: "/admin/subscriptions", label: "Billing & Revenue", icon: CreditCard },
                { href: "/admin/users", label: "User Management", icon: Users },
            ]
        },
        {
            title: "Product Engine",
            links: [
                { href: "/admin/plans", label: "Plans & Packages", icon: Layers },
                { href: "/admin/features", label: "Feature Flags", icon: Lock },
            ]
        },
        {
            title: "Governance",
            links: [
                { href: "/admin/audit-logs", label: "Audit & Compliance", icon: FileText },
                { href: "/admin/security", label: "Security Center", icon: Shield },
                { href: "/admin/data", label: "Data Governance", icon: Database },
            ]
        },
        {
            title: "Development",
            links: [
                { href: "/admin/notifications", label: "Comms Hub", icon: Bell },
                { href: "/admin/system", label: "System Health", icon: Activity },
                { href: "/admin/settings", label: "Configuration", icon: Settings },
            ]
        },
        {
            title: "Marketing CMS",
            links: [
                { href: "/admin/cms", label: "Dashboard", icon: LayoutDashboard },
                { href: "/admin/cms/pages", label: "Pages Builder", icon: Layers },
                { href: "/admin/cms/settings", label: "Site Config", icon: Settings },
                { href: "/admin/cms/blog", label: "Blog Editor", icon: FileText },
                { href: "/admin/cms/media", label: "Media Library", icon: Database },
                { href: "/admin/cms/leads", label: "Growth Leads", icon: Users },
            ]
        },
    ];

    return (
        <div className="flex bg-background h-screen overflow-hidden w-full">

            {/* Mobile Sidebar Overlay */}
            {mobileOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
            )}

            {/* Sidebar Navigation */}
            <aside
                className={cn(
                    "fixed lg:static inset-y-0 left-0 z-50 bg-background lg:bg-card border-r border-border w-64 transform transition-transform duration-200 ease-in-out flex flex-col h-full",
                    mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
                    !sidebarOpen && "lg:w-20"
                )}
            >
                {/* Sidebar Header */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-border shrink-0 bg-background">
                    <div className={cn("font-bold text-lg tracking-tight flex items-center gap-2", !sidebarOpen && "justify-center w-full px-0")}>
                        <div className="bg-primary text-primary-foreground p-1.5 rounded-lg shadow-sm">
                            <Shield size={20} />
                        </div>
                        {sidebarOpen && <span className="truncate text-foreground">SherPOS <span className="text-xs font-normal text-muted-foreground">Admin</span></span>}
                    </div>
                    {sidebarOpen && (
                        <button onClick={() => setMobileOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
                            <X size={20} />
                        </button>
                    )}
                </div>

                {/* Sidebar Links */}
                <div className="flex-1 overflow-y-auto py-6 px-3 space-y-8">
                    {sections.map(section => (
                        <div key={section.title}>
                            {sidebarOpen && (
                                <h3 className="px-3 mb-2 text-xs font-bold text-slate-500 uppercase tracking-widest animate-fade-in">
                                    {section.title}
                                </h3>
                            )}
                            <div className="space-y-1">
                                {section.links.map(link => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                                            pathname === link.href || pathname.startsWith(link.href + "/") && link.href !== "/admin"
                                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                                : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                            !sidebarOpen && "justify-center px-2"
                                        )}
                                        title={!sidebarOpen ? link.label : undefined}
                                    >
                                        <link.icon size={20} strokeWidth={pathname === link.href ? 2.5 : 2} className={cn("shrink-0")} />
                                        {sidebarOpen && <span>{link.label}</span>}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Sidebar Footer */}
                <div className={cn("p-4 border-t border-border space-y-4 bg-background", !sidebarOpen && "items-center flex flex-col")}>
                    <div className={cn("flex items-center gap-3", !sidebarOpen && "flex-col justify-center")}>
                        <ThemeToggle />
                        {sidebarOpen && <LogoutButton />}
                    </div>
                </div>
            </aside>


            {/* Main Content Wrappper */}
            <main className="flex-1 flex flex-col min-w-0 bg-muted/5 h-full">

                {/* Top Navbar */}
                <header className="h-16 border-b bg-background/80 backdrop-blur-md flex items-center justify-between px-4 lg:px-8 shrink-0 sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setMobileOpen(true)}
                            className="lg:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground"
                        >
                            <Menu size={24} />
                        </button>

                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="hidden lg:flex items-center justify-center p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                        >
                            <Menu size={20} />
                        </button>

                        <div className="hidden md:flex items-center text-sm font-medium text-muted-foreground">
                            <span className="text-foreground font-semibold">Super Admin Platform</span>
                            <span className="mx-2">/</span>
                            <span className="text-foreground capitalize">{pathname.split('/').pop()?.replace(/-/g, ' ')}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative hidden md:block">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search tenants, logs..."
                                className="h-9 w-64 lg:w-80 rounded-full border bg-muted/50 pl-9 pr-4 text-sm focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>

                        <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs ring-2 ring-border">
                            SA
                        </div>
                    </div>
                </header>

                {/* Content Viewport - 100% Width */}
                <div className="flex-1 overflow-auto p-4 lg:p-8 w-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
