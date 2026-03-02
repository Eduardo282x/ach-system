import type { ColumnDef } from "@/components/table/TableComponent";
import type { Product } from "@/interfaces/inventory.interface";
import { inventoryColumns } from "@/pages/inventory/inventory.data";
import { create } from "zustand";

interface InventoryStore {
	filter: string;
	columns: ColumnDef<Product>[];
	toggle: boolean;
	setFilter: (value: string) => void;
	setColumns: (columns: ColumnDef<Product>[]) => void;
	openForm: () => void;
	closeForm: () => void;
}

export const useInventoryStore = create<InventoryStore>((set) => ({
	filter: "",
	columns: inventoryColumns,
	toggle: false,
	setFilter: (value) => set({ filter: value }),
	setColumns: (columns) => set({ columns }),
	openForm: () => set({ toggle: true }),
	closeForm: () => set({ toggle: false }),
}));
