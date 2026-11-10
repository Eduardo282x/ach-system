import type { InvoicesFilter } from "@/interfaces/distpatch.interface";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const defaultInvoicesFilter: InvoicesFilter = {
	page: 1,
	size: 100,
	credit: false,
};

interface InvoicesFilterStore {
	filter: InvoicesFilter;
	setFilter: (filter: InvoicesFilter | ((prev: InvoicesFilter) => InvoicesFilter)) => void;
	resetFilter: () => void;
}

export const useInvoicesFilterStore = create<InvoicesFilterStore>()(
	persist(
		(set) => ({
			filter: { ...defaultInvoicesFilter },
			setFilter: (filter) => set((state) => ({
				filter: typeof filter === "function" ? filter(state.filter) : filter,
			})),
			resetFilter: () => set({ filter: { ...defaultInvoicesFilter } }),
		}),
		{
			name: "invoices-filters",
			version: 1,
			// La paginación siempre vuelve a la primera página al recargar.
			partialize: (state) => ({
				filter: { ...state.filter, page: 1 },
			}),
		},
	),
);
