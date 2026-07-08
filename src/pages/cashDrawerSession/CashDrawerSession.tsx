import { DatePickerRange } from '@/components/datePickerRange/DatePickerRange';
import { SelectColumnsComponent, TableComponent, type ColumnDef } from '@/components/table/TableComponent';
import { formatOnlyDateStringFilter } from '@/helpers/formatters';
import { useSessionsQuery } from '@/hooks/sessions.hook';
import { useShiftsQuery } from '@/hooks/shifts.hook';
import type { Pagination } from '@/interfaces/base.interface';
import { useState } from 'react'
import type { DateRange } from 'react-day-picker';
import type { Session } from '@/interfaces/sessions.interface';
import { cashDrawerSessionColumns } from './cashDrawerSession.data';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const CashDrawerSession = () => {
    const [columns, setColumns] = useState<ColumnDef<Session>[]>(cashDrawerSessionColumns);
    const [filter, setFilter] = useState<Pagination & { shiftId?: number }>({ page: 1, size: 100 });

    const { data, isLoading } = useSessionsQuery(filter);
    const { data: shiftsData } = useShiftsQuery();
    const shifts = shiftsData?.shifts ?? [];

    const getActionTable = () => {

    }

    const handleChangeDate = (date: DateRange | undefined) => {
        if (date?.from && date?.to) {
            setFilter((prev) => ({
                ...prev,
                page: 1,
                startDate: formatOnlyDateStringFilter(date.from),
                endDate: formatOnlyDateStringFilter(date.to),
            }));
        } else {
            setFilter((prev) => ({
                ...prev,
                page: 1,
                startDate: undefined,
                endDate: undefined,
            }));
        }
    }

    const handleShiftChange = (shiftId: string) => {
        if (shiftId === 'all') {
            setFilter((prev) => {
                const { shiftId: _, ...rest } = prev;
                return rest;
            });
            return;
        }
        setFilter((prev) => ({
            ...prev,
            shiftId: parseInt(shiftId),
        }));
    }

    return (
        <div>

            <div>
                <p className="text-2xl font-semibold mb-2 ml-2">Historial de Movimiento del Inventario</p>

                <div className="rounded-xl bg-white p-4">
                    <div className="w-full flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4 w-full ">
                            <div className="">
                                <DatePickerRange onChange={handleChangeDate} display="block" />
                            </div>
                            <div className="flex flex-col gap-3 ">
                                <Label>Turno</Label>
                                <Select
                                    value={filter.shiftId?.toString() ?? 'all'}
                                    onValueChange={handleShiftChange}
                                >
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="Seleccione un turno" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="all">Todos</SelectItem>
                                            {shifts.map((shift) => (
                                                <SelectItem key={shift.id} value={shift.id.toString()}>{shift.name}</SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <SelectColumnsComponent columns={columns} onChange={setColumns} />
                        </div>
                    </div>

                    <TableComponent
                        onChange={getActionTable}
                        columns={columns.filter(column => column.visible)}
                        totalElements={data?.sessions.length || 0}
                        data={isLoading ? [] : data?.sessions || []}
                    />
                </div>
            </div>
        </div>
    )
}
