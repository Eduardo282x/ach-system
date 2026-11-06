import { SelectColumnsComponent, TableComponent } from "@/components/table/TableComponent"
import { inventoryHistoryColumns } from "./historyInventory.data"
import { useState } from "react"
import { useInventoryHistoryQuery } from "@/hooks/inventory.hook";
import type { Pagination } from "@/interfaces/base.interface";
import { DatePickerRange } from "@/components/datePickerRange/DatePickerRange";
import { FilterComponent } from "@/components/table/FilterComponent";
import { type DateRange } from "react-day-picker";
import { formatOnlyDateStringFilter } from "@/helpers/formatters";

export const HistoryInventory = () => {
    const [columns, setColumns] = useState(inventoryHistoryColumns);
    const [filter, setFilter] = useState<Pagination & { search?: string }>({ page: 1, size: 100 });

    const { data, isLoading } = useInventoryHistoryQuery(filter);

    const handleSearch = (value: string) => {
        setFilter((prev) => ({
            ...prev,
            page: 1,
            search: value.trim() || undefined,
        }));
    };

    const getActionTable = () => {

    }

    const changePagination = (page: number, size: number) => {
        setFilter((prev) => ({ ...prev, page, size }));
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
        <div className="h-full min-h-0 flex flex-col">

            <div className="flex flex-1 min-h-0 flex-col">
                <p className="text-2xl font-semibold mb-2 ml-2 shrink-0">Historial de Movimiento del Inventario</p>

                <div className="rounded-xl bg-white p-4 flex flex-1 min-h-0 flex-col">
                    <div className="w-full flex shrink-0 flex-wrap items-center justify-between mb-4 gap-4">
                        <div className="flex flex-1 flex-wrap items-center gap-3">
                            <DatePickerRange onChange={handleChangeDate} display="flex"/>
                            <div className="w-full sm:w-72">
                                <FilterComponent placeholder="Buscar por producto o código..." onChange={handleSearch} loading={isLoading} />
                            </div>
                        </div>

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
                        onPaginationChange={changePagination}
                        fillHeight
                    />
                </div>
            </div>
        </div>
    )
}
