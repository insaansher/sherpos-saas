import { cn } from "@/lib/utils";

interface InvoiceProps {
    data: any;
    type: "thermal" | "a4";
}

export const InvoiceRenderer = ({ data, type }: InvoiceProps) => {
    // Shared Date/Formatter
    const date = new Date(data.created_at).toLocaleDateString();

    if (type === "thermal") {
        return (
            <div className="w-[80mm] bg-white p-2 font-mono text-xs text-black">
                <div className="text-center font-bold text-lg mb-2">SherPOS Retail</div>
                <div className="text-center mb-4">
                    123 Business Rd<br />
                    Metropolis, NY 10012<br />
                    Tel: +1 234 567 890
                </div>
                <div className="border-b border-black border-dashed mb-2" />
                <div className="flex justify-between mb-2">
                    <span>Inv: {data.invoice_number}</span>
                    <span>{date}</span>
                </div>
                <div className="space-y-1 mb-2">
                    {data.items.map((item: any, i: number) => (
                        <div key={i} className="flex justify-between">
                            <span>{item.name} x{item.quantity}</span>
                            <span>{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                </div>
                <div className="border-t border-black border-dashed my-2" />
                <div className="flex justify-between font-bold text-sm">
                    <span>TOTAL</span>
                    <span>${data.computed_totals.grand_total.toFixed(2)}</span>
                </div>
                <div className="text-center mt-4 text-[10px]">
                    Thank you for shopping with us!<br />
                    Returns accepted within 30 days.
                </div>
            </div>
        );
    }

    // A4 Design
    return (
        <div className="w-[210mm] min-h-[297mm] bg-white p-10 text-slate-800 font-sans shadow-lg mx-auto my-10">
            <div className="flex justify-between items-start mb-10">
                <div>
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">INVOICE</h1>
                    <p className="text-slate-500">#{data.invoice_number}</p>
                </div>
                <div className="text-right">
                    <div className="font-bold text-xl mb-1">SherPOS Inc.</div>
                    <div className="text-sm text-slate-500">
                        123 Business Road<br />
                        Suite 100<br />
                        New York, NY 10012
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-10">
                <div>
                    <h3 className="font-bold text-sm uppercase text-slate-400 mb-2">Bill To</h3>
                    <div className="font-medium">Guest Customer</div>
                    <div className="text-sm text-slate-500">Walk-in Client</div>
                </div>
                <div className="text-right">
                    <h3 className="font-bold text-sm uppercase text-slate-400 mb-2">Details</h3>
                    <div className="flex justify-end gap-4 text-sm">
                        <span className="text-slate-500">Date:</span>
                        <span className="font-medium">{date}</span>
                    </div>
                </div>
            </div>

            <table className="w-full mb-8">
                <thead className="border-b-2 border-slate-100">
                    <tr className="text-left text-sm font-semibold text-slate-600">
                        <th className="py-3">Description</th>
                        <th className="py-3 text-right">Qty</th>
                        <th className="py-3 text-right">Unit Price</th>
                        <th className="py-3 text-right">Total</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {data.items.map((item: any, i: number) => (
                        <tr key={i}>
                            <td className="py-4 font-medium">{item.name}</td>
                            <td className="py-4 text-right">{item.quantity}</td>
                            <td className="py-4 text-right">${item.price.toFixed(2)}</td>
                            <td className="py-4 text-right font-bold">${(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="flex justify-end">
                <div className="w-1/3 space-y-3">
                    <div className="flex justify-between text-sm text-slate-500">
                        <span>Subtotal</span>
                        <span>${data.computed_totals.grand_total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-500">
                        <span>Tax (0%)</span>
                        <span>$0.00</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold border-t border-slate-200 pt-3">
                        <span>Total</span>
                        <span>${data.computed_totals.grand_total.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <div className="mt-20 pt-8 border-t text-center text-sm text-slate-400">
                Generated by SherPOS - The Modern Cloud POS
            </div>
        </div>
    );
};
