import { formatOnlyDateStringFilter } from "@/helpers/formatters";
import type { ResumenFilter } from "@/interfaces/distpatch.interface";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const createDefaultFilter = (): ResumenFilter => ({
	date: formatOnlyDateStringFilter(new Date()),
	sessionId: undefined,
	cashDrawerId: undefined,
	shiftId: undefined,
});

interface CashClosingFilterStore {
	filter: ResumenFilter;
	setFilter: (filter: ResumenFilter | ((prev: ResumenFilter) => ResumenFilter)) => void;
	resetFilter: () => void;
}

export const useCashClosingFilterStore = create<CashClosingFilterStore>()(
	persist(
		(set) => ({
			filter: createDefaultFilter(),
			setFilter: (filter) => set((state) => ({
				filter: typeof filter === "function" ? filter(state.filter) : filter,
			})),
			resetFilter: () => set({ filter: createDefaultFilter() }),
		}),
		{
			name: "cash-closing-filters",
			version: 1,
			partialize: (state) => ({ filter: state.filter }),
		},
	),
);
