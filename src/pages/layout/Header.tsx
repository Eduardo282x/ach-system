import { Button } from "@/components/ui/button"
import { MdOutlineShoppingCart } from "react-icons/md";
import { useLocation, useNavigate } from "react-router";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator"
import { useState } from "react";
import { AlertDialogComponent } from "@/components/dialog/AlertDialogComponent";
import { useAuthStore } from "@/store/auth.store";
import { getHeaderDataWithActive } from "./header.data";
import type { TypeRole } from "@/interfaces/users.interface";

const validRoles: TypeRole[] = ['ADMIN', 'SUPERVISOR', 'CAJERO'];

export const Header = () => {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const useAuthStoreState = useAuthStore((state) => state);
    const userRole = useAuthStoreState.user?.role?.toUpperCase();
    const role = validRoles.includes(userRole as TypeRole) ? (userRole as TypeRole) : undefined;
    const items = getHeaderDataWithActive(pathname, role);

    const [open, setOpen] = useState(false);

    const openDialog = () => {
        setOpen(true);
    }

    const logout = () => {
        setOpen(false);
        useAuthStore.getState().clearSession();
        navigate('/login');
    }

    return (
        <div className="w-full py-4 px-6 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
                <div className="bg-blue-800 p-2 rounded-md">
                    <MdOutlineShoppingCart className="text-2xl text-white" />
                </div>
                <span className="text-xl font-bold">{import.meta.env.VITE_NAME}</span>
            </div>

            <div className="flex items-center gap-2">
                {items.map((item) => {
                    if (item.type === 'dropdown') {
                        const Icon = item.icon;

                        return (
                            <DropdownMenu key={item.title}>
                                <DropdownMenuTrigger asChild>
                                    <Button variant={item.active ? 'primary' : 'secondaryBorder'} size="sm">
                                        {Icon && <Icon />}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    {item.children.map((child) => {
                                        if (child.type === 'separator') {
                                            return <Separator key={`${item.title}-separator`} className="my-1" />;
                                        }

                                        return (
                                            <DropdownMenuItem
                                                key={`${item.title}-${child.title}`}
                                                onClick={() => {
                                                    if (child.action === 'logout') {
                                                        openDialog();
                                                        return;
                                                    }

                                                    if (child.navigateTo) {
                                                        navigate(child.navigateTo);
                                                    }
                                                }}
                                            >
                                                {child.title}
                                            </DropdownMenuItem>
                                        );
                                    })}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )
                    }

                    if (item.title === 'Ayuda' && item.icon) {
                        const Icon = item.icon;

                        return (
                            <Button key={item.title} variant="outline" size="sm">
                                <Icon />
                            </Button>
                        );
                    }

                    if (item.type === 'button' && item.icon) {
                        const Icon = item.icon;

                        return (
                            <Button
                                key={item.title}
                                variant={item.active ? 'primary' : 'secondaryBorder'}
                                onClick={() => item.navigateTo && navigate(item.navigateTo)}
                            >
                                <Icon />
                                {item.title}
                            </Button>
                        );
                    }

                    return null;
                })}
            </div>

            <AlertDialogComponent
                title="Cerrar Sesión"
                description="¿Estás seguro de que deseas cerrar sesión?"
                labelBtnConfirm="Confirmar y Salir"
                open={open}
                close={() => setOpen(false)}
                onConfirm={() => {
                    logout();
                }}
                onCancel={() => setOpen(false)}
            />
        </div>
    )
}
