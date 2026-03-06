import type { ColumnDef } from "@/components/table/TableComponent";
import { formatDateWithTime, formatNumberWithDecimal, translateCurrency } from "@/helpers/formatters";
import type { HistoryInventory, MovementType } from "@/interfaces/inventory.interface";

export const inventoryHistoryColumns: ColumnDef<HistoryInventory>[] = [
    {
        header: 'Código',
        key: 'product',
        element: (row) => row.product.barcode,
        width: '12rem',
        visible: true,
    },
    {
        header: 'Producto',
        key: 'product',
        width: '30rem',
        element: (row) => `${row.product.name} ${row.product.presentation ? `- ${row.product.presentation}` : ''}`,
        visible: true,
    },
    {
        header: 'Cantidad',
        key: 'quantity',
        width: '8rem',
        element: (row) => row.quantity.toString(),
        visible: true,
    },
    {
        header: 'Precio',
        key: 'product',
        width: '8rem',
        element: (row) => `${formatNumberWithDecimal(row.product.price)} ${translateCurrency(row.product.currency)}`,
        visible: true,
    },
    {
        header: 'Tipo de Movimiento',
        key: 'type',
        width: '8rem',
        element: (row) => translateMovementType(row.type),
        visible: true,
    },
    {
        header: 'Razon',
        key: 'reason',
        width: '8rem',
        element: (row) => row.reason,
        visible: true,
    },
    {
        header: 'Fecha',
        key: 'createdAt',
        width: '8rem',
        element: (row) => formatDateWithTime(row.createdAt),
        visible: true,
    },
];

const translateMovementType = (type: MovementType) => {
    switch (type) {
        case 'ADJUSTMENT':
            return 'Ajuste';
        case 'CONVERSION':
            return 'Conversión';
        case 'RESTOCK':
            return 'Reabastecimiento';
        case 'RETURN':
            return 'Devolución';
        case 'SALE':
            return 'Venta';
        default:
            return type;
    }
}