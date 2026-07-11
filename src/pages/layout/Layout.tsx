import { useEffect } from "react"
import { Outlet, useNavigate } from "react-router";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { TooltipProvider } from "@/components/ui/tooltip"
import { useAuthStore } from "@/store/auth.store";
import { useExchangeRateTodayQuery } from "@/hooks/inventory.hook";
import { useSocket } from "@/services/socket.io";
import toast from "react-hot-toast";
import type { DailyReminder } from "@/interfaces/base.interface";
import { CustomSnackbarMessage } from "@/components/dialog/AlertDialogComponent";

export const Layout = () => {
    const navigate = useNavigate();
    useExchangeRateTodayQuery();
    const token = useAuthStore((state) => state.token);
    const clearSession = useAuthStore((state) => state.clearSession);
    const isTokenExpired = useAuthStore((state) => state.isTokenExpired);

    useEffect(() => {
        if (!token || isTokenExpired()) {
            clearSession();
            navigate('/login');
        }
    }, [token, isTokenExpired, clearSession, navigate]);

    useSocket('daily-reminder', (data: DailyReminder) => {
        toast(() => (
            <CustomSnackbarMessage contentMessage={data}/>
        ), {
            position: "top-right",
            duration: 3000,
            className: "shadow-xl !p-0",
            style: {
                maxWidth: "none",
            }
        });
    });

    return (
        <div className="w-screen h-full flex flex-col overflow-hidden">
            <TooltipProvider>
                <Header />
                <div className="flex-1 bg-gray-200 p-4 overflow-auto">
                    <Outlet />
                </div>
                <Footer />
            </TooltipProvider>
        </div>
    )
}
