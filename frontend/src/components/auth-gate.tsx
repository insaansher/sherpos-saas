"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface AuthGateProps {
    children: React.ReactNode;
    allowedRoles: string[];
}

export default function AuthGate({ children, allowedRoles }: AuthGateProps) {
    const { user, tenant, isLoading, isAuthenticated, error } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isRedirecting, setIsRedirecting] = useState(false);

    useEffect(() => {
        // If redirecting, do nothing (wait for router)
        if (isRedirecting) return;

        // 1. Loading State
        if (isLoading) return;

        // 2. Not Authenticated or Error
        if (!isAuthenticated || error) {
            // If we are on a protected route, middleware likely caught it, 
            // but if useAuth determines invalid/expired session, we redirect here.
            setIsRedirecting(true);
            router.push("/login");
            return;
        }

        if (!user) return; // Should be covered by isAuthenticated

        // 3. Role Check
        const role = user.role;

        // Platform Admin Logic
        if (role === 'platform_admin') {
            if (!allowedRoles.includes('platform_admin')) {
                // Admin trying to access Tenant App -> Redirect to Admin
                setIsRedirecting(true);
                router.push("/admin");
            }
            return; // Logic done for admin
        }

        // Tenant User Logic
        if (role !== 'platform_admin') {
            if (allowedRoles.includes('platform_admin') && !allowedRoles.includes(role)) {
                // Tenant user trying to access Admin -> Redirect to App
                setIsRedirecting(true);
                router.push("/app/dashboard");
                return;
            }

            if (!allowedRoles.includes(role)) {
                // User has role (e.g. cashier) but accessing restricted area (e.g. dashboard which might be owner only)
                // Default fallback
                setIsRedirecting(true);
                router.push("/pos"); // Cashiers go to POS?
                return;
            }

            // 4. Onboarding Logic
            if (tenant) {
                const isOnboardingPage = pathname === "/app/onboarding";

                if (!tenant.onboarding_completed) {
                    if (!isOnboardingPage) {
                        setIsRedirecting(true);
                        router.push("/app/onboarding");
                    }
                } else {
                    if (isOnboardingPage) {
                        setIsRedirecting(true);
                        router.push("/app/dashboard");
                    }
                }
            }
        }

    }, [isLoading, isAuthenticated, user, tenant, error, router, pathname, allowedRoles, isRedirecting]);

    // Show Loading if:
    // 1. Fetching user info (isLoading)
    // 2. We decided to redirect (isRedirecting) - prevents flash
    // 3. User is null (not yet determined)
    if (isLoading || isRedirecting || !isAuthenticated) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                    <div className="text-sm font-medium text-gray-500 animate-pulse">
                        {isRedirecting ? "Redirecting..." : "Verifying access..."}
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
