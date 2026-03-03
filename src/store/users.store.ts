import type { ColumnDef } from "@/components/table/TableComponent";
import type { User } from "@/interfaces/users.interface";
import { usersColumns } from "@/pages/users/users.data";
import { create } from "zustand";

interface UsersStore {
	filter: string;
	columns: ColumnDef<User>[];
	toggle: boolean;
	setFilter: (value: string) => void;
	setColumns: (columns: ColumnDef<User>[]) => void;
	openForm: () => void;
	closeForm: () => void;
}

export const useUsersStore = create<UsersStore>((set) => ({
	filter: "",
	columns: usersColumns,
	toggle: false,
	setFilter: (value) => set({ filter: value }),
	setColumns: (columns) => set({ columns }),
	openForm: () => set({ toggle: true }),
	closeForm: () => set({ toggle: false }),
}));
