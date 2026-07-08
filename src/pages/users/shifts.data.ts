import type { ColumnDef } from "@/components/table/TableComponent";
import type { Shift } from "@/interfaces/shift.interface";
import { formatDate } from "@/helpers/formatters";
import { GoPencil } from "react-icons/go";
import { FaRegTrashCan } from "react-icons/fa6";

export const shiftsColumns: ColumnDef<Shift>[] = [
	{
		header: "Nombre",
		key: "name",
		width: "w-1/4",
		element: (row: Shift) => row.name,
		visible: true,
	},
	{
		header: "Hora Inicio",
		key: "startTime",
		width: "w-1/6",
		element: (row: Shift) => row.startTime,
		visible: true,
	},
	{
		header: "Hora Fin",
		key: "endTime",
		width: "w-1/6",
		element: (row: Shift) => row.endTime,
		visible: true,
	},
	{
		header: "Activo",
		key: "active",
		width: "w-1/6",
		element: (row: Shift) => (row.active ? "Activo" : "Inactivo"),
		class: (row: Shift) => row.active
			? "bg-green-100 text-green-700 rounded-full px-2 py-1 text-xs font-medium text-center"
			: "bg-red-100 text-red-700 rounded-full px-2 py-1 text-xs font-medium text-center",
		visible: true,
	},
	{
		header: "Creacion",
		key: "createdAt",
		width: "w-1/6",
		element: (row: Shift) => formatDate(row.createdAt),
		visible: false,
	},
	{
		header: "Acciones",
		key: "id",
		width: "w-1/6",
		element: () => "",
		visible: true,
		icons: () => [
			{
				label: "Editar",
				icon: GoPencil,
				action: "edit",
				variant: "primary",
			},
			{
				label: "Eliminar",
				icon: FaRegTrashCan,
				action: "delete",
				variant: "error",
			},
		],
	},
];
