"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { WifiOff, Wifi, RefreshCcw } from "lucide-react";

type NotificationType = "offline" | "online";

interface NotificationContextType {
    showNotification: (type: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notification, setNotification] = useState<NotificationType | null>(null);

    const showNotification = useCallback((type: NotificationType) => {
        setNotification(type);
    }, []);

    const handleReload = () => {
        window.location.reload();
    };

    const closeNotification = () => {
        setNotification(null);
    };

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}

            {/* Modal Overlay */}
            {notification && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-8 transform animate-in zoom-in-95 duration-200">
                        {/* Icon */}
                        <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${notification === "offline"
                            ? "bg-orange-100 text-orange-600"
                            : "bg-blue-100 text-blue-600"
                            }`}>
                            {notification === "offline" ? (
                                <WifiOff size={40} strokeWidth={2} />
                            ) : (
                                <Wifi size={40} strokeWidth={2} />
                            )}
                        </div>

                        {/* Title */}
                        <h2 className="text-2xl font-bold text-center mb-3 text-slate-900 dark:text-white">
                            {notification === "offline" ? "You're Offline" : "Back Online!"}
                        </h2>

                        {/* Message */}
                        <p className="text-center text-slate-600 dark:text-slate-400 mb-8">
                            {notification === "offline"
                                ? "Don't worry! Sales will be queued locally and synced when you reconnect."
                                : "Your sales are now being synced to the server."}
                        </p>

                        {/* Buttons */}
                        <div className="flex gap-3">
                            {notification === "online" && (
                                <button
                                    onClick={closeNotification}
                                    className="flex-1 px-6 py-3 rounded-xl font-semibold border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition text-slate-700 dark:text-slate-300"
                                >
                                    Continue
                                </button>
                            )}
                            <button
                                onClick={handleReload}
                                className={`${notification === "online" ? "flex-1" : "w-full"} px-6 py-3 rounded-xl font-semibold text-white transition flex items-center justify-center gap-2 ${notification === "offline"
                                    ? "bg-orange-600 hover:bg-orange-700"
                                    : "bg-blue-600 hover:bg-blue-700"
                                    }`}
                            >
                                <RefreshCcw size={18} />
                                Reload Page
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </NotificationContext.Provider>
    );
}

export function useNotification() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotification must be used within NotificationProvider");
    }
    return context;
}
