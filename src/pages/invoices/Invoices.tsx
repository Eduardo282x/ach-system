import { useCallback, useMemo, useRef, useState } from "react";
import { useInvoicesQuery } from "@/hooks/dispatch.hook";
import { useUsersQuery } from "@/hooks/users.hook";
import { useSessionsGroupQueryRange } from "@/hooks/sessions.hook";
import { useShiftsQuery } from "@/hooks/shifts.hook";
import type { InvoiceResponse, PaymentDetail } from "@/interfaces/distpatch.interface";
import type { ExchangeRateType } from "@/interfaces/inventory.interface";
import { FilterComponent } from "@/components/table/FilterComponent";
import { ClearFiltersButton } from "@/components/table/ClearFiltersButton";
import { DatePickerRange } from "@/components/datePickerRange/DatePickerRange";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { formatDate, formatOnlyDateStringFilter, formatOnlyTime, parseDateOnlyString } from "@/helpers/formatters";
import { useInvoicesFilterStore } from "@/store/invoices.store";
import { PaymentDetailsDialog } from "./PaymentDetailsDialog";
import { PrintInvoice, type InvoiceData } from "../dispatch/PrintInvoice";
import { useReactToPrint } from "react-to-print";
import { INVOICE_BODY_CLASS, INVOICE_PAGE_STYLE } from "@/helpers/print.helper";
import type { DateRange } from "react-day-picker";
import { EmptyInvoice, invoiceColumns, invoiceDetailsColumns } from "./invoices.data";
import { TableComponent } from "@/components/table/TableComponent";

export const Invoices = () => {
    const { filter, setFilter, resetFilter } = useInvoicesFilterStore((state) => state);
    // const [expandedRow, setExpandedRow] = useState<number | null>(null);
    const [filterResetKey, setFilterResetKey] = useState(0);
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
    const [selectedPaymentDetails, setSelectedPaymentDetails] = useState<PaymentDetail[]>([]);
    const [selectedInvoiceTotals, setSelectedInvoiceTotals] = useState<{ totalAmountBs: string; totalAmountUsd: string }>({ totalAmountBs: "0", totalAmountUsd: "0" });

    const componentRef = useRef<HTMLDivElement>(null);

    const { data: invoicesData, isLoading } = useInvoicesQuery(filter);
    const { data: usersData } = useUsersQuery("");
    const { data: shiftsData } = useShiftsQuery();

    const cashDrawerSessions = useSessionsGroupQueryRange({ startDate: filter.startDate ?? '', endDate: filter.endDate ?? '', shiftId: filter.shiftId ?? 0 });

    const cashierSessionOptions = cashDrawerSessions.data ? cashDrawerSessions.data.sessions.map((cashDrawerSession) => ({
        label: `${cashDrawerSession.cashDrawer.name} (${cashDrawerSession.user.name}) - Turno: ${cashDrawerSession.shift?.name ?? 'Sin turno'}`,
        value: cashDrawerSession.id.toString(),
    })) : [];

    const invoices = useMemo(() => invoicesData?.invoices ?? [], [invoicesData]);
    const pagination = invoicesData?.pagination;

    const users = useMemo(() => usersData?.users ?? [], [usersData]);
    const shifts = useMemo(() => (shiftsData?.shifts ?? []).filter((shift) => shift.active), [shiftsData]);

    const handleSearch = useCallback((value: string) => {
        setFilter((prev) => ({ ...prev, search: value || undefined, page: 1 }));
    }, [setFilter]);

    const [invoiceSelected, setInvoiceSelected] = useState<InvoiceResponse | null>(null);

    const handleDateRangeChange = useCallback((dateRange: DateRange | undefined) => {
        if (dateRange?.from && dateRange?.to) {
            setFilter((prev) => ({
                ...prev,
                startDate: formatOnlyDateStringFilter(dateRange.from),
                endDate: formatOnlyDateStringFilter(dateRange.to),
                page: 1,
            }));
        } else {
            setFilter((prev) => ({ ...prev, startDate: undefined, endDate: undefined, page: 1 }));
        }
    }, [setFilter]);

    const dateRangeValue = useMemo<DateRange | undefined>(() => ({
        from: filter.startDate ? parseDateOnlyString(filter.startDate) : undefined,
        to: filter.endDate ? parseDateOnlyString(filter.endDate) : undefined,
    }), [filter.startDate, filter.endDate]);

    const handleClearFilters = useCallback(() => {
        resetFilter();
        setFilterResetKey((key) => key + 1);
    }, [resetFilter]);

    const handleSessionChange = useCallback((value: string) => {
        setFilter((prev) => ({
            ...prev,
            sessionId: value === "all" ? undefined : Number(value),
            page: 1,
        }));
    }, [setFilter]);

    const handleUserChange = useCallback((value: string) => {
        setFilter((prev) => ({
            ...prev,
            userId: value === "all" ? undefined : Number(value),
            page: 1,
        }));
    }, [setFilter]);

    const handleShiftChange = useCallback((value: string) => {
        setFilter((prev) => ({
            ...prev,
            shiftId: value === "all" ? undefined : Number(value),
            page: 1,
        }));
    }, [setFilter]);

    const changePagination = (page: number, size: number) => {
        setFilter((prev) => ({ ...prev, page, size }));
    }

    // const toggleRow = useCallback((invoiceId: number) => {
    //     setExpandedRow((prev) => (prev === invoiceId ? null : invoiceId));
    // }, []);

    const handleOpenPayments = useCallback((invoice: InvoiceResponse) => {
        setSelectedPaymentDetails(invoice.paymentDetails);
        setSelectedInvoiceTotals({
            totalAmountBs: invoice.totalAmountBs,
            totalAmountUsd: invoice.totalAmountUsd,
        });
        setPaymentDialogOpen(true);
    }, []);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: "Factura",
        bodyClass: INVOICE_BODY_CLASS,
        pageStyle: INVOICE_PAGE_STYLE,
    });

    const getActionTable = async (action: string, data: InvoiceResponse) => {
        setInvoiceSelected(data);
        if (action === "print") {
            setTimeout(() => handlePrint(), 100);
        }
        if (action === "viewPayments") {
            handleOpenPayments(data);
        }
    }

    const invoicePrint: InvoiceData = useMemo(() => {
        if (!invoiceSelected) return EmptyInvoice;
        const data: InvoiceData = {
            invoiceNumber: invoiceSelected.invoiceNumber,
            date: formatDate(invoiceSelected.createdAt),
            time: formatOnlyTime(invoiceSelected.createdAt),
            cashier: invoiceSelected.user?.name ?? "--",
            customer: {
                fullName: invoiceSelected.customer?.fullName ?? "--",
                identify: invoiceSelected.customer?.identify ?? "--",
                phone: "--",
            },
            totals: {
                totalBs: Number(invoiceSelected.totalAmountBs),
                totalUSD: Number(invoiceSelected.totalAmountUsd),
            },
            productsList: invoiceSelected.items.map((item) => ({
                id: item.product.id,
                name: item.product.name,
                quantity: item.quantity,
                unitPrice: Number(item.unitPrice),
                subtotal: Number(item.subtotal),
            })),
            payments: invoiceSelected.paymentDetails.map((p) => ({
                typePayment: p.paymentType?.name ?? "--",
                currency: p.currency as ExchangeRateType,
                reference: "",
                amountBs: p.currency === "BS" ? Number(p.amountReceived) : Number(p.amountNetBs),
                amountUSD: p.currency === "USD" ? Number(p.amountReceived) : 0,
            })),
        };
        return data;
    }, [invoiceSelected]);

    return (
        <div className="w-full h-full min-h-0 flex flex-col">
            <p className="text-2xl font-semibold mb-2 ml-2 shrink-0">Recibos</p>
            <div className="rounded-xl bg-white p-4 flex flex-1 min-h-0 flex-col">
                {/* Filters */}
                <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 mb-4">
                    <div className="flex flex-1 flex-wrap items-center gap-3">
                        <div className="w-full sm:w-72">
                            <FilterComponent
                                key={filterResetKey}
                                placeholder="Buscar por # factura, cliente o cedula..."
                                onChange={handleSearch}
                                defaultValue={filter.search ?? ""}
                            />
                        </div>

                        <Select
                            value={filter.sessionId?.toString() ?? "all"}
                            onValueChange={handleSessionChange}
                        >
                            <SelectTrigger className="w-full sm:w-48">
                                <SelectValue placeholder="Todas las sesiones" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="all">Todas las sesiones</SelectItem>
                                    {cashierSessionOptions.map((session) => (
                                        <SelectItem key={session.value} value={session.value}>
                                            {session.label}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>

                        <Select
                            value={filter.userId?.toString() ?? "all"}
                            onValueChange={handleUserChange}
                        >
                            <SelectTrigger className="w-full sm:w-48">
                                <SelectValue placeholder="Todos los cajeros" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="all">Todos los cajeros</SelectItem>
                                    {users.map((user) => (
                                        <SelectItem key={user.id} value={String(user.id)}>
                                            {user.name}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>

                        <Select
                            value={filter.shiftId?.toString() ?? "all"}
                            onValueChange={handleShiftChange}
                        >
                            <SelectTrigger className="w-full sm:w-48">
                                <SelectValue placeholder="Todos los turnos" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="all">Todos los turnos</SelectItem>
                                    {shifts.map((shift) => (
                                        <SelectItem key={shift.id} value={String(shift.id)}>
                                            {shift.name}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-2">
                        <DatePickerRange value={dateRangeValue} onChange={handleDateRangeChange} />
                        <ClearFiltersButton onClear={handleClearFilters} />
                    </div>

                </div>

                {/* Table */}
                <TableComponent
                    onChange={getActionTable}
                    columns={invoiceColumns}
                    data={invoices}
                    isLoading={isLoading}
                    isExpansible={true}
                    fillHeight
                    pagination={pagination}
                    totalElements={pagination?.total}
                    onPaginationChange={changePagination}
                    renderRow={(item, index) => (
                        <InvoiceDetail key={index} invoice={item} />
                    )}
                />
            </div>

            {/* Payment Details Dialog */}
            <PaymentDetailsDialog
                open={paymentDialogOpen}
                onClose={() => setPaymentDialogOpen(false)}
                paymentDetails={selectedPaymentDetails}
                totalAmountBs={selectedInvoiceTotals.totalAmountBs}
                totalAmountUsd={selectedInvoiceTotals.totalAmountUsd}
            />

            {/* Hidden PrintInvoice */}
            <div className="print-invoice-hidden" aria-hidden="true">
                <PrintInvoice ref={componentRef} data={invoicePrint} />
            </div>
        </div>
    );
};

export const InvoiceDetail = ({ invoice }: { invoice: InvoiceResponse }) => {
    return (
        <div className="h-full">
            <TableComponent
                columns={invoiceDetailsColumns}
                data={invoice.items}
                onChange={() => { }}
                ignorePagination={true}
                automaticHeight={true}
            />
        </div>
    )
}