import type { ColumnDef } from "@/components/ui/table/TableComponent";
import { formatDate, formatNumberWithDecimal } from "@/helpers/formatters";
import type { Product } from "@/interfaces/inventory.interface";
import { GoPencil } from "react-icons/go";
import { FaRegTrashCan } from "react-icons/fa6";

export interface InventoryData {
    allInventory: Product[];
    inventory: Product[];
}


export const inventoryColumns: ColumnDef<Product>[] = [
    {
        header: 'Código',
        key: 'barcode',
        element: (row) => row.barcode,
        width: '12rem',
        visible: true,
    },
    {
        header: 'Producto',
        key: 'name',
        width: '30rem',
        element: (row) => row.name,
        visible: true,
    },
    {
        header: 'Detallado',
        key: 'isDetail',
        width: '8rem',
        element: (row) => row.isDetail ? 'Sí' : 'No',
        visible: true,
    },
    {
        header: 'Cantidad',
        key: 'stock',
        width: '8rem',
        element: (row) => row.stock.toString(),
        visible: true,
    },
    {
        header: 'Precio',
        key: 'price',
        width: '8rem',
        element: (row) => `${formatNumberWithDecimal(row.price)} ${row.currency === 'USD' ? '$' : '€'}`,
        visible: true,
    },
    {
        header: 'Creación',
        key: 'createdAt',
        width: '8rem',
        element: (row) => formatDate(row.createdAt),
        visible: false,
    },
    {
        header: 'Acciones',
        key: 'id',
        width: '8rem',
        element: () => '',
        visible: true,
        icons: [
            {
                icon: GoPencil,
                action: 'edit',
                variant: 'primary',
            },
            {
                icon: FaRegTrashCan,
                action: 'delete',
                variant: 'error',
            },
        ]
    }
];