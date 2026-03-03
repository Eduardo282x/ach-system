import { FilterComponent } from "@/components/table/FilterComponent";
import { SelectColumnsComponent, TableComponent } from "@/components/table/TableComponent";
import { useCustomersQuery } from "@/hooks/customers.hook";
import { useCustomersStore } from "@/store/customers.store";

export const Customers = () => {
    const { filter, columns, setFilter, setColumns } = useCustomersStore((state) => state);
    const { data, isLoading } = useCustomersQuery(filter);
    const customers = data?.clients ?? [];

    return (
        <div className="w-full">
            <p className="text-2xl font-semibold mb-2 ml-2">Clientes</p>

            <div className="rounded-xl bg-white p-4">
                <div className="w-full flex items-center justify-between mb-4">
                    <FilterComponent placeholder="Buscar cliente..." onChange={setFilter} />
                    <SelectColumnsComponent columns={columns} onChange={setColumns} />
                </div>

                <TableComponent
                    onChange={() => undefined}
                    columns={columns.filter((column) => column.visible)}
                    data={isLoading ? [] : customers}
                />
            </div>
        </div>
    )
}
