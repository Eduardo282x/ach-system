import { useState } from "react";
import { FilterComponent } from "@/components/table/FilterComponent";
import { SelectColumnsComponent, TableComponent, type ColumnDef } from "@/components/table/TableComponent";
import { useShiftsQuery } from "@/hooks/shifts.hook";
import type { Shift } from "@/interfaces/shift.interface";
import { shiftsColumns } from "./shifts.data";
import { Button } from "@/components/ui/button";
import { IoMdAdd } from "react-icons/io";

interface ShiftsProps {
	onEdit: (shift: Shift) => void;
	onCreate: () => void;
}

export const Shifts = ({ onEdit, onCreate }: ShiftsProps) => {
	const [columns, setColumns] = useState<ColumnDef<Shift>[]>(shiftsColumns);
	const [filter, setFilter] = useState("");

	const { data, isLoading } = useShiftsQuery();
	const shifts = data?.shifts ?? [];

	const filteredShifts = shifts.filter((shift) =>
		shift.name.toLowerCase().includes(filter.toLowerCase())
	);

	const handleAction = (action: string, row: Shift) => {
		if (action === "edit") {
			onEdit(row);
		}
	};

	return (
		<div className="rounded-xl bg-white p-4">
			<div className="w-full flex items-center justify-between mb-4">
				<div className="w-96">
					<FilterComponent placeholder="Buscar turno..." onChange={setFilter} />
				</div>

				<div className="flex items-center gap-2">
					<SelectColumnsComponent columns={columns} onChange={setColumns} />
					<Button variant="primary" onClick={onCreate}><IoMdAdd /> Agregar Turno</Button>
				</div>
			</div>

			<TableComponent
				onChange={handleAction}
				columns={columns.filter((column) => column.visible)}
				data={isLoading ? [] : filteredShifts}
			/>
		</div>
	);
};
