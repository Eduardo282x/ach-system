import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDateString, formatNumberWithDecimal } from "@/helpers/formatters";
import { useExchangeRateAutomaticQuery } from "@/hooks/inventory.hook";
import { useAuthStore } from "@/store/auth.store";
import { useInventoryStore } from "@/store/inventory.store";
import { IoMdSync } from "react-icons/io";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useUsersQuery } from "@/hooks/users.hook";

export const Footer = () => {
    const today = new Date();
    const { user, cashier, isAdmin } = useAuthStore((state) => state);
    const exchangeRates = useInventoryStore((state) => state.exchangeRates);
    const exchangeRateAutomaticQuery = useExchangeRateAutomaticQuery();

    const bcvRate = exchangeRates ? exchangeRates.find((rate) => rate.currency === 'USD') : undefined;
    const euroRate = exchangeRates ? exchangeRates.find((rate) => rate.currency === 'EUR') : undefined;

    const { data } = useUsersQuery('');
    const users = data?.users ?? [];
    // const users = data?.users.filter(item => item.role == 'CAJERO') ?? [];

    const cashiersOptions = users.map((user) => ({
        label: user.name,
        value: user.id.toString(),
    }));

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
            <div className={`${isAdmin ? 'flex' : 'hidden'} items-center gap-2`}>
                <Label>Cajero: </Label>
                <Select
                    value={cashier || ''}
                    onValueChange={(value) => useAuthStore.getState().setCashier(value)}
                >
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="Seleccione un cajero" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            {cashiersOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>
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
