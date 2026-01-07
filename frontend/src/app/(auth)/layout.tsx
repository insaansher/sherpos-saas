import QueryProvider from "@/providers/query-provider";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <QueryProvider>
            <div className="flex min-h-screen w-full items-center justify-center bg-background p-4 relative overflow-hidden">
                {/* Decorative Background */}
                <div className="absolute inset-0 z-0 opacity-30 dark:opacity-20 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background"></div>
                    <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-primary/10 rounded-full blur-3xl"></div>
                    <div className="absolute top-1/4 left-10 w-24 h-24 bg-blue-400/10 rounded-full blur-2xl"></div>
                </div>

                <div className="z-10 w-full max-w-md animate-fade-in relative">
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 inline-block">SherPOS</h1>
                        <p className="text-muted-foreground text-sm mt-2">Next Gen Point of Sale</p>
                    </div>
                    {children}
                    <div className="mt-8 text-center text-xs text-muted-foreground">
                        &copy; 2026 SherPOS Inc. All rights reserved.
                    </div>
                </div>
            </div>
        </QueryProvider>
    );
}
