import type { ColumnDef } from "@/components/table/TableComponent";
import { formatNumberWithDots } from "@/helpers/formatters";
import type { Client } from "@/interfaces/customer.interface";

export const customersColumns: ColumnDef<Client>[] = [
	{
		header: "Cédula / RIF",
		key: "identify",
		width: "14rem",
		element: (row) => formatNumberWithDots(row.identify, '', '', true),
		visible: true,
	},
	{
		header: "Nombre Completo",
		key: "fullName",
		width: "24rem",
		element: (row) => row.fullName,
		visible: true,
	},
	{
		header: "Teléfono",
		key: "phone",
		width: "14rem",
		element: (row) => row.phone,
		visible: true,
	},
];
