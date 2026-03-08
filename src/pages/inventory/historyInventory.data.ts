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
        class: (row) => `${styleClassQuantity(row.quantity)} rounded-full px-2 text-center`,
        visible: true,
    },
    {
        header: 'Precio',
        key: 'product',
        width: '8rem',
        element: (row) => `${formatNumberWithDecimal(row.product.price)} ${translateCurrency(row.product.currency)}`,
        visible: false,
    },
    {
        header: 'Tipo de Movimiento',
        key: 'type',
        width: '8rem',
        element: (row) => translateMovementType(row.type),
        class: (row) => `${styleClassType(row.type)} px-2 rounded-full text-center`,
        visible: true,
    },
    {
        header: 'Razon',
        key: 'reason',
        width: '8rem',
        element: (row) => row.reason,
        class: (row) => `${styleClassType(row.type)} px-2 rounded-full`,
        visible: true,
    },
    {
        header: 'Fecha',
        key: 'createdAt',
        width: '8rem',
        element: (row) => formatDateWithTime(row.createdAt),
        visible: false,
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

const styleClassQuantity = (quantity: number) => {
    if (quantity > 0) {
        return 'text-green-600 bg-green-100';
    } else if (quantity < 0) {
        return 'text-red-600 bg-red-100';
    } else {
        return 'text-gray-600 bg-gray-100';
    }
}

const styleClassType = (type: MovementType) => {
    switch (type) {
        case 'ADJUSTMENT':
            return 'bg-yellow-100 text-yellow-800';
        case 'CONVERSION':
            return 'bg-blue-100 text-blue-800';
        case 'RESTOCK':
            return 'bg-red-100 text-red-800';
        case 'RETURN':
            return 'bg-purple-100 text-purple-800';
        case 'SALE':
            return 'bg-green-100 text-green-800';
        default:
            return '';
    }
}