import { useCallback, useMemo, useRef, useState } from "react";
import { useInvoicesQuery } from "@/hooks/dispatch.hook";
import { useUsersQuery } from "@/hooks/users.hook";
import { useSessionsQuery } from "@/hooks/sessions.hook";
import { useShiftsQuery } from "@/hooks/shifts.hook";
import type { InvoicesFilter, InvoiceResponse, PaymentDetail } from "@/interfaces/distpatch.interface";
import type { ExchangeRateType } from "@/interfaces/inventory.interface";
import { FilterComponent } from "@/components/table/FilterComponent";
import { DatePickerRange } from "@/components/datePickerRange/DatePickerRange";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

import { formatDate, formatOnlyTime } from "@/helpers/formatters";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { PaymentDetailsDialog } from "./PaymentDetailsDialog";
import { PrintInvoice, type InvoiceData } from "../dispatch/PrintInvoice";
import { useReactToPrint } from "react-to-print";
import type { DateRange } from "react-day-picker";
import { EmptyInvoice, invoiceColumns, invoiceDetailsColumns } from "./invoices.data";
import { TableComponent } from "@/components/table/TableComponent";

export const Invoices = () => {
    const [filter, setFilter] = useState<InvoicesFilter>({
        page: 1,
        size: 20,
    });
    // const [expandedRow, setExpandedRow] = useState<number | null>(null);
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
    const [selectedPaymentDetails, setSelectedPaymentDetails] = useState<PaymentDetail[]>([]);
    const [selectedInvoiceTotals, setSelectedInvoiceTotals] = useState<{ totalAmountBs: string; totalAmountUsd: string }>({ totalAmountBs: "0", totalAmountUsd: "0" });

    const componentRef = useRef<HTMLDivElement>(null);

    const { data: invoicesData, isLoading } = useInvoicesQuery(filter);
    const { data: usersData } = useUsersQuery("");
    const { data: sessionsData } = useSessionsQuery();
    const { data: shiftsData } = useShiftsQuery();

    const invoices = useMemo(() => invoicesData?.invoices ?? [], [invoicesData]);
    const pagination = invoicesData?.pagination;

    const users = useMemo(() => usersData?.users ?? [], [usersData]);
    const sessions = useMemo(() => sessionsData?.sessions ?? [], [sessionsData]);
    const shifts = useMemo(() => shiftsData?.shifts ?? [], [shiftsData]);

    const handleSearch = useCallback((value: string) => {
        setFilter((prev) => ({ ...prev, search: value || undefined, page: 1 }));
    }, []);

    const [invoiceSelected, setInvoiceSelected] = useState<InvoiceResponse | null>(null);

    const handleDateRangeChange = useCallback((dateRange: DateRange | undefined) => {
        if (dateRange?.from && dateRange?.to) {
            const startDate = new Date(dateRange.from);
            const endDate = new Date(dateRange.to);
            const startStr = startDate.toISOString().split("T")[0];
            const endStr = endDate.toISOString().split("T")[0];
            setFilter((prev) => ({ ...prev, startDate: startStr, endDate: endStr, page: 1 }));
        } else {
            setFilter((prev) => ({ ...prev, startDate: undefined, endDate: undefined, page: 1 }));
        }
    }, []);

    const handleSessionChange = useCallback((value: string) => {
        setFilter((prev) => ({
            ...prev,
            sessionId: value === "all" ? undefined : Number(value),
            page: 1,
        }));
    }, []);

    const handleUserChange = useCallback((value: string) => {
        setFilter((prev) => ({
            ...prev,
            userId: value === "all" ? undefined : Number(value),
            page: 1,
        }));
    }, []);

    const handleShiftChange = useCallback((value: string) => {
        setFilter((prev) => ({
            ...prev,
            shiftId: value === "all" ? undefined : Number(value),
            page: 1,
        }));
    }, []);

    const handlePageChange = useCallback((newPage: number) => {
        setFilter((prev) => ({ ...prev, page: newPage }));
    }, []);

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
        <div className="w-full">
            <p className="text-2xl font-semibold mb-2 ml-2">Facturas</p>
            <div className="rounded-xl bg-white p-4">
                {/* Filters */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className="w-72">
                            <FilterComponent
                                placeholder="Buscar por # factura, cliente o cedula..."
                                onChange={handleSearch}
                            />
                        </div>

                        <Select onValueChange={handleSessionChange}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Todas las sesiones" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="all">Todas las sesiones</SelectItem>
                                    {sessions.map((session) => (
                                        <SelectItem key={session.sessionId} value={String(session.sessionId)}>
                                            {session.cashDrawer?.name ?? `Sesion ${session.sessionId}`}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>

                        <Select onValueChange={handleUserChange}>
                            <SelectTrigger className="w-48">
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

                        <Select onValueChange={handleShiftChange}>
                            <SelectTrigger className="w-48">
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

                    <DatePickerRange onChange={handleDateRangeChange} />

                </div>

                {/* Table */}
                <TableComponent
                    onChange={getActionTable}
                    columns={invoiceColumns}
                    data={invoices}
                    isLoading={isLoading}
                    isExpansible={true}
                    pagination={pagination}
                    totalElements={pagination?.total}
                    renderRow={(item, index) => (
                        <InvoiceDetail key={index} invoice={item} />
                    )}
                />

                {/* Pagination */}
                {pagination && pagination.totalPages > 0 && (
                    <div className="flex items-center justify-between mt-4">
                        <p className="text-sm text-muted-foreground">
                            Mostrando {(pagination.page - 1) * pagination.size + 1} -{" "}
                            {Math.min(pagination.page * pagination.size, pagination.total)} de{" "}
                            {pagination.total} facturas
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={pagination.page <= 1}
                                onClick={() => handlePageChange(pagination.page - 1)}
                            >
                                <LuChevronLeft className="size-4" />
                            </Button>
                            <span className="text-sm">
                                Pagina {pagination.page} de {pagination.totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={pagination.page >= pagination.totalPages}
                                onClick={() => handlePageChange(pagination.page + 1)}
                            >
                                <LuChevronRight className="size-4" />
                            </Button>
                        </div>
                    </div>
                )}
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
            <div className="hidden">
                <PrintInvoice ref={componentRef} data={invoicePrint} />
            </div>
        </div>
    );
};

const InvoiceDetail = ({ invoice }: { invoice: InvoiceResponse }) => {

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