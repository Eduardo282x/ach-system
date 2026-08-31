import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TableComponent, type ColumnDef } from "@/components/table/TableComponent";
import { formatNumberWithDecimal, translateCurrency } from "@/helpers/formatters";
import { useProductSearchQuery } from "@/hooks/inventory.hook";
import type { Product } from "@/interfaces/inventory.interface";
import { LuPackageSearch } from "react-icons/lu";
import { useInventoryStore } from "@/store/inventory.store";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";

const columnsBase: ColumnDef<Product>[] = [
    {
        header: 'Código',
        key: 'barcode',
        element: (row) => row.barcode,
        width: '12rem',
        visible: true,
    },
    {
        header: 'Producto',
        key: 'name',
        width: '20rem',
        element: (row) => row.name,
        visible: true,
    },
    {
        header: 'Cantidad',
        key: 'stock',
        width: '8rem',
        element: (row) => (row.stock ?? row.quantity ?? 0).toString(),
        visible: true,
    },
    {
        header: 'Precio USD',
        key: 'price',
        width: '8rem',
        element: (row) => `${formatNumberWithDecimal(row.price)} ${translateCurrency(row.currency)}`,
        visible: true,
    },
];

interface ProductPriceDialogProps {
    open: boolean;
    onClose: () => void;
}

export const ProductPriceDialog = ({ open, onClose }: ProductPriceDialogProps) => {
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const exchangeRates = useInventoryStore((state) => state.exchangeRates);
    const bcvRate = exchangeRates ? exchangeRates.find((rate) => rate.currency === 'USD') : undefined;

    const columns: ColumnDef<Product>[] = [...columnsBase, {
        header: 'Precio Bs',
        key: 'priceBs',
        width: '8rem',
        element: (row) => `${formatNumberWithDecimal(Number(row.price) * Number(bcvRate ? bcvRate.rate : 0))} ${translateCurrency(row.currency)}`,
        visible: true,
        class: () => 'text-right'
    }];

    const { data, isLoading } = useProductSearchQuery(debouncedSearch);

    useEffect(() => {
        const timeout = setTimeout(() => setDebouncedSearch(search), 300);
        return () => clearTimeout(timeout);
    }, [search]);

    useEffect(() => {
        if (!open) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSearch('');
            setDebouncedSearch('');
        }
    }, [open]);

    const handleOpenChange = (value: boolean) => {
        if (!value) {
            onClose();
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="!w-2xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Consultar Precio</DialogTitle>
                    <DialogDescription>
                        Busca un producto por nombre o código de barras.
                    </DialogDescription>
                </DialogHeader>

                <InputGroup>
                    <InputGroupInput
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Buscar por nombre o código de barras..."
                        className="pl-10"
                        autoFocus
                    />
                    <InputGroupAddon>
                        <LuPackageSearch />
                    </InputGroupAddon>
                </InputGroup>

                {debouncedSearch.trim().length === 0 ? (
                    <div className="h-[50vh] flex flex-col items-center justify-center gap-2 py-16 text-center text-muted-foreground">
                        <LuPackageSearch className="size-10" />
                        <p className="text-sm">Escribe el nombre o código de barras de un producto para consultar su precio.</p>
                    </div>
                ) : (
                    <div className="h-[50vh] max-h-[50vh] overflow-auto">
                        <TableComponent
                            columns={columns}
                            data={data?.products ?? []}
                            isLoading={isLoading}
                            onChange={() => { }}
                            ignorePagination
                            automaticHeight
                        />
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}