import type { ColumnDef } from "@/components/table/TableComponent";
import { formatDate, formatNumberWithDecimal, translateCurrency } from "@/helpers/formatters";
import type { Product } from "@/interfaces/inventory.interface";
import { GoPencil } from "react-icons/go";
import { FaRegTrashCan } from "react-icons/fa6";

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
        header: 'Presentación',
        key: 'presentation',
        width: '12rem',
        element: (row) => `${row.presentation.trim() === '' ? '-' : row.presentation}`,
        visible: true,
    },
    {
        header: 'N° Serie',
        key: 'serialNumber',
        width: '12rem',
        element: (row) => `${row.serialNumber.trim() === '' ? '-' : row.serialNumber}`,
        visible: true,
    },
    {
        header: 'N° Lote',
        key: 'lote',
        width: '12rem',
        element: (row) => `${row.lote.trim() === '' ? '-' : row.lote}`,
        visible: true,
    },
    {
        header: 'Marca',
        key: 'brand',
        width: '12rem',
        element: (row) => `${row.brand.trim() === '' ? '-' : row.brand}`,
        visible: true,
    },
    {
        header: 'Tipo',
        key: 'type',
        width: '12rem',
        element: (row) => `${row.type.trim() === '' ? '-' : row.type}`,
        visible: true,
    },
    {
        header: 'Descripción',
        key: 'description',
        width: '12rem',
        element: (row) => `${row.description.trim() === '' ? '-' : row.description}`,
        visible: true,
    },
    {
        header: 'Cantidad',
        key: 'stock',
        width: '8rem',
        element: (row) => (row.stock ?? 0).toString(),
        visible: true,
    },
    {
        header: 'Precio',
        key: 'price',
        width: '8rem',
        element: (row) => `${formatNumberWithDecimal(row.price)} ${translateCurrency(row.currency)}`,
        visible: true,
    },
    {
        header: 'Creación',
        key: 'createdAt',
        width: '8rem',
        element: (row) => row.createdAt ? formatDate(row.createdAt) : '-',
        visible: false,
    },
    {
        header: 'Acciones',
        key: 'id',
        width: '8rem',
        element: () => '',
        visible: true,
        icons: () => [
            {
                label:'Editar',
                icon: GoPencil,
                action: 'edit',
                variant: 'primary',
            },
            {
                label:'Eliminar',
                icon: FaRegTrashCan,
                action: 'delete',
                variant: 'error',
            },
        ]
    }
];