import type { ColumnDef } from "@/components/table/TableComponent";
import type { Pagination } from "@/interfaces/base.interface";
import type { ExchangeRate, Product } from "@/interfaces/inventory.interface";
import { inventoryColumns } from "@/pages/inventory/inventory.data";
import { create } from "zustand";

interface InventoryStore {
	search: string;
	pagination: Pagination;
	columns: ColumnDef<Product>[];
	toggle: boolean;
	exchangeRates: ExchangeRate[];
	setSearch: (value: string) => void;
	setPagination: (value: Pagination) => void;
	setColumns: (columns: ColumnDef<Product>[]) => void;
	setExchangeRates: (rates: ExchangeRate[]) => void;
	openForm: () => void;
	closeForm: () => void;
}

export const useInventoryStore = create<InventoryStore>((set) => ({
	search: "",
	pagination: { page: 1, size: 100 },
	columns: inventoryColumns,
	toggle: false,
	exchangeRates: [],
	setSearch: (value) => set({ search: value }),
	setPagination: (value) => set({ pagination: value }),
	setColumns: (columns) => set({ columns }),
	setExchangeRates: (rates) => set({ exchangeRates: rates }),
	openForm: () => set({ toggle: true }),
	closeForm: () => set({ toggle: false }),
}));
