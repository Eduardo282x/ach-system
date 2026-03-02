import { Button } from "@/components/ui/button"
import { FilterComponent } from "@/components/table/FilterComponent";
import { getInventoryApi } from "@/services/inventory.service";
import { useEffect, useState } from "react";
import { IoMdAdd } from "react-icons/io";
import { inventoryColumns, type InventoryData } from "./inventory.data";
import { SelectColumnsComponent, TableComponent, type ColumnDef } from "@/components/table/TableComponent";
import type { Product } from "@/interfaces/inventory.interface";
import PageTransitionComponent from "@/components/PageTransition";

export const Inventory = () => {
    const [filter, setFilter] = useState('');
    const [columns, setColumns] = useState<ColumnDef<Product>[]>(inventoryColumns);
    const [toggle, setToggle] = useState<boolean>(false)
    const [products, setProducts] = useState<InventoryData>({
        allInventory: [],
        inventory: []
    });

    const getProductsApi = async () => {
        await getInventoryApi().then((result) => {
            setProducts({
                allInventory: result.products,
                inventory: result.products,
            });
        }).catch((error) => {
            console.log(error);
        });
    }

    // const filterProducts = (value: string) => {
    //     const filtered = products.allInventory.filter((product) => {
    //         return product.name.toLowerCase().includes(value.toLowerCase()) || product.barcode.toLowerCase().includes(value.toLowerCase());
    //     });
    //     setProducts({
    //         ...products,
    //         inventory: filtered
    //     });
    // }

    useEffect(() => {
        getProductsApi();
    }, []);

    const openForm = () => {
        setToggle(true);
    }

    const closeForm = () => {
        setToggle(false);
    }

    useEffect(() => {
        // filterProducts(filter);
    }, [filter]);

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
                                <Button variant="primary" onClick={openForm}><IoMdAdd /> Agregar Producto</Button>
                            </div>
                        </div>

                        <TableComponent
                            columns={columns.filter(column => column.visible)}
                            data={products.inventory}
                        />
                    </div>
                </div>

                <div>
                    <p className="text-2xl font-semibold mb-2 ml-2">Agregar Producto</p>
                    <Button variant="primary" onClick={closeForm}><IoMdAdd /> Volver</Button>
                </div>
            </PageTransitionComponent>


        </div>
    )
}
