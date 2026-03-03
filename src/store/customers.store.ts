import type { ColumnDef } from "@/components/table/TableComponent";
import type { Client } from "@/interfaces/customer.interface";
import { customersColumns } from "@/pages/customers/customers.data";
import { create } from "zustand";

interface CustomersStore {
	filter: string;
	columns: ColumnDef<Client>[];
	setFilter: (value: string) => void;
	setColumns: (columns: ColumnDef<Client>[]) => void;
}

export const useCustomersStore = create<CustomersStore>((set) => ({
	filter: "",
	columns: customersColumns,
	setFilter: (value) => set({ filter: value }),
	setColumns: (columns) => set({ columns }),
}));
