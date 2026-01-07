"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLogin } from "@/hooks/use-auth";
import Link from "next/link";
import { Button, Input, Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/primitives";
import { Label } from "@/components/ui/form-elements";
import { CheckCircle2, AlertCircle } from "lucide-react";

const schema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
    const { mutate: login, isPending, error } = useLogin();
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const onSubmit = (data: FormData) => {
        login(data);
    };

    return (
        <Card className="w-full max-w-md shadow-2xl border-0 ring-1 ring-border/50 bg-card/95 backdrop-blur-sm">
            <CardHeader className="space-y-1 text-center pb-8">
                <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
                <CardDescription>
                    Enter your credentials to access your workspace
                </CardDescription>
            </CardHeader>
            <CardContent>
                {error && (
                    <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-lg text-sm flex items-center gap-2 animate-in slide-in-from-top-2">
                        <AlertCircle className="h-4 w-4" />
                        {(error as any)?.response?.data?.error || "Invalid credentials. Please try again."}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            {...register("email")}
                            type="email"
                            placeholder="name@example.com"
                            className="h-11"
                            disabled={isPending}
                        />
                        {errors.email && <p className="text-destructive text-xs font-medium">{errors.email.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Password</Label>
                            <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                                Forgot password?
                            </Link>
                        </div>
                        <Input
                            id="password"
                            {...register("password")}
                            type="password"
                            placeholder="••••••••"
                            className="h-11"
                            disabled={isPending}
                        />
                        {errors.password && <p className="text-destructive text-xs font-medium">{errors.password.message}</p>}
                    </div>

                    <Button type="submit" className="w-full h-11 font-medium" isLoading={isPending}>
                        Sign In
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <Link href="/register" className="text-primary font-medium hover:underline">
                        Create an account
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
