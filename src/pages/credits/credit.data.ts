import type { ColumnDef } from "@/components/table/TableComponent";
import { formatDate, formatNumberWithDecimal } from "@/helpers/formatters";
import type { InvoiceResponse } from "@/interfaces/distpatch.interface";
import { getStatusColor, getStatusLabel } from "../invoices/invoices.data";
import { LuPrinter } from "react-icons/lu";
import { MdPayments } from "react-icons/md";

export const creditInvoiceColumns: ColumnDef<InvoiceResponse>[] = [
    {
        key: 'invoiceNumber',
        header: '# Factura',
        width: '8rem',
        element: (row) => `#${row.invoiceNumber}`,
        visible: true,
    },
    {
        key: 'customer',
        header: 'Cliente',
        width: '12rem',
        element: (row) => row.customer?.fullName ?? '--',
        visible: true,
    },
    {
        key: 'user',
        header: 'Cajero',
        element: (row) => row.user?.name ?? '--',
        visible: true,
    },
    {
        key: 'session',
        header: 'Caja',
        element: (row) => row.session.cashDrawer.name ?? '--',
        visible: true,
    },
    {
        key: 'totalAmountBs',
        header: 'Total (Bs)',
        element: (row) => `${formatNumberWithDecimal(row.totalAmountBs)} Bs`,
        visible: true,
    },
    {
        key: 'totalAmountUsd',
        header: 'Total (USD)',
        element: (row) => `${formatNumberWithDecimal(row.totalAmountUsd)} $`,
        visible: true,
    },
    {
        key: 'status',
        header: 'Estado',
        element: (row) => getStatusLabel(row.status),
        visible: true,
        class: (row) => `text-center rounded-full w-20 text-sm ${getStatusColor(row.status)}`,
    },
    {
        key: 'createdAt',
        header: 'Fecha',
        element: (row) => formatDate(row.createdAt) || '--',
        visible: true,
    },
    {
        header: 'Acciones',
        key: 'id',
        width: '8rem',
        element: () => '',
        visible: true,
        icons: () => [
            {
                label: 'Saldar Deuda',
                icon: MdPayments ,
                action: 'pay',
                variant: 'secondary',
            },
            {
                label: 'Reimprimir',
                icon: LuPrinter,
                action: 'print',
                variant: 'primary',
            }
        ]
    }
];