import type { ColumnDef, IconColumn } from "@/components/table/TableComponent";
import { formatDate, formatNumberWithDecimal, translateCurrency } from "@/helpers/formatters";
import type { Product } from "@/interfaces/inventory.interface";
import { GoPencil } from "react-icons/go";
import { FaRegTrashCan } from "react-icons/fa6";
import { IoCubeOutline } from "react-icons/io5";

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
        header: 'Presentacion',
        key: 'presentation',
        width: '12rem',
        element: (row) => `${row.presentation.trim() === '' ? '-' : row.presentation}`,
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
        element: (row) => (row.stock ?? 0).toString(),
        visible: true,
    },
    {
        header: 'Cantidad Detallada',
        key: 'unitsDetail',
        width: '8rem',
        element: (row) => (row.unitsDetail ?? 0).toString(),
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
        icons: (row) => addBtnAction(row),
    }
];

const addBtnAction = (row: Product): IconColumn[] => {
    const actions: IconColumn[] = []
    if (row.isDetail) {
        actions.push({
            label: 'Cargar y descargar',
            icon: IoCubeOutline,
            action: 'breakdown',
            variant: 'outline',
        })
    }

    actions.push(
        {
            label: 'Editar',
            icon: GoPencil,
            action: 'edit',
            variant: 'primary',
        },
        {
            label: 'Eliminar',
            icon: FaRegTrashCan,
            action: 'delete',
            variant: 'error',
        });


    return actions;
}