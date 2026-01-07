import QueryProvider from "@/providers/query-provider";
import AppLayoutContent from "@/components/app-layout-content";
import AuthGate from "@/components/auth-gate";
import { ThemeProvider } from "@/components/theme/theme-provider";

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Note: ThemeProvider is already in root layout, but we need AuthGate and QueryProvider here specific to the app
    return (
        <QueryProvider>
            <AuthGate allowedRoles={['owner', 'manager']}>
                <AppLayoutContent>{children}</AppLayoutContent>
            </AuthGate>
        </QueryProvider>
    );
}
