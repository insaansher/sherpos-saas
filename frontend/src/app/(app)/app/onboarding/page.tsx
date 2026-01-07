"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import api from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Input } from "@/components/ui/primitives";
import { Label, Checkbox } from "@/components/ui/form-elements";
import { Info, Rocket } from "lucide-react";

const schema = z.object({
    invoice_prefix: z.string().min(2).max(10).regex(/^[A-Z0-9\-]+$/, "Uppercase alphanumeric and dashes only"),
    confirmed: z.boolean().refine(val => val === true, "You must confirm to proceed"),
});

type FormData = z.infer<typeof schema>;

export default function OnboardingPage() {
    const { tenant } = useAuth();
    const queryClient = useQueryClient();
    const router = useRouter();

    const { mutate: completeSetup, isPending } = useMutation({
        mutationFn: async (data: FormData) => {
            await api.post("/onboarding/complete", {
                invoice_prefix_default: data.invoice_prefix,
                confirmed: data.confirmed
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["auth"] });
            router.push("/app/dashboard");
        }
    });

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            invoice_prefix: "INV-",
        }
    });

    if (!tenant) return null;

    return (
        <div className="flex items-center justify-center min-h-[80vh] w-full">
            <Card className="w-full max-w-lg shadow-2xl border-0 animate-fade-in">
                <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="bg-primary/10 p-2 rounded-full text-primary">
                            <Rocket size={24} />
                        </div>
                        <h2 className="text-xl font-bold">Setup Guide</h2>
                    </div>
                    <CardTitle>Welcome to SherPOS, {tenant.name}!</CardTitle>
                    <CardDescription>Let's configure your store settings to get you started.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit((d) => completeSetup(d))} className="space-y-6">
                        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg flex items-start gap-3">
                            <Info className="text-blue-600 shrink-0 mt-0.5" size={18} />
                            <div className="space-y-1">
                                <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                    Configured as {tenant.currency} / {tenant.timezone}
                                </div>
                                <div className="text-xs text-blue-700 dark:text-blue-300">
                                    These settings are locked to ensure accurate accounting. Contact support for changes.
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label>Invoice Prefix</Label>
                            <Input
                                {...register("invoice_prefix")}
                                className="uppercase font-mono tracking-wider"
                                placeholder="INV-"
                            />
                            <p className="text-xs text-muted-foreground">Used for generating invoice numbers (e.g. INV-001)</p>
                            {errors.invoice_prefix && <p className="text-destructive text-xs">{errors.invoice_prefix.message}</p>}
                        </div>

                        <div className="flex items-start gap-3 p-3 border rounded-lg bg-muted/50">
                            <input
                                {...register("confirmed")}
                                type="checkbox"
                                className="mt-1 w-4 h-4 text-primary rounded border-input focus:ring-ring"
                                id="confirm-check"
                            />
                            <label htmlFor="confirm-check" className="text-sm text-muted-foreground cursor-pointer select-none">
                                I confirm that the settings above are correct. I understand that currency and timezone cannot be changed later.
                            </label>
                        </div>
                        {errors.confirmed && <p className="text-destructive text-xs text-center">{errors.confirmed.message}</p>}

                        <Button type="submit" className="w-full h-12 text-lg shadow-lg shadow-primary/20" disabled={isPending}>
                            {isPending ? "Setting up..." : "Complete Setup"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
