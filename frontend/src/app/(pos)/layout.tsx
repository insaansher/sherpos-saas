import "@/app/globals.css";
import { Inter } from "next/font/google";
import QueryProvider from "@/providers/query-provider";
import AuthGate from "@/components/auth-gate";

const inter = Inter({ subsets: ["latin"] });

export default function POSLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={`${inter.className} bg-gray-100 h-screen w-screen overflow-hidden flex flex-col`}>
                <QueryProvider>
                    <AuthGate allowedRoles={['owner', 'manager', 'cashier']}>
                        {children}
                    </AuthGate>
                </QueryProvider>
            </body>
        </html>
    );
}
