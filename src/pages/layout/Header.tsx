import { Button } from "@/components/ui/button"
import { MdOutlineInventory2, MdOutlinePointOfSale, MdQuestionMark, MdOutlineShoppingCart } from "react-icons/md";
import { HiOutlineCurrencyDollar } from "react-icons/hi";
import { IoSettingsOutline } from "react-icons/io5";
import { PiUsersThree } from "react-icons/pi";
import { GoHistory } from "react-icons/go";
import { useNavigate } from "react-router";
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

export const Header = () => {
    const navigate = useNavigate();
    const useAuthStoreState = useAuthStore((state) => state);

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
                <MdOutlineShoppingCart className="text-2xl" />
                <span className="text-xl font-bold">Inversiones Gustavo, C.A</span>
            </div>

            <div className="flex items-center gap-2">
                {useAuthStoreState.user?.role.toLowerCase() === 'admin' && (
                    <>
                        <Button variant="primary" onClick={() => navigate("/clientes")}><PiUsersThree /> Clientes</Button>
                        <Button variant="primary" onClick={() => navigate("/historial-inventario")}><GoHistory /> Inventario Historial</Button>
                    </>
                )}
                <Button variant="primary" onClick={() => navigate("/inventario")}><MdOutlineInventory2 /> Inventario</Button>
                <Button variant="primary" onClick={() => navigate("/despacho")}><MdOutlinePointOfSale /> Despacho</Button>
                {/* <Button variant="outline">Crédito</Button> */}
                <Button variant="primary" onClick={() => navigate("/cierre-caja")}><HiOutlineCurrencyDollar /> Cierre de Caja</Button>


                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="gray" size="sm"><IoSettingsOutline /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => navigate('/tasas')}>Tasa del dia</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/cajeros')}>Gestionar Cajeros</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/historial-cajeros')}>Historial de Cajeros</DropdownMenuItem>
                        <Separator className="my-1" />
                        <DropdownMenuItem onClick={openDialog}>Salir</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Button variant="outline" size="sm"><MdQuestionMark /></Button>
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
