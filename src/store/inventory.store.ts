import type { ColumnDef } from "@/components/table/TableComponent";
import type { ExchangeRate, Product } from "@/interfaces/inventory.interface";
import { inventoryColumns } from "@/pages/inventory/inventory.data";
import { create } from "zustand";

interface InventoryStore {
	filter: string;
	columns: ColumnDef<Product>[];
	toggle: boolean;
	exchangeRates: ExchangeRate[];
	setFilter: (value: string) => void;
	setColumns: (columns: ColumnDef<Product>[]) => void;
	setExchangeRates: (rates: ExchangeRate[]) => void;
	openForm: () => void;
	closeForm: () => void;
}

export const useInventoryStore = create<InventoryStore>((set) => ({
	filter: "",
	columns: inventoryColumns,
	toggle: false,
	exchangeRates: [],
	setFilter: (value) => set({ filter: value }),
	setColumns: (columns) => set({ columns }),
	setExchangeRates: (rates) => set({ exchangeRates: rates }),
	openForm: () => set({ toggle: true }),
	closeForm: () => set({ toggle: false }),
}));
