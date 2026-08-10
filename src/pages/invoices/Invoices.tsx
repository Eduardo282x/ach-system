import { useCallback, useMemo, useRef, useState } from "react";
import { useInvoicesQuery, useTypesPaymentsQuery } from "@/hooks/dispatch.hook";
import { AlertDialogComponentPasswordSimple } from "@/components/dialog/AlertDialogComponent";
import { useValidatePasswordAdminMutation } from "@/hooks/inventory.hook";
import { useUsersQuery } from "@/hooks/users.hook";
import { useSessionsQuery } from "@/hooks/sessions.hook";
import type { InvoicesFilter, InvoiceResponse, PaymentDetail, ReturnType } from "@/interfaces/distpatch.interface";
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

import { formatDate, formatOnlyTime } from "@/helpers/formatters";
import { PaymentDetailsDialog } from "./PaymentDetailsDialog";
import { ReturnDialog } from "./ReturnDialog";
import { ChangeDialog } from "./ChangeDialog";
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
    useTypesPaymentsQuery();
    // const [expandedRow, setExpandedRow] = useState<number | null>(null);
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
    const [returnDialogOpen, setReturnDialogOpen] = useState(false);
    const [changeDialogOpen, setChangeDialogOpen] = useState(false);
    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<'return' | 'change' | null>(null);
    const [printInvoiceType, setPrintInvoiceType] = useState<ReturnType | undefined>(undefined);
    const [selectedPaymentDetails, setSelectedPaymentDetails] = useState<PaymentDetail[]>([]);
    const [selectedInvoiceTotals, setSelectedInvoiceTotals] = useState<{ totalAmountBs: string; totalAmountUsd: string }>({ totalAmountBs: "0", totalAmountUsd: "0" });

    const componentRef = useRef<HTMLDivElement>(null);
    const validatePasswordMutation = useValidatePasswordAdminMutation();

    const { data: invoicesData, isLoading } = useInvoicesQuery(filter);
    const { data: usersData } = useUsersQuery("");
    const { data: sessionsData } = useSessionsQuery();

    const invoices = useMemo(() => invoicesData?.invoices ?? [], [invoicesData]);
    const pagination = invoicesData?.pagination;

    const users = useMemo(() => usersData?.users ?? [], [usersData]);
    const sessions = useMemo(() => {
        const list = sessionsData?.sessions ?? [];
        return list.filter(
            (session, index, array) =>
                array.findIndex((item) => item.sessionId === session.sessionId) === index,
        );
    }, [sessionsData]);

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
        documentTitle: "Recibo",
    });

    const getActionTable = async (action: string, data: InvoiceResponse) => {
        setInvoiceSelected(data);
        if (action === "print") {
            setPrintInvoiceType(undefined);
            setTimeout(() => handlePrint(), 100);
        }
        if (action === "viewPayments") {
            handleOpenPayments(data);
        }
        if (action === "return" || action === "change") {
            setPendingAction(action);
            setPasswordDialogOpen(true);
        }
    }

    const handleConfirmPassword = async (password: string) => {
        const valid = await validatePasswordMutation.mutateAsync(password);
        if (!valid) return;

        if (pendingAction === "return") {
            setPrintInvoiceType('RETURN');
            setReturnDialogOpen(true);
        }
        if (pendingAction === "change") {
            setPrintInvoiceType('CHANGE');
            setChangeDialogOpen(true);
        }

        setPasswordDialogOpen(false);
        setPendingAction(null);
    }

    const handleCancelPassword = () => {
        setPasswordDialogOpen(false);
        setPendingAction(null);
    }

    const invoicePrint: InvoiceData = useMemo(() => {
        if (!invoiceSelected) return EmptyInvoice;
        console.log(printInvoiceType)
        const data: InvoiceData = {
            invoiceNumber: invoiceSelected.invoiceNumber,
            date: formatDate(invoiceSelected.createdAt),
            time: formatOnlyTime(invoiceSelected.createdAt),
            cashier: invoiceSelected.user?.name ?? "--",
            invoiceType: printInvoiceType ? printInvoiceType : (invoiceSelected.status == 'CHANGE' || invoiceSelected.status == 'RETURN' ? invoiceSelected.status : undefined),
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
                reference: "",
                amountBs: p.currency === "BS" ? Number(p.amountReceived) : Number(p.amountNetBs),
                amountUSD: p.currency === "USD" ? Number(p.amountReceived) : 0,
            })),
        };
        return data;
    }, [invoiceSelected, printInvoiceType]);

    const changePagination = (page: number, size: number) => {
        setFilter({ page, size });
    }

    return (
        <div className="w-full">
            <p className="text-2xl font-semibold mb-2 ml-2">Recibos</p>
            <div className="rounded-xl bg-white p-4">
                {/* Filters */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className="w-72">
                            <FilterComponent
                                placeholder="Buscar por # recibo, cliente o cedula..."
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
                                        <SelectItem key={session.id} value={String(session.sessionId)}>
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

            {/* Return Dialog */}
            <ReturnDialog
                open={returnDialogOpen}
                onClose={() => setReturnDialogOpen(false)}
                onPrint={handlePrint}
                invoice={invoiceSelected}
            />

            {/* Change Dialog */}
            <ChangeDialog
                open={changeDialogOpen}
                onClose={() => setChangeDialogOpen(false)}
                onPrint={handlePrint}
                invoice={invoiceSelected}
            />

            {/* Password Dialog */}
            <AlertDialogComponentPasswordSimple
                open={passwordDialogOpen}
                close={() => setPasswordDialogOpen(false)}
                onConfirm={handleConfirmPassword}
                onCancel={handleCancelPassword}
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