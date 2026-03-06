import { SelectColumnsComponent, TableComponent } from "@/components/table/TableComponent"
import { inventoryHistoryColumns } from "./historyInventory.data"
import { useState } from "react"
import { useInventoryHistoryQuery } from "@/hooks/inventory.hook";
import type { Pagination } from "@/interfaces/base.interface";
import { DatePickerRange } from "@/components/datePickerRange/DatePickerRange";
import { type DateRange } from "react-day-picker";
import { formatOnlyDateStringFilter } from "@/helpers/formatters";

export const HistoryInventory = () => {
    const [columns, setColumns] = useState(inventoryHistoryColumns);
    const [filter, setFilter] = useState<Pagination>({ page: 1, size: 100 });

    const { data, isLoading } = useInventoryHistoryQuery(filter);

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
                        <DatePickerRange onChange={handleChangeDate} display="flex"/>

                        <div className="flex items-center gap-2">
                            <SelectColumnsComponent columns={columns} onChange={setColumns} />
                        </div>
                    </div>

                    <TableComponent
                        onChange={getActionTable}
                        columns={columns.filter(column => column.visible)}
                        pagination={data?.pagination}
                        totalElements={data?.pagination?.total}
                        data={isLoading ? [] : data?.history || []}
                    />
                </div>
            </div>
        </div>
    )
}
