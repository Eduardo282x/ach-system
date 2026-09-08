import type { ColumnDef, IconColumn } from "@/components/table/TableComponent";
import { formatNumberWithDots } from "@/helpers/formatters";
import type { Supplier } from "@/interfaces/suppliers.interface";
import { GoPencil } from "react-icons/go";

export const suppliersColumns: ColumnDef<Supplier>[] = [
	{
		header: "Cédula / RIF",
		key: "identify",
		width: "14rem",
		element: (row) => formatNumberWithDots(row.identify, '', '', true),
		visible: true,
	},
	{
		header: "Nombre",
		key: "name",
		width: "24rem",
		element: (row) => row.name,
		visible: true,
	},
	{
		header: "Teléfono",
		key: "phone",
		width: "14rem",
		element: (row) => row.phone,
		visible: true,
	},
	{
		header: "Dirección",
		key: "address",
		width: "14rem",
		element: (row) => row.address,
		visible: true,
	},
	{
		header: "Acciones",
		key: "id",
		width: "8rem",
		element: () => '',
		visible: true,
		icons: () => addBtnAction(),
	},
];

const addBtnAction = (): IconColumn[] => {
	return [
		{
			label: 'Editar',
			icon: GoPencil,
			action: 'edit',
			variant: 'primary',
		},
	];
}
