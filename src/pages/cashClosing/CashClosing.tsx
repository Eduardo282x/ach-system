import { DatePicker } from "@/components/datePickerRange/DatePickerRange"
import { useResumenSalesQuery } from "@/hooks/dispatch.hook";
import { formatDate, formatNumberWithDecimal, formatOnlyDateStringFilter, translateCurrency } from "@/helpers/formatters";
import type { ResumenFilter } from "@/interfaces/distpatch.interface";
import { useState } from "react";
import { LuEqualApproximately } from "react-icons/lu";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSessionsQuery } from "@/hooks/sessions.hook";
import { Button } from "@/components/ui/button";
import { RiFileExcel2Line } from "react-icons/ri";
import { getResumenSalesExcelApi } from "@/services/dispatch.service";
import { Loading } from "@/components/loader/Loading";

export const CashClosing = () => {

    const [filter, setFilter] = useState<ResumenFilter>({ date: formatOnlyDateStringFilter(new Date()) ?? '', sessionId: undefined });
    const { data: resumen, isLoading } = useResumenSalesQuery(filter);

    const cashDrawerSessions = useSessionsQuery({ status: 'OPEN' });

    const cashierSessionOptions = cashDrawerSessions.data ? cashDrawerSessions.data.sessions.map((cashDrawerSession) => ({
        label: `${cashDrawerSession.cashDrawer.name} (${cashDrawerSession.user.name})`,
        value: cashDrawerSession.sessionId.toString(),
    })) : [];

    const handleCashDrawerSessionChange = (sessionId: string) => {
        if (sessionId === 'all') {
            setFilter((prev) => ({
                ...prev,
                sessionId: undefined,
            }));
            return;
        }
        setFilter((prev) => ({
            ...prev,
            sessionId: parseInt(sessionId),
        }));
    }

    const handleChangeDate = (date: Date | undefined) => {
        const parsedDate = formatOnlyDateStringFilter(date);
        if (!parsedDate) return;

        setFilter({
            date: parsedDate,
        })
    }

    const handleExportExcel = async () => {
        const blob = await getResumenSalesExcelApi(filter);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Resumen Cierre Caja ${formatDate(filter.date)}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
    }

    return (
        <div className='w-full h-full'>
            <div className='w-3/4 mx-auto bg-white rounded-xl p-4 mb-4'>
                <div className="flex items-center justify-between mb-4 w-full">
                    <p className='text-2xl font-semibold mb-4'>Cierre de Caja</p>
                    <Button variant='export' onClick={handleExportExcel}><RiFileExcel2Line /> Exportar</Button>
                </div>
                <div className="flex items-center justify-between mb-4 w-full">
                    <DatePicker onChange={handleChangeDate} />

                    <div className="flex flex-col gap-2">
                        <Label>Caja</Label>
                        <Select
                            value={filter.sessionId?.toString() ?? 'all'}
                            onValueChange={handleCashDrawerSessionChange}
                        >
                            <SelectTrigger className="w-60">
                                <SelectValue placeholder="Seleccione un cajero" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="all">Todos</SelectItem>
                                    {cashierSessionOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {isLoading && <div className="flex flex-col items-center gap-2 py-10">
                    <Loading />
                    <p>Cargando resumen...</p>
                </div>}
                {resumen && resumen.totalInvoice > 0 && (
                    <div className="space-y-2">
                        <div className="rounded-md overflow-hidden border border-gray-300">
                            <div className="grid grid-cols-4 border-b p-2 bg-gray-200 font-semibold">
                                <p>Método de pago</p>
                                <p>Monto General</p>
                                <p>Cambio/Vuelto</p>
                                <p>Monto Total</p>
                            </div>
                            {resumen.resumen.map((item) => (
                                <div key={item.paymentTypeId} className="grid grid-cols-4 border-b p-2">
                                    <p>{item.payment}</p>
                                    <p className="flex items-center gap-1">{`${formatNumberWithDecimal(item.currency == 'USD' ? item.amountUsd : item.amount)} ${translateCurrency(item.currency)}`} {item.currency == 'USD' && (<span className="text-sm text-gray-500 font-medium flex items-center gap-1"><LuEqualApproximately /> {`(${formatNumberWithDecimal(item.amount)} ${translateCurrency('BS')})`}</span>)}</p>
                                    <p className="flex items-center gap-1">{`${formatNumberWithDecimal(item.currency == 'USD' ? item.changeAmountUsd : item.changeAmount)} ${translateCurrency(item.currency)}`} {item.currency == 'USD' && (<span className="text-sm text-gray-500 font-medium flex items-center gap-1"><LuEqualApproximately /> {`(${formatNumberWithDecimal(item.changeAmount)} ${translateCurrency('BS')})`}</span>)}</p>
                                    <p className="flex items-center gap-1">{`${formatNumberWithDecimal(item.currency == 'USD' ? item.totalAmountUsd : item.totalAmount)} ${translateCurrency(item.currency)}`} {item.currency == 'USD' && (<span className="text-sm text-gray-500 font-medium flex items-center gap-1"><LuEqualApproximately /> {`(${formatNumberWithDecimal(item.totalAmount)} ${translateCurrency('BS')})`}</span>)}</p>
                                </div>
                            ))}
                            <div className="grid grid-cols-4 border-b p-2 bg-gray-200 font-semibold">
                                <p>Total</p>
                                <p className="flex items-center gap-1" >{`${formatNumberWithDecimal(resumen.total.amountBs)} ${translateCurrency('BS')}`} <LuEqualApproximately /> <span className="text-sm text-gray-500 font-medium">{`(${formatNumberWithDecimal(resumen.total.amountUsd)} ${translateCurrency('USD')})`}</span></p>
                                <p className="flex items-center gap-1" >{`${formatNumberWithDecimal(resumen.total.changeAmountBs)} ${translateCurrency(`BS`)}`} <LuEqualApproximately /> <span className="text-sm text-gray-500 font-medium">{`(${formatNumberWithDecimal(resumen.total.changeAmountUsd)} ${translateCurrency('USD')})`}</span></p>
                                <p className="flex items-center gap-1" >{`${formatNumberWithDecimal(resumen.total.totalAmountBs)} ${translateCurrency('BS')}`} <LuEqualApproximately /> <span className="text-sm text-gray-500 font-medium">{`(${formatNumberWithDecimal(resumen.total.totalAmountUsd)} ${translateCurrency('USD')})`}</span></p>
                            </div>
                        </div>
                        <p className="font-semibold">Total facturas: {resumen.totalInvoice}</p>

                    </div>
                )}
                {resumen && resumen.totalInvoice === 0 && (
                    <p className="text-center text-xl text-gray-700 py-20">No se encontraron ventas para la fecha seleccionada.</p>
                )}
            </div>
        </div>
    )
}
