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
import { useEffect, useState } from "react";
// import type { ExchangeRate } from "@/interfaces/inventory.interface";

export const Footer = () => {
    const today = new Date();
    const { user, cashier, isAdmin } = useAuthStore((state) => state);
    const exchangeRates = useInventoryStore((state) => state.exchangeRates);
    const exchangeRateAutomaticQuery = useExchangeRateAutomaticQuery();
    // const exchangeRateDefaultMutation = useExchangeRateDefaultMutation();
    const [bcvRate, setBcvRate] = useState(exchangeRates ? exchangeRates.find((rate) => rate.currency === 'USD') : undefined);
    const [euroRate, setEuroRate] = useState(exchangeRates ? exchangeRates.find((rate) => rate.currency === 'EUR') : undefined);

    useEffect(() => {
        const bcvRate = exchangeRates ? exchangeRates.find((rate) => rate.currency === 'USD') : undefined;
        const euroRate = exchangeRates ? exchangeRates.find((rate) => rate.currency === 'EUR') : undefined;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setBcvRate(bcvRate);
        setEuroRate(euroRate);
    }, [exchangeRates])

    const { data } = useUsersQuery('');
    const users = data?.users ?? [];
    // const users = data?.users.filter(item => item.role == 'CAJERO') ?? [];

    const cashiersOptions = users.map((user) => ({
        label: user.name,
        value: user.id.toString(),
    }));

    const cashierState = cashier as unknown;
    const cashierValue = typeof cashierState === 'object' && cashierState !== null && 'id' in cashierState
        ? String((cashierState as { id?: number | string }).id ?? '')
        : typeof cashierState === 'string'
            ? cashierState
            : '';

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

    // const handleDefault = (rate: ExchangeRate | null) => {
    //     if (!rate?.id) return;
    //     if (rate?.isDefault) return;
    //     exchangeRateDefaultMutation.mutate(rate.id);
    // }

    return (
        <div className='w-full py-2 px-6 bg-white flex items-center justify-between font-semibold text-sm'>
            <div>
                {user?.name || user?.username} {translateRole(user?.role || '')} | {formatDateString(today.toISOString())}
            </div>
            <div className={`${isAdmin ? 'flex' : 'hidden'} items-center gap-2`}>
                <Label>Cajero: </Label>
                <Select
                    value={cashierValue}
                    onValueChange={(value) => {
                        const selectedCashier = users.find(user => user.id.toString() === value);
                        if (selectedCashier) {
                            useAuthStore.getState().setCashier({ id: selectedCashier.id, name: selectedCashier.name, cashDrawer: selectedCashier.id.toString() });
                        }
                    }}
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
            <div className="flex items-center gap-1">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant='ghost' onClick={updateExchangeRates} disabled={exchangeRateAutomaticQuery.isFetching}><IoMdSync /></Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        Actualizar tasas
                    </TooltipContent>
                </Tooltip>
                {/* <Tooltip>
                    <TooltipTrigger asChild>
                        <span onClick={() => handleDefault(bcvRate ?? null)} className={`cursor-pointer rounded-md px-4 py-1 rounded-full ${bcvRate?.isDefault ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>BCV: {bcvRate ? `${formatNumberWithDecimal(bcvRate.rate)} Bs` : '--'} </span>
                    </TooltipTrigger>
                    <TooltipContent>
                        Colocar como predeterminado
                    </TooltipContent>
                </Tooltip> */}
                <span className={`cursor-pointer rounded-md px-4 py-1 rounded-full bg-gray-200 text-gray-600`}>BCV: {bcvRate ? `${formatNumberWithDecimal(bcvRate.rate)} Bs` : '--'} </span>
                <span>|</span>
                <span className={`cursor-pointer rounded-md px-4 py-1 rounded-full bg-gray-200 text-gray-600`}>Euro: {euroRate ? `${formatNumberWithDecimal(euroRate.rate)} Bs` : '--'}</span>
                {/* <Tooltip>
                    <TooltipTrigger asChild>
                        <span onClick={() => handleDefault(euroRate ?? null)} className={`cursor-pointer rounded-md px-4 py-1 rounded-full ${euroRate?.isDefault ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>Euro: {euroRate ? `${formatNumberWithDecimal(euroRate.rate)} Bs` : '--'}</span>
                    </TooltipTrigger>
                    <TooltipContent>
                        Colocar como predeterminado
                    </TooltipContent>
                </Tooltip> */}
            </div>
        </div>
    )
}
