import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDateString, formatNumberWithDecimal } from "@/helpers/formatters";
import { useExchangeRateAutomaticQuery } from "@/hooks/inventory.hook";
import { useAuthStore } from "@/store/auth.store";
import { useInventoryStore } from "@/store/inventory.store";
import { IoMdSync } from "react-icons/io";

export const Footer = () => {
    const today = new Date();
    const user = useAuthStore((state) => state.user);
    const exchangeRates = useInventoryStore((state) => state.exchangeRates);
    const exchangeRateAutomaticQuery = useExchangeRateAutomaticQuery();

    const bcvRate = exchangeRates ? exchangeRates.find((rate) => rate.currency === 'USD') : undefined;
    const euroRate = exchangeRates ? exchangeRates.find((rate) => rate.currency === 'EUR') : undefined;

    const translateRole = (role: string) => {
        const rol = role.toLowerCase();
        switch (rol) {
            case 'admin':
                return 'Administrador';
            case 'cajero':
                return 'Cajero';
            case 'supervisor':
                return 'Supervisor';
            default:
                return role;
        }
    };

    const updateExchangeRates = async () => {
        await exchangeRateAutomaticQuery.refetch();
    }

    return (
        <div className='w-full py-2 px-6 bg-white flex items-center justify-between font-semibold text-sm'>
            <div>
                {user?.name || user?.username} {translateRole(user?.role || '')} | {formatDateString(today.toISOString())}
            </div>
            <div></div>
            <div className="flex items-center gap-3">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant='ghost' onClick={updateExchangeRates} disabled={exchangeRateAutomaticQuery.isFetching}><IoMdSync /></Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        Actualizar tasas
                    </TooltipContent>
                </Tooltip>
                <span>BCV: {bcvRate ? `${formatNumberWithDecimal(bcvRate.rate)} Bs` : '--'} </span>
                <span>|</span>
                <span>Euro: {euroRate ? `${formatNumberWithDecimal(euroRate.rate)} Bs` : '--'}</span>
            </div>
        </div>
    )
}
