"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRegister } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input } from "@/components/ui/primitives";
import { Label } from "@/components/ui/form-elements";
import Link from "next/link";
import { AlertCircle, Store } from "lucide-react";

const schema = z.object({
    business_name: z.string().min(2, "Business name is required"),
    email: z.string().email(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    timezone: z.string().min(1),
    currency: z.string().min(1),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
    const { mutate: registerUser, isPending, error } = useRegister();
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            timezone: "UTC",
            currency: "USD",
        }
    });

    const onSubmit = (data: FormData) => {
        registerUser(data);
    };

    return (
        <Card className="w-full max-w-md mx-auto shadow-2xl border-0 animate-fade-in my-10 relative z-10">
            <CardHeader className="space-y-1 items-center text-center">
                <div className="bg-primary/10 p-3 rounded-full text-primary mb-2">
                    <Store size={32} />
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight">Create your account</CardTitle>
                <CardDescription>Start your 14-day free trial. No credit card required.</CardDescription>
            </CardHeader>
            <CardContent>
                {/* Error Banner */}
                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-600 rounded-lg text-sm flex items-center gap-2">
                        <AlertCircle size={16} />
                        {(error as any)?.response?.data?.error || "Registration failed"}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Business Name</Label>
                        <Input
                            {...register("business_name")}
                            placeholder="e.g. Joe's Coffee House"
                            className={errors.business_name ? "border-red-500" : ""}
                        />
                        {errors.business_name && <p className="text-red-500 text-xs">{errors.business_name.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                            {...register("email")}
                            type="email"
                            placeholder="admin@company.com"
                            className={errors.email ? "border-red-500" : ""}
                        />
                        {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Password</Label>
                        <Input
                            {...register("password")}
                            type="password"
                            className={errors.password ? "border-red-500" : ""}
                        />
                        {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Currency</Label>
                            {/* Native select to save time, could use Select primitive in future */}
                            <select
                                {...register("currency")}
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                                <option value="INR">INR (₹)</option>
                                <option value="GBP">GBP (£)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label>Timezone</Label>
                            <select
                                {...register("timezone")}
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="UTC">UTC</option>
                                <option value="Asia/Kolkata">IST (Asia/Kolkata)</option>
                                <option value="America/New_York">EST (New York)</option>
                                <option value="Europe/London">London</option>
                            </select>
                        </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending ? "Creating Account..." : "Create Account"}
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link href="/login" className="font-semibold text-primary hover:underline">
                        Log in
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
