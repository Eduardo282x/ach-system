import { Button } from "@/components/ui/button"
import { MdOutlineInventory2, MdOutlinePointOfSale, MdQuestionMark, MdOutlineShoppingCart } from "react-icons/md";
import { HiOutlineCurrencyDollar } from "react-icons/hi";
import { IoSettingsOutline } from "react-icons/io5";
import { useNavigate } from "react-router";

export const Header = () => {
    const navigate = useNavigate();


    return (
        <div className="w-full py-4 px-6 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
                <MdOutlineShoppingCart  className="text-2xl"/>
                <span className="text-xl font-bold">Inversiones Gustavo, C.A</span>
            </div>

            <div className="flex items-center gap-2">
                <Button variant="primary" onClick={() => navigate("/inventario")}><MdOutlineInventory2 /> Inventario</Button>
                <Button variant="primary" onClick={() => navigate("/despacho")}><MdOutlinePointOfSale /> Despacho</Button>
                {/* <Button variant="outline">Crédito</Button> */}
                <Button variant="primary" onClick={() => navigate("/cierre-caja")}><HiOutlineCurrencyDollar /> Cierre de Caja</Button>
                <Button variant="primary" size="sm"><IoSettingsOutline /></Button>
                <Button variant="outline" size="sm"><MdQuestionMark /></Button>
            </div>
        </div>
    )
}
