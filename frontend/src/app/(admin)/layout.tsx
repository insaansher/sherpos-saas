import "@/app/globals.css";
import { Inter } from "next/font/google";
import QueryProvider from "@/providers/query-provider";
import AuthGate from "@/components/auth-gate";

const inter = Inter({ subsets: ["latin"] });

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={`${inter.className} bg-slate-900 text-slate-300 min-h-screen`}>
                <QueryProvider>
                    <AuthGate allowedRoles={['platform_admin']}>
                        {children}
                    </AuthGate>
                </QueryProvider>
            </body>
        </html>
    );
}
