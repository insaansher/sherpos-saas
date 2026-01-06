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
            <head>
                <link rel="manifest" href="/manifest.json" />
                <meta name="theme-color" content="#000000" />
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
            </head>
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
