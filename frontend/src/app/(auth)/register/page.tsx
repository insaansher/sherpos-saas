"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRegister } from "@/hooks/use-auth";

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
        <div className="w-full max-w-lg bg-white p-8 rounded-xl shadow-lg border border-gray-100 my-10">
            <h1 className="text-2xl font-bold mb-2 text-center text-gray-900">Create your account</h1>
            <p className="text-center text-gray-500 mb-8">Start your free trial today</p>

            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                    {(error as any)?.response?.data?.error || "Registration failed"}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                    <input
                        {...register("business_name")}
                        className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Joe's Coffee"
                    />
                    {errors.business_name && <p className="text-red-500 text-xs mt-1">{errors.business_name.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                        {...register("email")}
                        type="email"
                        className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="joe@example.com"
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                        {...register("password")}
                        type="password"
                        className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                </div>

                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                        <select {...register("currency")} className="w-full p-2.5 border rounded-lg bg-white">
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="INR">INR (₹)</option>
                            <option value="GBP">GBP (£)</option>
                        </select>
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                        <select {...register("timezone")} className="w-full p-2.5 border rounded-lg bg-white">
                            <option value="UTC">UTC</option>
                            <option value="Asia/Kolkata">IST (Asia/Kolkata)</option>
                            <option value="America/New_York">EST (New York)</option>
                            <option value="Europe/London">BST (London)</option>
                        </select>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition mt-2"
                >
                    {isPending ? "Creating Account..." : "Create Account"}
                </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
                Already have an account? <a href="/login" className="text-blue-600 hover:underline">Log in</a>
            </div>
        </div>
    );
}
