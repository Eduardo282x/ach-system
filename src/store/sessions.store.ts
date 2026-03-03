import type { SessionFilter } from "@/interfaces/sessions.interface";
import { create } from "zustand";

interface SessionsStore {
	filter: Partial<SessionFilter>;
	setFilter: (filter: Partial<SessionFilter>) => void;
	updateFilter: (filter: Partial<SessionFilter>) => void;
	clearFilter: () => void;
}

export const useSessionsStore = create<SessionsStore>((set) => ({
	filter: {},
	setFilter: (filter) => set({ filter }),
	updateFilter: (filter) => set((state) => ({ filter: { ...state.filter, ...filter } })),
	clearFilter: () => set({ filter: {} }),
}));
