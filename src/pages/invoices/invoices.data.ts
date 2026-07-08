import type { ColumnDef } from "@/components/table/TableComponent";
import { formatDate, formatNumberWithDecimal } from "@/helpers/formatters";
import type { InvoiceResponse, Item } from "@/interfaces/distpatch.interface";
import { LuCreditCard, LuPrinter } from "react-icons/lu";
import type { InvoiceData } from "../dispatch/PrintInvoice";

export const invoiceColumns: ColumnDef<InvoiceResponse>[] = [
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
                label: 'Reimprimir',
                icon: LuPrinter,
                action: 'print',
                variant: 'primary',
            },
            {
                label: 'Ver Pagos',
                icon: LuCreditCard,
                action: 'viewPayments',
                variant: 'outline',
            },
        ]
    }
];

const getStatusLabel = (status: string) => {
    switch (status) {
        case "PAID": return "Pagada";
        case "PENDING": return "Pendiente";
        case "CANCELLED": return "Cancelada";
        default: return status;
    }
};

const getStatusColor = (status: string) => {
    switch (status) {
        case "PAID": return "border-2 border-green-600 text-green-600 bg-green-50";
        case "PENDING": return "border-2 border-yellow-600 text-yellow-600 bg-yellow-50";
        case "CANCELLED": return "border-2 border-red-600 text-red-600 bg-red-50";
        default: return "border-2 border-gray-600 text-gray-600 bg-gray-50";
    }
};

export const EmptyInvoice: InvoiceData = {
    invoiceNumber: '',
    date: '',
    cashier: '',
    customer: {
        fullName: '',
        identify: '',
        phone: '',
    },
    payments: [],
    productsList: [],
    time: '',
    totals: {
        totalBs: 0,
        totalUSD: 0,
    }
}

export const invoiceDetailsColumns: ColumnDef<Item>[] = [
    {
        key: 'product',
        header: 'Producto',
        width: 'w-28',
        element: (row) => row.product?.name ?? '--',
        visible: true,
    },
    {
        key: 'unitPrice',
        header: 'Precio Unitario',
        width: 'w-44',
        element: (row) => formatNumberWithDecimal(row.unitPrice) || '--',
        visible: true,
    },
    {
        key: 'quantity',
        header: 'Cantidad',
        width: 'w-36',
        element: (row) => String(row.quantity),
        visible: true,
    },
    {
        key: 'subtotal',
        header: 'Subtotal',
        width: 'w-32',
        element: (row) => formatNumberWithDecimal(row.subtotal) || '--',
        visible: true,
    }
];