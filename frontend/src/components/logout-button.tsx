"use client";

import { useLogout } from "@/hooks/use-auth";
import clsx from "clsx";

export default function LogoutButton({ className }: { className?: string }) {
    const { mutate: logout, isPending } = useLogout();

    return (
        <button
            onClick={() => logout()}
            disabled={isPending}
            className={clsx("w-full text-left text-xs text-red-400 hover:text-red-300 transition flex items-center gap-2", className)}
        >
            {isPending ? "Exiting..." : "Sign Out"}
        </button>
    );
}
