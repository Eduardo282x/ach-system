import { useMemo, useState } from "react";
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

const timeToMinutes = (time: string) => {
	const [hours, minutes] = time.split(':').map(Number);
	return hours * 60 + minutes;
};

const formatMinutes = (minutes: number) => {
	const hours = Math.floor(minutes / 60);
	const mins = minutes % 60;
	return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

const getCoverageGaps = (shifts: Shift[]) => {
	const covered = new Array(1440).fill(false);

	for (const shift of shifts) {
		const start = timeToMinutes(shift.startTime);
		const end = timeToMinutes(shift.endTime);

		if (start === end) {
			continue;
		}

		if (end < start) {
			for (let minute = start; minute < 1440; minute++) covered[minute] = true;
			for (let minute = 0; minute < end; minute++) covered[minute] = true;
		} else {
			for (let minute = start; minute < end; minute++) covered[minute] = true;
		}
	}

	const gaps: Array<{ start: number; end: number }> = [];
	let gapStart: number | null = null;

	for (let minute = 0; minute <= 1440; minute++) {
		const isGap = minute < 1440 && !covered[minute];

		if (isGap && gapStart === null) {
			gapStart = minute;
		}

		if (!isGap && gapStart !== null) {
			gaps.push({ start: gapStart, end: minute });
			gapStart = null;
		}
	}

	return gaps;
};

export const Shifts = ({ onEdit, onCreate }: ShiftsProps) => {
	const [columns, setColumns] = useState<ColumnDef<Shift>[]>(shiftsColumns);
	const [filter, setFilter] = useState("");

	const { data, isLoading } = useShiftsQuery();
	const shifts = data?.shifts ?? [];

	const filteredShifts = shifts.filter((shift) =>
		shift.name.toLowerCase().includes(filter.toLowerCase())
	);

	const coverage = useMemo(() => {
		const activeShifts = shifts.filter((shift) => shift.active);
		const gaps = getCoverageGaps(activeShifts);

		return {
			activeShifts,
			gaps,
			hasFullCoverage: activeShifts.length > 0 && gaps.length === 0,
		};
	}, [shifts]);

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

			<div className={`mb-4 rounded-md border px-4 py-3 text-sm ${coverage.hasFullCoverage ? 'border-green-200 bg-green-50 text-green-800' : 'border-yellow-200 bg-yellow-50 text-yellow-800'}`}>
				{coverage.activeShifts.length === 0 ? (
					<p>No hay turnos activos. Configure turnos para cubrir las 24 horas.</p>
				) : coverage.hasFullCoverage ? (
					<p>Los turnos activos cubren las 24 horas del día.</p>
				) : (
					<div>
						<p className="font-semibold">Hay espacios sin turno activo durante el día:</p>
						<p>
							{coverage.gaps
								.map((gap) => `${formatMinutes(gap.start)} - ${formatMinutes(gap.end)}`)
								.join(', ')}
						</p>
					</div>
				)}
			</div>

			<TableComponent
				onChange={handleAction}
				columns={columns.filter((column) => column.visible)}
				data={isLoading ? [] : filteredShifts}
			/>
		</div>
	);
};
