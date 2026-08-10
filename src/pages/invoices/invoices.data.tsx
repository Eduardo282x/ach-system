import type { ColumnDef } from "@/components/table/TableComponent";
import { formatDate, formatNumberWithDecimal } from "@/helpers/formatters";
import type { InvoiceResponse, Item } from "@/interfaces/distpatch.interface";
import { LuCreditCard, LuPrinter, LuRepeat, LuUndo2 } from "react-icons/lu";
import type { InvoiceData } from "../dispatch/PrintInvoice";

export const invoiceColumns: ColumnDef<InvoiceResponse>[] = [
    {
        key: 'invoiceNumber',
        header: '# Recibo',
        width: '8rem',
        element: (row) => (
            <div className="flex items-center gap-2">
                <span>#{row.invoiceNumber}</span>
                {row.originalInvoice && (
                    <span
                        title={`Origen del cambio: #${row.originalInvoice.invoiceNumber}`}
                        className="rounded px-1.5 py-0.5 text-xs text-blue-800 bg-blue-100"
                    >
                        # {row.originalInvoice.invoiceNumber}
                    </span>
                )}
            </div>
        ),
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
        element: (row) => row.session?.cashDrawer?.name ?? '--',
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
        icons: (row) => [
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
            ...(row.status === 'PAID'
                ? [
                    {
                        label: 'Devolución',
                        icon: LuUndo2,
                        action: 'return',
                        variant: 'secondary' as const,
                    },
                    {
                        label: 'Cambio',
                        icon: LuRepeat,
                        action: 'change',
                        variant: 'outline' as const,
                    },
                ]
                : []),
        ]
    }
];

const getStatusLabel = (status: string) => {
    switch (status) {
        case "PAID": return "Pagada";
        case "PENDING": return "Pendiente";
        case "CANCELLED": return "Cancelada";
        case "RETURN": return "Devuelta";
        case "CHANGE": return "Cambio";
        default: return status;
    }
};

const getStatusColor = (status: string) => {
    switch (status) {
        case "PAID": return "text-green-800 bg-green-100";
        case "PENDING": return "text-yellow-800 bg-yellow-100";
        case "CANCELLED": return "text-red-800 bg-red-100";
        case "RETURN": return "text-purple-800 bg-purple-100";
        case "CHANGE": return "text-blue-800 bg-blue-100";
        default: return "text-gray-800 bg-gray-100";
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