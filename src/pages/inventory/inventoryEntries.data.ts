import type { ColumnDef } from "@/components/table/TableComponent";
import { formatDate, formatDateWithTime, formatNumberWithDecimal } from "@/helpers/formatters";
import type { InventoryEntry } from "@/interfaces/inventory.interface";

export const inventoryEntriesColumns: ColumnDef<InventoryEntry>[] = [
    {
        header: 'N° Control',
        key: 'controlNumber',
        width: '10rem',
        element: (row) => row.controlNumber,
        visible: true,
    },
    {
        header: 'Título',
        key: 'title',
        width: '14rem',
        element: (row) => row.title,
        visible: true,
    },
    {
        header: 'Descripción',
        key: 'description',
        width: '18rem',
        element: (row) => row.description || '-',
        visible: true,
    },
    {
        header: 'Productos',
        key: 'products',
        width: '8rem',
        element: (row) => row.inventoryEntryDetails.length.toString(),
        visible: true,
    },
    {
        header: 'Total',
        key: 'total',
        width: '8rem',
        element: (row) => {
            const total = row.inventoryEntryDetails.reduce((acc, detail) => acc + Number(detail.subtotal), 0);
            return `$${formatNumberWithDecimal(total)}`;
        },
        visible: true,
    },
    {
        header: 'Fecha',
        key: 'date',
        width: '8rem',
        element: (row) => formatDate(row.date),
        visible: true,
    },
    {
        header: 'Creado',
        key: 'createdAt',
        width: '10rem',
        element: (row) => formatDateWithTime(row.createdAt),
        visible: false,
    },
];