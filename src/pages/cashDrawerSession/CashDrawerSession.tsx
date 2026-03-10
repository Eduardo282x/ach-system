import { DatePickerRange } from '@/components/datePickerRange/DatePickerRange';
import { SelectColumnsComponent, TableComponent, type ColumnDef } from '@/components/table/TableComponent';
import { formatOnlyDateStringFilter } from '@/helpers/formatters';
import { useSessionsQuery } from '@/hooks/sessions.hook';
import type { Pagination } from '@/interfaces/base.interface';
import { useState } from 'react'
import type { DateRange } from 'react-day-picker';
import type { Session } from '@/interfaces/sessions.interface';
import { cashDrawerSessionColumns } from './cashDrawerSession.data';

export const CashDrawerSession = () => {
    const [columns, setColumns] = useState<ColumnDef<Session>[]>(cashDrawerSessionColumns);
    const [filter, setFilter] = useState<Pagination>({ page: 1, size: 100 });

    const { data, isLoading } = useSessionsQuery(filter);

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

    return (
        <div>

            <div>
                <p className="text-2xl font-semibold mb-2 ml-2">Historial de Movimiento del Inventario</p>

                <div className="rounded-xl bg-white p-4">
                    <div className="w-full flex items-center justify-between mb-4">
                        <DatePickerRange onChange={handleChangeDate} display="flex" />

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
