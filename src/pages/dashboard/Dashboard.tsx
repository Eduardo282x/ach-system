import { DatePickerRange } from "@/components/datePickerRange/DatePickerRange";
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
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { LuEqualApproximately } from "react-icons/lu";

export const Dashboard = () => {
    const today = new Date();
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: new Date(today.getFullYear(), today.getMonth(), 1),
        to: new Date(today.getFullYear(), today.getMonth() + 1, 0),
    });

    const filter: DateRangeFilter = {
        startDate: dateRange?.from ? formatOnlyDateStringFilter(dateRange.from) : "",
        endDate: dateRange?.to ? formatOnlyDateStringFilter(dateRange.to) : "",
    };

    const { data: dashboard, isLoading, isError } = useDashboardSummaryQuery(filter);

    const handleChangeRange = (range: DateRange | undefined) => {
        setDateRange(range);
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
        <div className="w-full h-full p-4 space-y-4">
            <div className="bg-white rounded-xl p-4 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold text-blue-800">Dashboard de Ventas</h2>
                    <p className="text-sm text-gray-600">
                        {dashboard?.range
                            ? `${formatDateString(dateRange?.from, true)} - ${formatDateString(dateRange?.to, true)}`
                            : "Selecciona un rango de fecha"}
                    </p>
                </div>
                <div className="mt-4">
                    <DatePickerRange onChange={handleChangeRange} />
                </div>
            </div>

            {isLoading && <p className="text-gray-700">Cargando resumen...</p>}
            {isError && <p className="text-red-700">No se pudo cargar la información del dashboard.</p>}
            {!dashboard && !isLoading && !isError && <p className="text-gray-700">No hay información para el rango seleccionado.</p>}

            {dashboard && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-xl p-4 border border-gray-200">
                            <p className="text-sm text-gray-600">Ingresos (pagos) realizados</p>
                            <p className="text-2xl font-bold text-blue-800 mt-1 flex items-end">
                                {formatNumberWithDecimal(dashboard.ingresos.totalNetBs)} {translateCurrency("BS")}
                                <span className="mx-2 text-sm text-gray-600 flex items-center"><LuEqualApproximately/> {formatNumberWithDecimal(dashboard.ingresos.totalNetUsd)} {translateCurrency("USD")}</span>
                            </p>
                        </div>

                        <div className="bg-white rounded-xl p-4 border border-gray-200">
                            <p className="text-sm text-gray-600">Total de venta</p>
                            <p className="text-2xl font-bold text-blue-800 mt-1 flex items-end">
                                {formatNumberWithDecimal(dashboard.totalSales.amountBs)} {translateCurrency("BS")}
                                <span className="mx-2 text-sm text-gray-600 flex items-center"><LuEqualApproximately/> {formatNumberWithDecimal(dashboard.totalSales.amountUsd)} {translateCurrency("USD")}</span>
                            </p>
                        </div>

                        <div className="bg-white rounded-xl p-4 border border-gray-200">
                            <p className="text-sm text-gray-600">Total de facturas</p>
                            <p className="text-2xl font-bold text-blue-800 mt-1">{dashboard.totalInvoices}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        <div className="bg-white rounded-xl p-4 border border-gray-200">
                            <h3 className="text-lg font-bold mb-3 text-blue-800">Ingresos</h3>
                            <div className="rounded-md overflow-hidden border border-gray-200">
                                <div className="grid grid-cols-3 bg-gray-100 p-2 text-sm font-semibold">
                                    <p>Tipo</p>
                                    <p className="text-right">BS</p>
                                    <p className="text-right">USD</p>
                                </div>
                                <div className="grid grid-cols-3 p-2 border-t border-gray-100 text-sm">
                                    <p>Monto recibido</p>
                                    <p className="text-right">{formatNumberWithDecimal(dashboard.ingresos.amountBs)}</p>
                                    <p className="text-right">{formatNumberWithDecimal(dashboard.ingresos.amountUsd)}</p>
                                </div>
                                <div className="grid grid-cols-3 p-2 border-t border-gray-100 text-sm">
                                    <p>Cambio/Vuelto</p>
                                    <p className="text-right">{formatNumberWithDecimal(dashboard.ingresos.changeAmountBs)}</p>
                                    <p className="text-right">{formatNumberWithDecimal(dashboard.ingresos.changeAmountUsd)}</p>
                                </div>
                                <div className="grid grid-cols-3 p-2 border-t border-gray-100 text-sm font-semibold bg-gray-50">
                                    <p>Neto</p>
                                    <p className="text-right">{formatNumberWithDecimal(dashboard.ingresos.totalNetBs)}</p>
                                    <p className="text-right">{formatNumberWithDecimal(dashboard.ingresos.totalNetUsd)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-4 border border-gray-200">
                            <h3 className="text-lg font-bold mb-3 text-blue-800">Facturas</h3>
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
                                        <p className="text-right">{formatNumberWithDecimal(invoice.totalAmountBs)} {translateCurrency("BS")}</p>
                                        <p className="text-right">{translateStatus(invoice.status)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 pb-4">
                        <div className="bg-white rounded-xl p-4 border border-gray-200">
                            <h3 className="text-lg font-semibold mb-3 text-blue-800">Clientes con mayor frecuencia de compra</h3>
                            <div className="space-y-2 h-104 overflow-y-auto pr-2">
                                {dashboard.frequentCustomers.map((customer) => (
                                    <div key={customer.customerId} className="flex items-center justify-between border-b border-gray-100 pb-2">
                                        <div>
                                            <p className="font-medium">{customer.fullName}</p>
                                            <p className="text-xs text-gray-500">{formatNumberWithDots(customer.identify, "", "", true)}</p>
                                        </div>
                                        <p className="text-sm font-semibold">{customer.totalInvoices} facturas</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-4 border border-gray-200">
                            <h3 className="text-lg font-semibold mb-3 text-blue-800">Productos con mayor venta</h3>
                            <div className="space-y-2 h-104 overflow-y-auto pr-2">
                                {dashboard.topProducts.map((product) => (
                                    <div key={product.productId} className="flex items-center justify-between border-b border-gray-100 pb-2">
                                        <div>
                                            <p className="font-medium">{product.name}</p>
                                            <p className="text-xs text-gray-500">{product.totalQuantitySold} unidades | {product.totalInvoices} facturas</p>
                                        </div>
                                        <p className="text-sm font-semibold">{formatNumberWithDecimal(product.totalAmountBs)} {translateCurrency("BS")}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-4 border border-gray-200">
                            <h3 className="text-lg font-semibold mb-3 text-blue-800">Productos con bajo stock <span className="text-gray-500 text-sm">({dashboard.lowStockProducts.length})</span></h3>
                            <div className="space-y-2 h-104 overflow-y-auto pr-2">
                                {dashboard.lowStockProducts.map((product) => (
                                    <div key={product.id} className="flex items-center justify-between border-b border-gray-100 pb-2">
                                        <div>
                                            <p className="font-medium">{product.name}</p>
                                            <p className="text-xs text-gray-500">{product.presentation}</p>
                                        </div>
                                        <p className="text-sm font-semibold text-red-700">{product.stock} en stock</p>
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
