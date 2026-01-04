import "@/app/globals.css";
import { Inter } from "next/font/google";
import QueryProvider from "@/providers/query-provider";
import AppLayoutContent from "@/components/app-layout-content";
import AuthGate from "@/components/auth-gate";

const inter = Inter({ subsets: ["latin"] });

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={`${inter.className} bg-gray-50 h-screen flex overflow-hidden`}>
                <QueryProvider>
                    <AuthGate allowedRoles={['owner', 'manager']}>
                        <AppLayoutContent>{children}</AppLayoutContent>
                    </AuthGate>
                </QueryProvider>
            </body>
        </html>
    );
}
