"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import api from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

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
        <div className="max-w-2xl mx-auto py-10">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <h1 className="text-2xl font-bold mb-4 text-gray-900">Welcome to SherPOS, {tenant.name}!</h1>
                <p className="text-gray-500 mb-8">Let's configure your store settings to get you started.</p>

                <form onSubmit={handleSubmit((d) => completeSetup(d))} className="space-y-6">
                    <div className="bg-blue-50 p-4 rounded-lg flex flex-col gap-2">
                        <div className="text-sm text-blue-800">Your store is set to <strong>{tenant.currency}</strong> and <strong>{tenant.timezone}</strong>.</div>
                        <div className="text-xs text-blue-600">Contact support to change these.</div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Prefix</label>
                        <input
                            {...register("invoice_prefix")}
                            className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none uppercase font-mono"
                            placeholder="INV-"
                        />
                        <p className="text-xs text-gray-500 mt-1">Used for generating invoice numbers (e.g. INV-001)</p>
                        {errors.invoice_prefix && <p className="text-red-500 text-xs mt-1">{errors.invoice_prefix.message}</p>}
                    </div>

                    <div className="flex items-start gap-3">
                        <input
                            {...register("confirmed")}
                            type="checkbox"
                            className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <label className="text-sm text-gray-600">
                            I confirm that the settings above are correct. I understand that currency and timezone cannot be changed later.
                        </label>
                    </div>
                    {errors.confirmed && <p className="text-red-500 text-xs mt-1">{errors.confirmed.message}</p>}

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
                    >
                        {isPending ? "Setting up store..." : "Complete Setup & Go to Dashboard"}
                    </button>
                </form>
            </div>
        </div>
    );
}
