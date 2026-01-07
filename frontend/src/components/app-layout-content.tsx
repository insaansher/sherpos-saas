"use client";

import { useAuth } from "@/hooks/use-auth";
import LogoutButton from "@/components/logout-button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    ShoppingBag,
    Package,
    Truck,
    CreditCard,
    BarChart3,
    Undo2,
    Store,
    MonitorPlay,
    Settings,
    Search,
    Bell,
    Menu,
    X
} from "lucide-react";
import { Button } from "@/components/ui/primitives";
import { useState } from "react";

export default function AppLayoutContent({ children }: { children: React.ReactNode }) {
    const { tenant, user } = useAuth();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);

    const sections = [
        {
            title: "Overview",
            links: [
                { href: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
            ]
        },
        {
            title: "Operations",
            links: [
                { href: "/app/products", label: "Products", icon: ShoppingBag },
                { href: "/app/inventory", label: "Inventory", icon: Package },
                { href: "/app/purchases", label: "Purchases", icon: Truck },
                { href: "/app/suppliers", label: "Suppliers", icon: Store },
                { href: "/app/returns", label: "Returns", icon: Undo2 },
            ]
        },
        {
            title: "Growth",
            links: [
                { href: "/app/reports", label: "Analytics", icon: BarChart3 },
                { href: "/app/billing", label: "Billing", icon: CreditCard },
                { href: "/app/settings", label: "Settings", icon: Settings },
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
                    "fixed lg:static inset-y-0 left-0 z-50 bg-card border-r w-64 transform transition-transform duration-200 ease-in-out flex flex-col h-full",
                    mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
                    !sidebarOpen && "lg:w-20"
                )}
            >
                {/* Sidebar Header */}
                <div className="h-16 flex items-center justify-between px-6 border-b shrink-0">
                    <div className={cn("font-bold text-lg tracking-tight flex items-center gap-2", !sidebarOpen && "justify-center w-full px-0")}>
                        <div className="bg-primary text-primary-foreground p-1.5 rounded-lg shadow-sm">
                            <Store size={20} />
                        </div>
                        {sidebarOpen && <span className="truncate">SherPOS</span>}
                    </div>
                    {sidebarOpen && (
                        <button onClick={() => setMobileOpen(false)} className="lg:hidden text-muted-foreground">
                            <X size={20} />
                        </button>
                    )}
                </div>

                {/* Sidebar Links */}
                <div className="flex-1 overflow-y-auto py-6 px-3 space-y-6">
                    {sections.map(section => (
                        <div key={section.title}>
                            {sidebarOpen && (
                                <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider animate-fade-in">
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
                                            pathname === link.href
                                                ? "bg-primary text-primary-foreground shadow-md"
                                                : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                            !sidebarOpen && "justify-center px-2"
                                        )}
                                        title={!sidebarOpen ? link.label : undefined}
                                    >
                                        <link.icon size={20} strokeWidth={pathname === link.href ? 2.5 : 2} className={cn("shrink-0", pathname === link.href && "animate-pulse-slow")} />
                                        {sidebarOpen && <span>{link.label}</span>}

                                        {!sidebarOpen && (
                                            <div className="absolute left-16 bg-popover text-popover-foreground px-2 py-1 rounded-md text-xs shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                                                {link.label}
                                            </div>
                                        )}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Sidebar Footer */}
                <div className={cn("p-4 border-t space-y-4 bg-muted/10", !sidebarOpen && "items-center flex flex-col")}>
                    {tenant?.onboarding_completed && sidebarOpen ? (
                        <Button asChild variant="default" className="w-full justify-start gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 border-0 hover:opacity-90">
                            <Link href="/pos" target="_blank">
                                <MonitorPlay size={16} />
                                Launch POS
                            </Link>
                        </Button>
                    ) : (
                        <Button size="icon" variant="ghost" className="rounded-full" title="Launch POS" asChild>
                            <Link href="/pos" target="_blank"><MonitorPlay size={20} /></Link>
                        </Button>
                    )}

                    <div className={cn("flex items-center gap-3", !sidebarOpen && "flex-col justify-center")}>
                        <ThemeToggle />
                        {sidebarOpen && <LogoutButton />}
                    </div>
                </div>
            </aside>


            {/* Main Content Wrappper */}
            <main className="flex-1 flex flex-col min-w-0 bg-muted/10 h-full">

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
                            <span className="text-foreground">{tenant?.name}</span>
                            <span className="mx-2">/</span>
                            <span className="text-foreground capitalize">{pathname.split('/').pop()}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative hidden md:block">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search products, orders..."
                                className="h-9 w-64 lg:w-80 rounded-full border bg-muted/50 pl-9 pr-4 text-sm focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>

                        <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background"></span>
                        </button>

                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs ring-2 ring-background">
                            {user?.name?.charAt(0) || 'U'}
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
