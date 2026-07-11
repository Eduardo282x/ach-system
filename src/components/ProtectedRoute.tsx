import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "@/store/auth.store";
import type { TypeRole } from "@/interfaces/users.interface";

const defaultRouteByRole: Record<TypeRole, string> = {
    ADMIN: '/inventario',
    CAJERO: '/despacho',
};

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles: TypeRole[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
    const navigate = useNavigate();
    const token = useAuthStore((state) => state.token);
    const user = useAuthStore((state) => state.user);
    const clearSession = useAuthStore((state) => state.clearSession);
    const isTokenExpired = useAuthStore((state) => state.isTokenExpired);

    useEffect(() => {
        if (!token || isTokenExpired()) {
            clearSession();
            navigate('/login', { replace: true });
            return;
        }

        const role = user?.role?.toUpperCase() as TypeRole | undefined;

        if (!role || !allowedRoles.includes(role)) {
            const fallback = role ? defaultRouteByRole[role] : '/login';
            navigate(fallback, { replace: true });
        }
    }, [token, user, allowedRoles, clearSession, isTokenExpired, navigate]);

    const role = user?.role?.toUpperCase() as TypeRole | undefined;

    if (!token || isTokenExpired() || !role || !allowedRoles.includes(role)) {
        return null;
    }

    return <>{children}</>;
};
