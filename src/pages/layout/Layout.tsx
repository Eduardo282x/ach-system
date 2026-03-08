import { useEffect } from "react"
import { Outlet, useNavigate } from "react-router";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { TooltipProvider } from "@/components/ui/tooltip"
import { useAuthStore } from "@/store/auth.store";
import { useExchangeRateTodayQuery } from "@/hooks/inventory.hook";

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
