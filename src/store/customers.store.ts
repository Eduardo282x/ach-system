import type { ColumnDef } from "@/components/table/TableComponent";
import type { Client } from "@/interfaces/customer.interface";
import { customersColumns } from "@/pages/customers/customers.data";
import { create } from "zustand";

export type CustomersTab = "clientes" | "proveedores";

interface CustomersStore {
	filter: string;
	columns: ColumnDef<Client>[];
	activeTab: CustomersTab;
	setFilter: (value: string) => void;
	setColumns: (columns: ColumnDef<Client>[]) => void;
	setActiveTab: (tab: CustomersTab) => void;
}

export const useCustomersStore = create<CustomersStore>((set) => ({
	filter: "",
	columns: customersColumns,
	activeTab: "clientes",
	setFilter: (value) => set({ filter: value }),
	setColumns: (columns) => set({ columns }),
	setActiveTab: (tab) => set({ activeTab: tab }),
}));
