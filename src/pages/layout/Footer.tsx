import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDateString, formatNumberWithDecimal } from "@/helpers/formatters";
import { useExchangeRateAutomaticQuery } from "@/hooks/inventory.hook";
import { useAuthStore } from "@/store/auth.store";
import { useInventoryStore } from "@/store/inventory.store";
import { IoMdSync } from "react-icons/io";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { useCashDrawersQuery, useOpenSessionMutation, useSessionsQuery } from "@/hooks/sessions.hook";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
// import type { ExchangeRate } from "@/interfaces/inventory.interface";

export const Footer = () => {
    const today = new Date();
    const { user, isAdmin, cashDrawerSession } = useAuthStore((state) => state);
    const { data } = useSessionsQuery({ status: 'OPEN' });

    const [open, setOpen] = useState<boolean>(false);
    const [cashDrawerSelected, setCashDrawerSelected] = useState<number | null>(null);
    const [balance, setBalance] = useState<number>(0);
    const cashDrawers = useCashDrawersQuery();
    const openSessionMutation = useOpenSessionMutation();

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

    const cashierSessionOptions = data ? data.sessions.map((cashDrawerSession) => ({
        label: `${cashDrawerSession.cashDrawer.name} (${cashDrawerSession.user.name})`,
        value: cashDrawerSession.sessionId.toString(),
    })) : [];

    useEffect(() => {
        if (data && data.sessions.length > 0 && user?.role == 'CAJERO') {
            const activeSession = data.sessions.find(session => session.user.id === user?.id);
            if (!activeSession) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setOpen(true);
            }
        }
    }, [data, user])

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

    const onChangeCashDrawerSession = (value: string) => {
        const selectedCashier = data?.sessions.find(session => session.sessionId.toString() === value);
        if (selectedCashier) {
            useAuthStore.getState().setCashier({ id: selectedCashier.user.id, name: selectedCashier.user.name, cashDrawer: selectedCashier.cashDrawer.name.toString() });
            useAuthStore.getState().setCashDrawerSession(selectedCashier.sessionId.toString());
        }
    }

    const validateToCloseDialog = () => {
        if (cashDrawerSelected === null || balance <= 0) {
            return;
        }
        setOpen(false);
    }

    const openSession = () => {
        openSessionMutation.mutate({
            cashDrawerId: Number(cashDrawerSelected),
            openingBalance: balance,
        })
        setOpen(false);
    }

    return (
        <div className='w-full py-2 px-6 bg-white flex items-center justify-between font-semibold text-sm'>
            <div>
                {user?.name || user?.username} {translateRole(user?.role || '')} | {formatDateString(today.toISOString())}
            </div>
            <div className={`${isAdmin ? 'flex' : 'hidden'} items-center gap-2`}>
                <Label>Cajero: </Label>
                <Select
                    value={cashDrawerSession}
                    onValueChange={onChangeCashDrawerSession}
                >
                    <SelectTrigger className="w-60">
                        <SelectValue placeholder="Seleccione un cajero" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            {cashierSessionOptions.map((option) => (
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

            <Dialog open={open} onOpenChange={validateToCloseDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            <p className='text-center text-blue-800 -mt-4 font-semibold text-xl'>Apertura de caja</p>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="w-full">
                        <div className="flex flex-col gap-2 my-4">
                            <p className='font-semibold'>Seleccionar caja</p>
                            <div className='flex items-center gap-2'>
                                <Select defaultValue={cashDrawerSelected?.toString()} onValueChange={(value) => setCashDrawerSelected(Number(value))}>
                                    <SelectTrigger className="w-full bg-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent align="start">
                                        <SelectGroup>
                                            {cashDrawers.data?.cashDrawers.map((cashDrawer) => (
                                                <SelectItem key={cashDrawer.id} value={cashDrawer.id.toString()}>{cashDrawer.name}</SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 my-4">
                            <p className='font-semibold'>Balance inicial (Bs)</p>
                            <Input
                                type="number"
                                step="0.01"
                                value={balance}
                                onChange={(event) => setBalance(Number(event.target.value))}
                                placeholder="Ingrese el balance inicial"
                            />
                            <span className="text-gray-500 text-sm">Esta es la cantidad de dinero con la que se inicia la caja.</span>
                        </div>

                        <Button variant='primary' className="mt-2 w-full" onClick={openSession} disabled={balance <= 0 || cashDrawerSelected === null}>
                            Aceptar
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
