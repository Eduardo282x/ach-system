import { useCallback, useMemo, useRef, useState } from "react";
import { useInvoicesQuery, usePayInvoiceCreditMutation } from "@/hooks/dispatch.hook";
import { useShiftsQuery } from "@/hooks/shifts.hook";
import type { InvoicesFilter, InvoiceResponse } from "@/interfaces/distpatch.interface";
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

import { formatDate, formatOnlyTime } from "@/helpers/formatters";
import { PrintInvoice, type InvoiceData } from "../dispatch/PrintInvoice";
import { useReactToPrint } from "react-to-print";
import type { DateRange } from "react-day-picker";
import { TableComponent } from "@/components/table/TableComponent";
import { EmptyInvoice } from "../invoices/invoices.data";
import { InvoiceDetail } from "../invoices/Invoices";
import { creditInvoiceColumns } from "./credit.data";
import { PayCreditDialog } from "./PayCreditDialog";

export const Credits = () => {
    const [filter, setFilter] = useState<InvoicesFilter>({
        page: 1,
        size: 100,
        credit: true,
    });

    const componentRef = useRef<HTMLDivElement>(null);

    const { data: invoicesData, isLoading } = useInvoicesQuery(filter);
    const { data: shiftsData } = useShiftsQuery();

    const payInvoiceCreditMutation = usePayInvoiceCreditMutation();

    const invoices = useMemo(() => invoicesData?.invoices ?? [], [invoicesData]);
    const pagination = invoicesData?.pagination;

    const shifts = useMemo(() => shiftsData?.shifts ?? [], [shiftsData]);

    const handleSearch = useCallback((value: string) => {
        setFilter((prev) => ({ ...prev, search: value || undefined, page: 1 }));
    }, []);

    const [invoiceSelected, setInvoiceSelected] = useState<InvoiceResponse | null>(null);
    const [openPayDialog, setOpenPayDialog] = useState(false);

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

    const handleShiftChange = useCallback((value: string) => {
        setFilter((prev) => ({
            ...prev,
            shiftId: value === "all" ? undefined : Number(value),
            page: 1,
        }));
    }, []);

    // const toggleRow = useCallback((invoiceId: number) => {
    //     setExpandedRow((prev) => (prev === invoiceId ? null : invoiceId));
    // }, []);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: "Factura",
    });

    const getActionTable = async (action: string, data: InvoiceResponse) => {
        setInvoiceSelected(data);
        if (action === "print") {
            setTimeout(() => handlePrint(), 100);
        }
        if (action === "pay") {
            setOpenPayDialog(true);
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
            <p className="text-2xl font-semibold mb-2 ml-2">Recibos</p>
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
                    columns={creditInvoiceColumns}
                    data={invoices}
                    isLoading={isLoading}
                    isExpansible={true}
                    pagination={pagination}
                    totalElements={pagination?.total}
                    renderRow={(item, index) => (
                        <InvoiceDetail key={index} invoice={item} />
                    )}
                />
            </div>

            {/* Hidden PrintInvoice */}
            <div className="hidden">
                <PrintInvoice ref={componentRef} data={invoicePrint} />
            </div>

            <PayCreditDialog
                open={openPayDialog}
                invoice={invoiceSelected}
                onConfirm={() => {
                    if (invoiceSelected) {
                        payInvoiceCreditMutation.mutate(invoiceSelected.id);
                    }
                    setOpenPayDialog(false);
                }}
                onCancel={() => setOpenPayDialog(false)}
            />
        </div>
    );
};