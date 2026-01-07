"use client";

import { useOps } from "@/hooks/use-ops";
import { useState } from "react";
import { Plus, Search, Filter, MoreHorizontal, FileDown } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button, Input, Badge } from "@/components/ui/primitives";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Label } from "@/components/ui/form-elements";
import { cn } from "@/lib/utils";

export default function ProductsPage() {
    const { useProducts, createProduct } = useOps();
    const { data: products, isLoading } = useProducts();
    const [isCreateOpen, setCreateOpen] = useState(false);
    const [formData, setFormData] = useState({ name: "", sku: "", price: 0, cost_price: 0 });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createProduct.mutate(formData as any, {
            onSuccess: () => {
                setCreateOpen(false);
                setFormData({ name: "", sku: "", price: 0, cost_price: 0 });
            }
        });
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Products</h1>
                    <p className="text-muted-foreground">Manage your product catalog and pricing.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="gap-2">
                        <FileDown size={16} /> Export
                    </Button>
                    <Button onClick={() => setCreateOpen(true)} className="gap-2 shadow-lg shadow-primary/20">
                        <Plus size={16} /> New Product
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 bg-card p-2 rounded-lg border shadow-sm max-w-2xl">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search products..." className="pl-9 border-0 bg-transparent focus-visible:ring-0" />
                </div>
                <div className="h-6 w-px bg-border" />
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                    <Filter size={16} /> Filter
                </Button>
            </div>

            <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50 hover:bg-muted/50">
                            <TableHead className="w-[300px]">Product Name</TableHead>
                            <TableHead>SKU</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            <TableHead className="text-right">Cost</TableHead>
                            <TableHead className="text-center">Stock</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">Loading products...</TableCell>
                            </TableRow>
                        ) : !products?.length ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-64 text-center text-muted-foreground">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <p>No products found</p>
                                        <Button variant="link" onClick={() => setCreateOpen(true)}>Create one now</Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            products.map((p) => (
                                <TableRow key={p.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex flex-col">
                                            <span>{p.name}</span>
                                            <span className="text-xs text-muted-foreground sm:hidden">{p.sku}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground font-mono text-xs">{p.sku}</TableCell>
                                    <TableCell className="text-right font-medium">${p.price.toFixed(2)}</TableCell>
                                    <TableCell className="text-right text-muted-foreground">${p.cost_price?.toFixed(2) || "0.00"}</TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant={p.stock_quantity > 10 ? "secondary" : p.stock_quantity > 0 ? "warning" : "destructive"}>
                                            {p.stock_quantity}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant={p.is_active ? "success" : "secondary"}>
                                            {p.is_active ? "Active" : "Archived"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                            <MoreHorizontal size={16} />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isCreateOpen} onOpenChange={setCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Product</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Product Name</Label>
                            <Input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Wireless Mouse" />
                        </div>
                        <div className="space-y-2">
                            <Label>SKU / Barcode</Label>
                            <Input required value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} placeholder="e.g. WM-001" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Selling Price ($)</Label>
                                <Input type="number" step="0.01" required value={formData.price} onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Cost Price ($)</Label>
                                <Input type="number" step="0.01" required value={formData.cost_price} onChange={e => setFormData({ ...formData, cost_price: parseFloat(e.target.value) })} />
                            </div>
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
                            <Button type="submit">Create Product</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
