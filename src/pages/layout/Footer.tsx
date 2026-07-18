import { Button } from "@/components/ui/button";
import { formatDateString, formatNumberWithDecimal, formatOnlyTime } from "@/helpers/formatters";
import { useAuthStore } from "@/store/auth.store";
import { useInventoryStore } from "@/store/inventory.store";
import { IoMdSync } from "react-icons/io";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { useCashDrawersQuery, useOpenSessionMutation, useSessionsQuery } from "@/hooks/sessions.hook";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useSocket } from "@/services/socket.io";
import type { ExchangeRate } from "@/interfaces/inventory.interface";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
// import type { ExchangeRate } from "@/interfaces/inventory.interface";

export const Footer = () => {
    const today = new Date();
    const navigate = useNavigate();
    const { user, isAdmin, cashDrawerSession } = useAuthStore((state) => state);
    const { data, isLoading } = useSessionsQuery({ status: 'OPEN' });

    const [open, setOpen] = useState<boolean>(false);
    const [cashDrawerSelected, setCashDrawerSelected] = useState<number | null>(null);
    const [balance, setBalance] = useState<number>(0);
    const [balanceUsd, setBalanceUsd] = useState<number>(0);
    const cashDrawers = useCashDrawersQuery();
    const openSessionMutation = useOpenSessionMutation();

    const exchangeRates = useInventoryStore((state) => state.exchangeRates);
    const setExchangeRates = useInventoryStore((state) => state.setExchangeRates);
    // const exchangeRateAutomaticQuery = useExchangeRateAutomaticQuery();
    // const exchangeRateDefaultMutation = useExchangeRateDefaultMutation();
    const [bcvRate, setBcvRate] = useState(exchangeRates ? exchangeRates.find((rate) => rate.currency === 'USD') : undefined);
    const [euroRate, setEuroRate] = useState(exchangeRates ? exchangeRates.find((rate) => rate.currency === 'EUR') : undefined);
    const [exchangeDate, setExchangeDate] = useState(exchangeRates.length > 1 ? exchangeRates[0].date : undefined);

    useEffect(() => {
        const bcvRate = exchangeRates ? exchangeRates.find((rate) => rate.currency === 'USD') : undefined;
        const euroRate = exchangeRates ? exchangeRates.find((rate) => rate.currency === 'EUR') : undefined;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setBcvRate(bcvRate);
        setEuroRate(euroRate);
        setExchangeDate(exchangeRates.length > 1 ? exchangeRates[0].date : undefined);
    }, [exchangeRates])

    const cashierSessionOptions = data ? data.sessions.map((cashDrawerSession) => ({
        label: `${cashDrawerSession.cashDrawer.name} (${cashDrawerSession.user.name})`,
        value: cashDrawerSession.sessionId.toString(),
    })) : [];

    useEffect(() => {
        if (user?.role === 'CAJERO' && !isLoading) {
            const activeSession = data?.sessions.find(session => session.user.id === user?.id);
            if (!activeSession) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setOpen(true);
            } else {
                useAuthStore.getState().setCashDrawerSession(activeSession.sessionId.toString());
            }
        }
    }, [data, user, isLoading])

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
        // await exchangeRateAutomaticQuery.refetch();
        navigate('/tasas');
    }

    useSocket('exchangeRateUpdate', (data: { data: ExchangeRate[], message: string }) => {
        toast.success(data.message, {
            position: "top-right",
            duration: 3000,
        });

        setExchangeRates(data.data);
    });

    const onChangeCashDrawerSession = (value: string) => {
        const selectedCashier = data?.sessions.find(session => session.sessionId.toString() === value);
        if (selectedCashier) {
            useAuthStore.getState().setCashier({ id: selectedCashier.user.id, name: selectedCashier.user.name, cashDrawer: selectedCashier.cashDrawer.name.toString() });
            useAuthStore.getState().setCashDrawerSession(selectedCashier.sessionId.toString());
        }
    }

    const validateToCloseDialog = () => {
        if (cashDrawerSelected === null || balance <= 0 || balanceUsd <= 0) {
            return;
        }
        setOpen(false);
    }

    const openSession = () => {
        openSessionMutation.mutate({
            cashDrawerId: Number(cashDrawerSelected),
            openingBalance: balance,
            openingBalanceUsd: balanceUsd,
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
                {cashierSessionOptions.length > 0 ? (
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
                ) : (
                    <div className="w-60 flex items-center h-9 px-3 rounded-md border border-gray-300 bg-gray-50 text-gray-500 text-sm">
                        No hay cajeros disponibles
                    </div>
                )}
            </div>
            <div className="flex items-center gap-1 mb-1 relative ">
                {user?.role !== 'CAJERO' && (
                    <Button variant='ghost' onClick={updateExchangeRates}><IoMdSync /></Button>
                )}
                <span className={`cursor-pointer rounded-md px-4 py-1 bg-gray-200 text-gray-800`}>BCV: {bcvRate ? `${formatNumberWithDecimal(bcvRate.rate)} Bs` : '--'} </span>
                <span>|</span>
                <span className={`cursor-pointer rounded-md px-4 py-1 bg-gray-200 text-gray-800`}>Euro: {euroRate ? `${formatNumberWithDecimal(euroRate.rate)} Bs` : '--'}</span>
                <span className={`absolute -bottom-2.5 right-0 text-gray-800 px-4 text-xs w-120 text-right`}>Fecha de Actualización: {exchangeDate ? `${formatDateString(exchangeDate)} Hora: ${formatOnlyTime(exchangeDate)}` : '--'}</span>
            </div>

            <Dialog open={open} onOpenChange={(open) => { if (!open) validateToCloseDialog(); }}>
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
                                placeholder="Ingrese el balance inicial en Bs"
                            />
                            <span className="text-gray-500 text-sm">Esta es la cantidad de dinero con la que se inicia la caja.</span>
                        </div>

                        <div className="flex flex-col gap-2 my-4">
                            <p className='font-semibold'>Balance inicial (USD)</p>
                            <Input
                                type="number"
                                step="0.01"
                                value={balanceUsd}
                                onChange={(event) => setBalanceUsd(Number(event.target.value))}
                                placeholder="Ingrese el balance inicial en USD"
                            />
                            <span className="text-gray-500 text-sm">Esta es la cantidad de dolares con la que se inicia la caja.</span>
                        </div>

                        <Button variant='primary' className="mt-2 w-full" onClick={openSession} disabled={balance < 0 || balanceUsd < 0 || cashDrawerSelected === null}>
                            Aceptar
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
