import { Button } from "@/components/ui/button";
import { FilterComponent } from "@/components/table/FilterComponent";
import { IoMdAdd } from "react-icons/io";
import { SelectColumnsComponent, TableComponent } from "@/components/table/TableComponent";
import PageTransitionComponent from "@/components/PageTransition";
import { FaArrowLeft } from "react-icons/fa";
import type { Supplier } from "@/interfaces/suppliers.interface";
import { useState } from "react";
import { suppliersColumns } from "./suppliers.data";
import { useSuppliersQuery } from "./suppliers.hook";
import { SupplierForm, type SupplierFormMode } from "./SupplierForm";

export const Suppliers = () => {
    const [search, setSearch] = useState("");
    const [columns, setColumns] = useState(suppliersColumns);
    const [toggle, setToggle] = useState(false);
    const [mode, setMode] = useState<SupplierFormMode>("create");
    const [supplierSelected, setSupplierSelected] = useState<Supplier | null>(null);

    const { data, isLoading } = useSuppliersQuery(search);
    const suppliers = data?.suppliers ?? [];

    const openCreateForm = () => {
        setMode("create");
        setSupplierSelected(null);
        setToggle(true);
    };

    const openEditForm = (supplier: Supplier) => {
        setMode("edit");
        setSupplierSelected(supplier);
        setToggle(true);
    };

    const handleCloseForm = () => {
        setMode("create");
        setSupplierSelected(null);
        setToggle(false);
    };

    const getActionTable = (action: string, data: Supplier) => {
        if (action === "edit") {
            openEditForm(data);
        }
    };

    return (
        <PageTransitionComponent toggle={toggle}>
            <div>
                <div className="rounded-xl bg-white p-4">
                    <div className="w-full flex items-center justify-between mb-4">
                        <div className="w-96">
                            <FilterComponent placeholder="Buscar proveedor..." onChange={setSearch} loading={isLoading} />
                        </div>
                        <div className="flex items-center gap-2">
                            <SelectColumnsComponent columns={columns} onChange={setColumns} />
                            <Button variant="primary" onClick={openCreateForm}><IoMdAdd /> Agregar Proveedor</Button>
                        </div>
                    </div>

                    <TableComponent
                        onChange={getActionTable}
                        columns={columns.filter((column) => column.visible)}
                        data={suppliers}
                        isLoading={isLoading}
                    />
                </div>
            </div>

            <div>
                <p className="text-2xl font-semibold mb-2 ml-2">
                    <Button variant="ghost" onClick={handleCloseForm}><FaArrowLeft /></Button>
                    {mode === "edit" ? "Editar Proveedor" : "Agregar Proveedor"}
                </p>
                <SupplierForm mode={mode} supplier={supplierSelected} closeForm={handleCloseForm} />
            </div>
        </PageTransitionComponent>
    )
}
