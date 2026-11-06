import { Button } from "@/components/ui/button"
import { FilterComponent } from "@/components/table/FilterComponent";
import { IoMdAdd } from "react-icons/io";
import { SelectColumnsComponent, TableComponent } from "@/components/table/TableComponent";
import PageTransitionComponent from "@/components/PageTransition";
import { useInventoryStore } from "@/store/inventory.store";
import { useBreakDownProductMutation, useDeleteProductMutation, useInventoryQueryLocal } from "@/hooks/inventory.hook";
import { FaArrowLeft } from "react-icons/fa";
import { ProductForm, type ProductFormMode } from "./ProductForm";
import type { Product } from "@/interfaces/inventory.interface";
import { useState } from "react";
import { DownloadAndUploadProducts } from "./DownloadAndUploadProducts";
import { InventoryEntries } from "./InventoryEntries";
import { InventoryEntryForm } from "./InventoryEntryForm";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialogComponentAdminPassword } from "@/components/dialog/AlertDialogComponent";
import toast from 'react-hot-toast';


export const Inventory = () => {
    const {
        search,
        pagination,
        columns,
        toggle,
        activeTab,
        formType,
        setSearch,
        setPagination,
        setColumns,
        setActiveTab,
        setFormType,
        openForm,
        closeForm
    } = useInventoryStore((state) => state);

    const { data, isLoading } = useInventoryQueryLocal(search, pagination);
    const [productSelected, setProductSelected] = useState<Product | null>(null);
    const [formMode, setFormMode] = useState<ProductFormMode>("create");
    const products = data?.products ?? [];
    const [openDialog, setOpenDialog] = useState(false);

    const deleteProductMutation = useDeleteProductMutation();
    const breakDownProductMutation = useBreakDownProductMutation();

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
        if (action === "breakdown") {
            await breakDownProductMutation.mutateAsync(data.id);
        }
        if (action === "addDetail") {
            const findParent = products.find((product) => product.parentId === data.id);
            if (findParent) {
                toast.error("No se puede agregar un detalle a un producto que ya tiene un detalle.", {
                    duration: 1500,
                    position: 'top-right'
                });
                return;
            }
            setFormMode("addDetail");
            setProductSelected(data);
            openForm();
        }
    }

    const changePagination = (page: number, size: number) => {
        setPagination({ page, size });
    }

    const deleteProduct = (password: string) => {
        if (productSelected) {
            deleteProductMutation.mutate({ id: productSelected.id, password });
        }
        setOpenDialog(false);
    }

    const openCreateForm = () => {
        setFormMode("create");
        setProductSelected(null);
        setFormType("inventory");
        openForm();
    };

    const handleCloseForm = () => {
        setFormMode("create");
        setProductSelected(null);
        setFormType("inventory");
        closeForm();
    };

    const handleTabChange = (value: string) => {
        setActiveTab(value as "inventory" | "entries");
    };

    return (
        <div className="w-full h-full min-h-0">

            <PageTransitionComponent toggle={toggle}>
                <div className="h-full min-h-0 flex flex-col">
                    <div className="flex shrink-0 items-center gap-4 ml-2 mb-2">
                        <Tabs value={activeTab} onValueChange={handleTabChange}>
                            <TabsList>
                                <TabsTrigger value="inventory">Inventario</TabsTrigger>
                                <TabsTrigger value="entries">Entrada de inventario</TabsTrigger>
                            </TabsList>
                        </Tabs>
                        <p className="text-2xl font-semibold">
                            {activeTab === "inventory" ? "Inventario" : "Entrada de inventario"}
                        </p>
                    </div>

                    {activeTab === "inventory" ? (
                        <div className="rounded-xl bg-white p-4 flex flex-1 min-h-0 flex-col">
                            <div className="w-full flex shrink-0 flex-wrap items-center justify-between gap-3 mb-4">
                                <div className="w-full sm:w-96">
                                    <FilterComponent placeholder="Buscar producto..." onChange={setSearch} loading={isLoading} />
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <DownloadAndUploadProducts/>
                                    <SelectColumnsComponent columns={columns} onChange={setColumns} />
                                    <Button variant="primary" onClick={openCreateForm}><IoMdAdd /> Agregar Producto</Button>
                                </div>
                            </div>

                            <TableComponent
                                onChange={getActionTable}
                                columns={columns.filter(column => column.visible)}
                                data={products}
                                isLoading={isLoading}
                                fillHeight
                                pagination={data?.pagination}
                                totalElements={data?.pagination?.total}
                                onPaginationChange={changePagination}
                            />
                        </div>
                    ) : (
                        <InventoryEntries />
                    )}
                </div>

                <div>
                    {formType === "inventory" ? (
                        <>
                            <p className="text-2xl font-semibold mb-2 ml-2">
                                <Button variant="ghost" onClick={handleCloseForm}><FaArrowLeft /></Button>
                                Agregar Producto
                            </p>

                            <ProductForm  isFull={false} product={productSelected} mode={formMode} closeForm={handleCloseForm} />
                        </>
                    ) : (
                        <>
                            <p className="text-2xl font-semibold mb-2 ml-2">
                                <Button variant="ghost" onClick={handleCloseForm}><FaArrowLeft /></Button>
                                Agregar Entrada de Inventario
                            </p>

                            <InventoryEntryForm closeForm={handleCloseForm} />
                        </>
                    )}
                </div>
            </PageTransitionComponent>

            <AlertDialogComponentAdminPassword
                title="Eliminar Producto"
                description="¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer."
                open={openDialog}
                close={() => setOpenDialog(false)}
                onConfirm={(password) => {
                    deleteProduct(password);
                }}
                onCancel={() => setOpenDialog(false)}
            />
        </div>
    )
}