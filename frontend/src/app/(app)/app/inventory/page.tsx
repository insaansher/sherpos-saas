"use client";

import { useOps } from "@/hooks/use-ops";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/primitives";
import { History } from "lucide-react";

export default function LedgerPage() {
    const { useLedger } = useOps();
    const { data: ledger, isLoading } = useLedger();

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Inventory Ledger</h1>
                <p className="text-muted-foreground">Track stock movements and history.</p>
            </div>

            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="w-[180px]">Date & Time</TableHead>
                            <TableHead>Product</TableHead>
                            <TableHead>Movement Type</TableHead>
                            <TableHead className="text-right">Change</TableHead>
                            <TableHead className="text-right">Stock After</TableHead>
                            <TableHead className="w-[300px]">Note</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={6} className="h-24 text-center">Loading ledger...</TableCell></TableRow>
                        ) : !ledger?.length ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-64 text-center text-muted-foreground">
                                    <div className="flex flex-col items-center justify-center gap-2 opacity-50">
                                        <History size={48} />
                                        <p>No inventory movements recorded yet.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            ledger.map((l: any) => (
                                <TableRow key={l.id}>
                                    <TableCell className="text-muted-foreground font-mono text-xs">
                                        {format(new Date(l.created_at), "MMM d, yyyy HH:mm")}
                                    </TableCell>
                                    <TableCell className="font-medium">{l.product_name}</TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            l.ref_type === 'sale' ? 'success' :
                                                l.ref_type === 'purchase' ? 'default' :
                                                    'secondary'
                                        }>
                                            {l.ref_type.replace('_', ' ')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className={`text-right font-bold ${l.qty_change > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {l.qty_change > 0 ? '+' : ''}{l.qty_change}
                                    </TableCell>
                                    <TableCell className="text-right text-muted-foreground">{l.qty_after}</TableCell>
                                    <TableCell className="text-muted-foreground italic truncate max-w-[200px]">{l.note || "-"}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
