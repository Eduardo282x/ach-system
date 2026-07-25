import { useCallback, useEffect, useState } from "react"
import { Outlet, useNavigate } from "react-router";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { TooltipProvider } from "@/components/ui/tooltip"
import { useAuthStore } from "@/store/auth.store";
import { INVENTORY_QUERY_KEY, useExchangeRateTodayQuery } from "@/hooks/inventory.hook";
import { SESSIONS_QUERY_KEY } from "@/hooks/sessions.hook";
import { useSocket } from "@/services/socket.io";
import toast from "react-hot-toast";
import type { DailyReminder } from "@/interfaces/base.interface";
import { CustomSnackbarMessage } from "@/components/dialog/AlertDialogComponent";
import { useQueryClient } from "@tanstack/react-query";
import { ShiftWarningDialog } from "@/components/dialog/ShiftWarningDialog";
import type { ShiftWarning } from "@/interfaces/shift-warning.interface";

export const Layout = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    useExchangeRateTodayQuery();
    const token = useAuthStore((state) => state.token);
    const clearSession = useAuthStore((state) => state.clearSession);
    const isTokenExpired = useAuthStore((state) => state.isTokenExpired);

    const [shiftWarning, setShiftWarning] = useState<ShiftWarning | null>(null);

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

    useSocket('invoiceCreated', () => {
        queryClient.invalidateQueries({ queryKey: [INVENTORY_QUERY_KEY] });
        queryClient.invalidateQueries({ queryKey: [SESSIONS_QUERY_KEY] });
        queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    });

    useSocket('productUpdated', () => {
        queryClient.invalidateQueries({ queryKey: [INVENTORY_QUERY_KEY] });
    });

    useSocket('shift-warning', (data: ShiftWarning) => {
        setShiftWarning(data);
    });

    const handleShiftWarningConfirm = useCallback(() => {
        setShiftWarning(null);
        navigate('/dashboard');
    }, [navigate]);

    const handleShiftWarningDismiss = useCallback(() => {
        setShiftWarning(null);
    }, []);

    return (
        <div className="w-screen h-full flex flex-col overflow-hidden">
            <TooltipProvider>
                <Header />
                <div className="flex-1 bg-gray-200 p-4 overflow-auto">
                    <Outlet />
                </div>
                <Footer />
            </TooltipProvider>

            {shiftWarning && (
                <ShiftWarningDialog
                    open={!!shiftWarning}
                    type={shiftWarning.type}
                    shiftName={shiftWarning.shiftName}
                    endTime={shiftWarning.endTime}
                    onConfirm={handleShiftWarningConfirm}
                    onDismiss={handleShiftWarningDismiss}
                />
            )}
        </div>
    )
}
