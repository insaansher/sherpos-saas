import "@/app/globals.css";
import QueryProvider from "@/providers/query-provider";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={`${inter.className} bg-gray-50 flex items-center justify-center min-h-screen`}>
                <QueryProvider>
                    {children}
                </QueryProvider>
            </body>
        </html>
    );
}
