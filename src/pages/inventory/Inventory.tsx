import { Button } from "@/components/ui/button"
import { FilterComponent } from "@/components/table/FilterComponent";
import { IoMdAdd } from "react-icons/io";
import { SelectColumnsComponent, TableComponent } from "@/components/table/TableComponent";
import PageTransitionComponent from "@/components/PageTransition";
import { useInventoryStore } from "@/store/inventory.store";
import { useDeleteProductMutation, useInventoryQuery } from "@/hooks/inventory.hook";
import { FaArrowLeft } from "react-icons/fa";
import { ProductForm, type ProductFormMode } from "./ProductForm";
import type { Product } from "@/interfaces/inventory.interface";
import { useState } from "react";
import { AlertDialogComponent } from "@/components/dialog/AlertDialogComponent";

export const Inventory = () => {
    const {
        filter,
        columns,
        toggle,
        setFilter,
        setColumns,
        openForm,
        closeForm
    } = useInventoryStore((state) => state);

    const { data, isLoading } = useInventoryQuery(filter);
    const [productSelected, setProductSelected] = useState<Product | null>(null);
    const [formMode, setFormMode] = useState<ProductFormMode>("create");
    const products = data?.products ?? [];
    const [openDialog, setOpenDialog] = useState(false);

    const deleteProductMutation = useDeleteProductMutation();

    const getActionTable = async (action: string, data: Product) => {
        if (action === "edit") {
            setFormMode("edit");
            setProductSelected(data);
            openForm();
        }
        if (action === "delete") {
            setProductSelected(data);
            setOpenDialog(true);
        }
        if (action === "addDetail") {
            setFormMode("addDetail");
            setProductSelected(data);
            openForm();
            console.log("Add Detail", data);
        }
    }

    const deleteProduct = () => {
        if (productSelected) {
            deleteProductMutation.mutate(productSelected.id);
        }
        setOpenDialog(false);
    }

    const openCreateForm = () => {
        setFormMode("create");
        setProductSelected(null);
        openForm();
    };

    const handleCloseForm = () => {
        setFormMode("create");
        setProductSelected(null);
        closeForm();
    };

    return (
        <div className="w-full">

            <PageTransitionComponent toggle={toggle}>
                <div>
                    <p className="text-2xl font-semibold mb-2 ml-2">Inventario</p>

                    <div className="rounded-xl bg-white p-4">
                        <div className="w-full flex items-center justify-between mb-4">
                            <FilterComponent placeholder="Buscar producto..." onChange={setFilter} />

                            <div className="flex items-center gap-2">
                                <SelectColumnsComponent columns={columns} onChange={setColumns} />
                                <Button variant="primary" onClick={openCreateForm}><IoMdAdd /> Agregar Producto</Button>
                            </div>
                        </div>

                        <TableComponent
                            onChange={getActionTable}
                            columns={columns.filter(column => column.visible)}
                            data={isLoading ? [] : products}
                        />
                    </div>
                </div>

                <div>
                    <p className="text-2xl font-semibold mb-2 ml-2">
                        <Button variant="ghost" onClick={handleCloseForm}><FaArrowLeft /></Button>
                        Agregar Producto
                    </p>

                    <ProductForm product={productSelected} mode={formMode} closeForm={handleCloseForm} />
                </div>
            </PageTransitionComponent>

            <AlertDialogComponent
                title="Eliminar Producto"
                description="¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer."
                open={openDialog}
                close={() => setOpenDialog(false)}
                onConfirm={() => {
                    deleteProduct();
                }}
                onCancel={() => setOpenDialog(false)}
            />
        </div>
    )
}
