import { FilterComponent } from "@/components/table/FilterComponent";
import { SelectColumnsComponent, TableComponent } from "@/components/table/TableComponent";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCustomersQuery } from "@/hooks/customers.hook";
import { useCustomersStore, type CustomersTab } from "@/store/customers.store";
import { Suppliers } from "./Suppliers";

export const Customers = () => {
    const { filter, columns, activeTab, setFilter, setColumns, setActiveTab } = useCustomersStore((state) => state);
    const { data, isLoading } = useCustomersQuery(filter);
    const customers = data?.clients ?? [];

    return (
        <div className="w-full">
            <div className="flex items-center gap-4 ml-2 mb-2">
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as CustomersTab)}>
                    <TabsList>
                        <TabsTrigger value="clientes">Clientes</TabsTrigger>
                        <TabsTrigger value="proveedores">Proveedores</TabsTrigger>
                    </TabsList>
                </Tabs>
                <p className="text-2xl font-semibold">
                    {activeTab === "clientes" ? "Clientes" : "Proveedores"}
                </p>
            </div>

            {activeTab === "clientes" ? (
                <div className="rounded-xl bg-white p-4">
                    <div className="w-full flex items-center justify-between mb-4">
                        <div className="w-96">
                            <FilterComponent placeholder="Buscar cliente..." onChange={setFilter} />
                        </div>
                        <SelectColumnsComponent columns={columns} onChange={setColumns} />
                    </div>

                    <TableComponent
                        onChange={() => undefined}
                        columns={columns.filter((column) => column.visible)}
                        data={customers}
                        isLoading={isLoading}
                    />
                </div>
            ) : (
                <Suppliers />
            )}
        </div>
    )
}
