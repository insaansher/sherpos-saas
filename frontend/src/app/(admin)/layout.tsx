import "@/app/globals.css";
import QueryProvider from "@/providers/query-provider";
import AuthGate from "@/components/auth-gate";
import AdminLayoutContent from "@/components/admin-layout-content";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <QueryProvider>
            <AuthGate allowedRoles={['platform_admin']}>
                <AdminLayoutContent>{children}</AdminLayoutContent>
            </AuthGate>
        </QueryProvider>
    );
}
