import "@/app/globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import QueryProvider from "@/providers/query-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SherPOS - Modern SaaS POS",
  description: "The best POS for your business",
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-gray-900 antialiased flex flex-col min-h-screen`}>
        <QueryProvider>
          <header className="border-b px-6 py-4 flex justify-between items-center bg-white sticky top-0 z-10">
            <div className="font-bold text-2xl tracking-tighter text-blue-600">SherPOS</div>
            <nav className="space-x-6 text-sm font-medium">
              <a href="/" className="hover:text-blue-600 transition-colors">Home</a>
              <a href="/features" className="hover:text-blue-600 transition-colors">Features</a>
              <a href="/pricing" className="hover:text-blue-600 transition-colors">Pricing</a>
            </nav>
            <div>
              <a href="/login" className="text-gray-600 font-medium hover:text-black mr-4">Log in</a>
              <a href="/register" className="bg-blue-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-blue-700 transition-colors">Get Started</a>
            </div>
          </header>
          <main className="flex-grow">
            {children}
          </main>
          <footer className="border-t p-8 text-center text-gray-500 bg-gray-50">
            &copy; {new Date().getFullYear()} SherPOS. All rights reserved.
          </footer>
        </QueryProvider>
      </body>
    </html>
  );
}
