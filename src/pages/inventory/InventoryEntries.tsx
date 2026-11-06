import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FilterComponent } from "@/components/table/FilterComponent";
import { SelectColumnsComponent, TableComponent } from "@/components/table/TableComponent";
import { IoMdAdd } from "react-icons/io";
import { useState } from "react";
import { inventoryEntriesColumns } from "./inventoryEntries.data";
import { useInventoryEntriesQuery } from "@/hooks/inventory.hook";
import { useInventoryStore } from "@/store/inventory.store";
import type { Pagination } from "@/interfaces/base.interface";
import type { InventoryEntry } from "@/interfaces/inventory.interface";
import { formatNumberWithDecimal } from "@/helpers/formatters";
import { DownloadAndUploadProducts } from "./DownloadAndUploadProducts";

export const InventoryEntries = () => {
    const { setFormType, openForm } = useInventoryStore((state) => state);

    const [columns, setColumns] = useState(inventoryEntriesColumns);
    const [pagination, setPagination] = useState<Pagination & { search?: string }>({ page: 1, size: 100 });

    const { data, isLoading } = useInventoryEntriesQuery(pagination);
    const entries = data?.inventoryEntries ?? [];

    const changePagination = (page: number, size: number) => {
        setPagination((prev) => ({ ...prev, page, size }));
    };

    const changeSearch = (value: string) => {
        setPagination((prev) => ({ ...prev, search: value.trim() || undefined, page: 1 }));
    };

    const openCreateForm = () => {
        setFormType("entry");
        openForm();
    };

    const renderDetails = (entry: InventoryEntry) => {
        return (
            <div className="bg-white rounded-md border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                    <p className="font-semibold text-gray-700">Productos de la Entrada</p>
                    <p className="text-sm font-medium text-gray-600">
                        N° Control: <span className="font-semibold">{entry.controlNumber}</span>
                    </p>
                </div>

                <Table noMaxHeight={true}>
                    <TableHeader className="shadow-md">
                        <TableRow>
                            <TableHead>Código</TableHead>
                            <TableHead>Producto</TableHead>
                            <TableHead className="text-right">Cantidad</TableHead>
                            <TableHead className="text-right">Precio Compra</TableHead>
                            <TableHead className="text-right">Precio Venta</TableHead>
                            <TableHead className="text-right">Subtotal</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {entry.inventoryEntryDetails.map((detail) => (
                            <TableRow key={detail.id} className="bg-muted">
                                <TableCell>{detail.product.barcode}</TableCell>
                                <TableCell>
                                    {detail.product.name}
                                    {detail.product.presentation && ` - ${detail.product.presentation}`}
                                </TableCell>
                                <TableCell className="text-right">{detail.quantity}</TableCell>
                                <TableCell className="text-right">{formatNumberWithDecimal(detail.unitPrice)}</TableCell>
                                <TableCell className="text-right">{formatNumberWithDecimal(detail.salePrice ?? 0)}</TableCell>
                                <TableCell className="text-right font-semibold">{formatNumberWithDecimal(detail.subtotal)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        );
    };

    return (
        <div>
            <div className="rounded-xl bg-white p-4">
                <div className="w-full flex items-center justify-between mb-4">
                    <div className="w-96">
                        <FilterComponent placeholder="Buscar por control o título..." onChange={changeSearch} loading={isLoading} />
                    </div>

                    <div className="flex items-center gap-2">
                        <DownloadAndUploadProducts />
                        <SelectColumnsComponent columns={columns} onChange={setColumns} />
                        <Button variant="primary" onClick={openCreateForm}><IoMdAdd /> Agregar Entrada</Button>
                    </div>
                </div>

                <TableComponent
                    onChange={() => { }}
                    columns={columns.filter(column => column.visible)}
                    data={isLoading ? [] : entries}
                    isLoading={isLoading}
                    pagination={data?.pagination}
                    totalElements={data?.pagination?.total}
                    onPaginationChange={changePagination}
                    isExpansible
                    automaticHeight
                    renderRow={renderDetails}
                />
            </div>
        </div>
    );
}