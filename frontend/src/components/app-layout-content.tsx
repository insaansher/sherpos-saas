"use client";

import { useAuth } from "@/hooks/use-auth";
import LogoutButton from "@/components/logout-button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { LayoutDashboard, ShoppingBag, Box, Truck, Receipt, BarChart2, Repeat, Computer } from "lucide-react";

export default function AppLayoutContent({ children }: { children: React.ReactNode }) {
    const { tenant, user } = useAuth();
    const pathname = usePathname();

    const links = [
        { href: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/app/products", label: "Products", icon: ShoppingBag },
        { href: "/app/inventory", label: "Inventory", icon: Box },
        { href: "/app/purchases", label: "Purchases", icon: Truck },
        { href: "/app/suppliers", label: "Suppliers", icon: Truck },
        { href: "/app/returns", label: "Returns", icon: Repeat },
        { href: "/app/reports", label: "Reports", icon: BarChart2 },
        { href: "/app/billing", label: "Billing", icon: Receipt },
    ];

    return (
        <>
            <aside className="w-64 bg-slate-900 text-white flex flex-col transition-all duration-300">
                <div className="p-6 border-b border-slate-800">
                    <div className="font-bold text-xl tracking-tight text-white">SherPOS</div>
                    {tenant && <div className="text-xs text-slate-400 mt-1 truncate">{tenant.name}</div>}
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {links.map(link => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={clsx(
                                "flex items-center gap-3 p-3 rounded-lg transition",
                                pathname.startsWith(link.href) ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                            )}
                        >
                            <link.icon size={18} />
                            <span>{link.label}</span>
                        </Link>
                    ))}

                    {/* Only show if onboarding complete */}
                    {tenant?.onboarding_completed && (
                        <>
                            <hr className="my-4 border-slate-800" />
                            <Link href="/pos" className="flex items-center justify-center gap-2 p-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-lg shadow-blue-900/20">
                                <Computer size={18} />
                                Launch POS
                            </Link>
                        </>
                    )}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">
                            {user?.full_name?.[0] || "U"}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{user?.full_name}</div>
                            <div className="text-xs text-slate-500 truncate capitalize">{user?.role}</div>
                        </div>
                    </div>
                    <LogoutButton />
                </div>
            </aside>
            <main className="flex-1 overflow-auto p-8 bg-gray-50">
                {children}
            </main>
        </>
    )
}
