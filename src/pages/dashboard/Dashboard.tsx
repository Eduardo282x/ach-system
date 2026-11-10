import { DatePickerRange } from "@/components/datePickerRange/DatePickerRange";
import { SalesTrendPanel } from "@/components/dashboard/SalesTrendPanel";
import { useDashboardSummaryQuery } from "@/hooks/dashboard.hook";
import {
    formatDateString,
    formatDateWithTime,
    formatNumberWithDecimal,
    formatNumberWithDots,
    formatOnlyDateStringFilter,
    translateCurrency,
} from "@/helpers/formatters";
import type { DateRangeFilter } from "@/interfaces/base.interface";
import type { InvoiceStatus } from "@/interfaces/distpatch.interface";
import type { TrendGroupBy, TrendPeriod } from "@/interfaces/dashboard.interface";
import { useState } from "react";
import type { DateRange } from "react-day-picker";

const parseDateOnly = (value: string) => new Date(`${value}T00:00:00`);

export const Dashboard = () => {
    const today = new Date();

    const defaultRange: DateRange = {
        from: new Date(today.getFullYear(), 0, 1),
        to: new Date(today.getFullYear(), 5, 30),
    };

    const [dateRange, setDateRange] = useState<DateRange | undefined>(defaultRange);
    const [fullRange, setFullRange] = useState<DateRange | undefined>(defaultRange);
    const [trendGroupBy, setTrendGroupBy] = useState<TrendGroupBy>("month");
    const [activePeriod, setActivePeriod] = useState<{ key: string; label: string } | null>(null);

    const filter: DateRangeFilter = {
        startDate: dateRange?.from ? formatOnlyDateStringFilter(dateRange.from) : "",
        endDate: dateRange?.to ? formatOnlyDateStringFilter(dateRange.to) : "",
    };

    const { data: dashboard, isLoading, isError } = useDashboardSummaryQuery(filter);

    const paymentRows = dashboard?.paymentBreakdown.filter(
        (item) => item.received !== 0 || item.change !== 0 || item.net !== 0,
    ) ?? [];

    const handleChangeRange = (range: DateRange | undefined) => {
        setDateRange(range);
        setFullRange(range);
        setActivePeriod(null);
    };

    const handleSelectPeriod = (period: TrendPeriod) => {
        if (!period.startDate || !period.endDate) return;

        setDateRange({
            from: parseDateOnly(period.startDate),
            to: parseDateOnly(period.endDate),
        });
        setActivePeriod({ key: period.key, label: period.label });
    };

    const handleResetPeriod = () => {
        setDateRange(fullRange);
        setActivePeriod(null);
    };

    const translateStatus = (status: InvoiceStatus) => {
        switch (status) {
            case "PAID":
                return "Pagada";
            case "PENDING":
                return "Pendiente";
            case "CANCELLED":
                return "Anulada";
            default:
                return status;
        }
    };

    return (
        <div className="w-full h-full p-4 space-y-4 overflow-x-hidden">
            <div className="bg-white rounded-xl p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                    <h2 className="text-2xl font-semibold text-blue-800">Dashboard de Ventas</h2>
                    <p className="text-sm text-gray-600">
                        {activePeriod
                            ? `Detalle: ${activePeriod.label} (${formatDateString(dateRange?.from, true)} - ${formatDateString(dateRange?.to, true)})`
                            : dateRange?.from && dateRange?.to
                                ? `${formatDateString(dateRange.from, true)} - ${formatDateString(dateRange.to, true)}`
                                : "Selecciona un rango de fecha"}
                    </p>
                </div>
                <div className="mt-4 w-full min-w-0 md:mt-0 md:w-auto">
                    <DatePickerRange value={dateRange} onChange={handleChangeRange} />
                </div>
            </div>

            <SalesTrendPanel
                groupBy={trendGroupBy}
                onChangeGroupBy={setTrendGroupBy}
                range={dateRange}
                activePeriodKey={activePeriod?.key}
                onSelectPeriod={handleSelectPeriod}
                onResetPeriod={handleResetPeriod}
            />

            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-lg font-bold text-blue-800">Detalle del rango seleccionado</h3>
                {activePeriod && (
                    <span className="w-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                        Periodo: {activePeriod.label}
                    </span>
                )}
            </div>

            {isLoading && <p className="text-gray-700">Cargando resumen...</p>}
            {isError && <p className="text-red-700">No se pudo cargar la información del dashboard.</p>}
            {!dashboard && !isLoading && !isError && <p className="text-gray-700">No hay información para el rango seleccionado.</p>}

            {dashboard && (
                <>
                    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                            <h3 className="text-lg font-bold text-blue-800">Resumen de ventas</h3>
                            <p className="text-xs text-gray-500">
                                {dateRange?.from && dateRange?.to
                                    ? `${formatDateString(dateRange.from, true)} - ${formatDateString(dateRange.to, true)}`
                                    : ""}
                            </p>
                        </div>

                        <div className="rounded-md overflow-x-auto border border-gray-200">
                            <div className="min-w-[640px]">
                                <div className="grid grid-cols-3 bg-gray-100 p-2 text-xs font-semibold">
                                    <p>Concepto</p>
                                    <p className="text-right">Bs</p>
                                    <p className="text-right">USD</p>
                                </div>
                                <div className="grid grid-cols-3 p-2 border-t border-gray-100 text-sm">
                                    <p className="font-medium">Total vendido</p>
                                    <p className="text-right">{formatNumberWithDecimal(dashboard.totalSales.amountBs)} {translateCurrency("BS")}</p>
                                    <p className="text-right">{formatNumberWithDecimal(dashboard.totalSales.amountUsd)} {translateCurrency("USD")}</p>
                                </div>
                                <div className="grid grid-cols-3 p-2 border-t border-gray-100 text-sm">
                                    <p className="font-medium">Costo estimado</p>
                                    <p className="text-right">{formatNumberWithDecimal(dashboard.totalCost.amountBs)} {translateCurrency("BS")}</p>
                                    <p className="text-right">{formatNumberWithDecimal(dashboard.totalCost.amountUsd)} {translateCurrency("USD")}</p>
                                </div>
                                <div className="grid grid-cols-3 p-2 border-t border-gray-100 text-sm font-semibold bg-emerald-50">
                                    <p>Ganancia estimada</p>
                                    <p className="text-right text-emerald-700">{formatNumberWithDecimal(dashboard.profit.amountBs)} {translateCurrency("BS")}</p>
                                    <p className="text-right text-emerald-700">{formatNumberWithDecimal(dashboard.profit.amountUsd)} {translateCurrency("USD")}</p>
                                </div>
                                <div className="grid grid-cols-3 p-2 border-t border-gray-100 text-sm">
                                    <p className="font-medium">Margen</p>
                                    <p className="col-span-2 text-right">{formatNumberWithDecimal(dashboard.profit.marginPercent)}%</p>
                                </div>
                                <div className="grid grid-cols-3 p-2 border-t border-gray-100 text-sm">
                                    <p className="font-medium">Recibos</p>
                                    <p className="text-right">{dashboard.totalInvoices}</p>
                                    <p className="text-right text-xs text-gray-500">
                                        Pagados: {dashboard.paidInvoices} · Pendientes: {dashboard.pendingInvoices}
                                    </p>
                                </div>
                                <div className="grid grid-cols-3 p-2 border-t border-gray-100 text-sm">
                                    <p className="font-medium">Por cobrar (crédito)</p>
                                    <p className="text-right">{formatNumberWithDecimal(dashboard.receivable.amountBs)} {translateCurrency("BS")}</p>
                                    <p className="text-right">{formatNumberWithDecimal(dashboard.receivable.amountUsd)} {translateCurrency("USD")}</p>
                                </div>
                            </div>
                        </div>

                        <p className="text-xs text-gray-500">
                            Bs y USD son la misma venta expresada a la tasa de cada recibo; no se suman. La ganancia es Total vendido − Costo estimado.
                        </p>
                        {dashboard.profit.itemsWithoutCost > 0 && (
                            <p className="text-xs text-amber-700">
                                {dashboard.profit.itemsWithoutCost} ítems sin costo registrado. La ganancia real será menor.
                            </p>
                        )}
                    </div>

                    <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-4">
                        <div>
                            <h3 className="text-lg font-bold text-blue-800">Cobros registrados</h3>
                            <p className="text-xs text-gray-500">
                                Incluye pagos de recibos pagados. La fila "Crédito" corresponde a créditos ya cobrados; los créditos pendientes se muestran en "Por cobrar". Los equivalentes usan la tasa USD/EUR de cada recibo, no la tasa actual.
                            </p>
                        </div>

                        <div className="rounded-md overflow-x-auto border border-gray-200">
                            <div className="min-w-[640px]">
                                <div className="grid grid-cols-3 bg-gray-100 p-2 text-xs font-semibold">
                                    <p>Concepto</p>
                                    <p className="text-right">Monto</p>
                                    <p className="text-right">Equivalente</p>
                                </div>
                                <div className="grid grid-cols-3 p-2 border-t border-gray-100 text-sm">
                                    <p className="font-medium">Cobrado en Bs</p>
                                    <p className="text-right">{formatNumberWithDecimal(dashboard.collected.original.bs.net)} {translateCurrency("BS")}</p>
                                    <p className="text-right">{formatNumberWithDecimal(dashboard.collected.conversions.bsToUsd)} {translateCurrency("USD")}</p>
                                </div>
                                <div className="grid grid-cols-3 p-2 border-t border-gray-100 text-sm">
                                    <p className="font-medium">Cobrado en USD</p>
                                    <p className="text-right">{formatNumberWithDecimal(dashboard.collected.original.usd.net)} {translateCurrency("USD")}</p>
                                    <p className="text-right">{formatNumberWithDecimal(dashboard.collected.conversions.usdToBs)} {translateCurrency("BS")}</p>
                                </div>
                                <div className="grid grid-cols-3 p-2 border-t border-gray-100 text-sm font-semibold bg-blue-50">
                                    <p>Total ingreso en USD</p>
                                    <p className="text-right text-blue-900">{formatNumberWithDecimal(dashboard.collected.grandTotal.usd)} {translateCurrency("USD")}</p>
                                    <p className="text-right text-xs text-gray-600">
                                        {formatNumberWithDecimal(dashboard.collected.conversions.bsToUsd)} + {formatNumberWithDecimal(dashboard.collected.original.usd.net)}
                                    </p>
                                </div>
                                <div className="grid grid-cols-3 p-2 border-t border-gray-100 text-sm font-semibold bg-blue-50">
                                    <p>Total ingreso en Bs</p>
                                    <p className="text-right text-blue-900">{formatNumberWithDecimal(dashboard.collected.grandTotal.bs)} {translateCurrency("BS")}</p>
                                    <p className="text-right text-xs text-gray-600">
                                        {formatNumberWithDecimal(dashboard.collected.original.bs.net)} + {formatNumberWithDecimal(dashboard.collected.conversions.usdToBs)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-md overflow-x-auto border border-gray-200">
                            <div className="min-w-[720px]">
                                <div className="grid grid-cols-7 bg-gray-100 p-2 text-xs font-semibold">
                                    <p className="col-span-2">Método de pago</p>
                                    <p className="text-right">Recibido</p>
                                    <p className="text-right">Vuelto</p>
                                    <p className="text-right">Neto</p>
                                    <p className="text-right">Equiv. Bs</p>
                                    <p className="text-right">Equiv. USD</p>
                                </div>
                                {paymentRows.length === 0 && (
                                    <p className="p-3 text-sm text-gray-600">No hay pagos registrados en el rango seleccionado.</p>
                                )}
                                {paymentRows.map((item) => (
                                    <div key={item.paymentTypeId} className="grid grid-cols-7 p-2 border-t border-gray-100 text-sm">
                                        <div className="col-span-2">
                                            <p className="font-medium">{item.payment}</p>
                                            <p className="text-xs text-gray-500">{translateCurrency(item.currency)}</p>
                                        </div>
                                        <p className="text-right">{formatNumberWithDecimal(item.received)} {translateCurrency(item.currency)}</p>
                                        <p className="text-right">{formatNumberWithDecimal(item.change)} {translateCurrency(item.currency)}</p>
                                        <p className="text-right font-semibold">{formatNumberWithDecimal(item.net)} {translateCurrency(item.currency)}</p>
                                        <p className="text-right">{formatNumberWithDecimal(item.netBs)} {translateCurrency("BS")}</p>
                                        <p className="text-right">{formatNumberWithDecimal(item.netUsd)} {translateCurrency("USD")}</p>
                                    </div>
                                ))}
                                {paymentRows.length > 0 && (
                                    <div className="grid grid-cols-7 p-2 border-t border-gray-200 bg-gray-50 text-sm font-semibold">
                                        <p className="col-span-5">Totales equivalentes</p>
                                        <p className="text-right">{formatNumberWithDecimal(dashboard.collected.equivalents.totalBs.net)} {translateCurrency("BS")}</p>
                                        <p className="text-right">{formatNumberWithDecimal(dashboard.collected.equivalents.totalUsd.net)} {translateCurrency("USD")}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                        <h3 className="text-lg font-bold mb-3 text-blue-800">Recibos del rango</h3>
                        <div className="rounded-md overflow-hidden border border-gray-200 max-h-96 overflow-y-auto">
                            <div className="grid grid-cols-5 bg-gray-100 p-2 text-sm font-semibold sticky top-0">
                                <p>N°</p>
                                <p className="col-span-2">Cliente</p>
                                <p className="text-right">Total</p>
                                <p className="text-right">Estado</p>
                            </div>
                            {dashboard.invoices.map((invoice) => (
                                <div key={invoice.id} className="grid grid-cols-5 p-2 border-t border-gray-100 text-sm">
                                    <p>{invoice.invoiceNumber}</p>
                                    <div className="col-span-2">
                                        <p>{invoice.customer.fullName}</p>
                                        <p className="text-xs text-gray-500">{formatDateWithTime(invoice.createdAt)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p>{formatNumberWithDecimal(invoice.totalAmountBs)} {translateCurrency("BS")}</p>
                                        <p className="text-xs text-gray-500">≈ {formatNumberWithDecimal(invoice.totalAmountUsd)} {translateCurrency("USD")}</p>
                                    </div>
                                    <p className="text-right">{translateStatus(invoice.status)}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 pb-4">
                        <div className="bg-white rounded-xl p-4 border border-gray-200">
                            <h3 className="text-lg font-semibold mb-3 text-blue-800">Clientes con mayor frecuencia de compra</h3>
                            <div className="space-y-2 h-104 overflow-y-auto pr-2">
                                {dashboard.frequentCustomers.map((customer) => (
                                    <div key={customer.customerId} className="flex items-center justify-between gap-2 border-b border-gray-100 pb-2">
                                        <div className="min-w-0">
                                            <p className="truncate font-medium">{customer.fullName}</p>
                                            <p className="text-xs text-gray-500">{formatNumberWithDots(customer.identify, "", "", true)}</p>
                                        </div>
                                        <p className="shrink-0 text-sm font-semibold">{customer.totalInvoices} recibos</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-4 border border-gray-200">
                            <h3 className="text-lg font-semibold mb-3 text-blue-800">Productos con mayor venta</h3>
                            <div className="space-y-2 h-104 overflow-y-auto pr-2">
                                {dashboard.topProducts.map((product) => (
                                    <div key={product.productId} className="flex items-center justify-between gap-2 border-b border-gray-100 pb-2">
                                        <div className="min-w-0">
                                            <p className="truncate font-medium">{product.name}</p>
                                            <p className="text-xs text-gray-500">{product.totalQuantitySold} unidades | {product.totalInvoices} recibos</p>
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <p className="text-sm font-semibold">{formatNumberWithDecimal(product.totalAmountBs)} {translateCurrency("BS")}</p>
                                            {product.totalCostBs > 0 ? (
                                                <p className="text-xs text-emerald-700">Ganancia: {formatNumberWithDecimal(product.totalProfitBs)} {translateCurrency("BS")}</p>
                                            ) : (
                                                <p className="text-xs text-amber-700">Sin costo registrado</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-4 border border-gray-200">
                            <h3 className="text-lg font-semibold mb-3 text-blue-800">Productos con bajo stock <span className="text-gray-500 text-sm">({dashboard.lowStockProducts.length})</span></h3>
                            <div className="space-y-2 h-104 overflow-y-auto pr-2">
                                {dashboard.lowStockProducts.map((product) => (
                                    <div key={product.id} className="flex items-center justify-between gap-2 border-b border-gray-100 pb-2">
                                        <div className="min-w-0">
                                            <p className="truncate font-medium">{product.name}</p>
                                            <p className="text-xs text-gray-500">{product.presentation}</p>
                                        </div>
                                        <p className="shrink-0 text-sm font-semibold text-red-700">{product.stock} en stock</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
