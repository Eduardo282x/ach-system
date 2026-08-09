/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { FilterComponent } from "@/components/table/FilterComponent";
import { formatNumberWithDecimal, translateCurrency } from "@/helpers/formatters";
import { useCreateChangeMutation } from "@/hooks/dispatch.hook";
import { useInventoryQuery } from "@/hooks/inventory.hook";
import { useAuthStore } from "@/store/auth.store";
import { useInventoryStore } from "@/store/inventory.store";
import type { InvoiceResponse, ReturnCondition, ReturnItemBody } from "@/interfaces/distpatch.interface";
import type { Product, ExchangeRateType } from "@/interfaces/inventory.interface";
import { FaRegTrashCan } from "react-icons/fa6";
import toast from "react-hot-toast";

interface ChangeDialogProps {
    open: boolean;
    onClose: () => void;
    invoice: InvoiceResponse | null;
}

interface ReturnedItemSelection {
    invoiceItemId: number;
    productName: string;
    quantity: string;
    condition: ReturnCondition;
}

interface ReplacementLine {
    productId: number;
    name: string;
    price: string;
    currency: ExchangeRateType;
    stock: number;
    quantity: string;
}

const normalizeDecimalInput = (value: string) => {
    const sanitized = value.replace(/[^0-9.]/g, '');
    const [integerPart, ...decimalParts] = sanitized.split('.');
    if (decimalParts.length === 0) {
        return integerPart;
    }
    return `${integerPart}.${decimalParts.join('')}`;
};

export const ChangeDialog = ({ open, onClose, invoice }: ChangeDialogProps) => {
    return (
        <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
            {open && invoice && (
                <ChangeDialogContent key={invoice.id} invoice={invoice} onClose={onClose} />
            )}
        </Dialog>
    );
};

const ChangeDialogContent = ({
    invoice,
    onClose,
}: {
    invoice: InvoiceResponse;
    onClose: () => void;
}) => {
    const createChangeMutation = useCreateChangeMutation();
    const cashDrawerSession = useAuthStore((state) => state.cashDrawerSession);
    const exchangeRates = useInventoryStore((state) => state.exchangeRates);

    const [returnedItems, setReturnedItems] = useState<ReturnedItemSelection[]>(() =>
        invoice.items.map((item) => ({
            invoiceItemId: item.id,
            productName: item.product?.name ?? '--',
            quantity: String(item.quantity),
            condition: 'GOOD',
        })),
    );
    const [replacementItems, setReplacementItems] = useState<ReplacementLine[]>([]);
    const [reason, setReason] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const searchContainerRef = useRef<HTMLDivElement | null>(null);

    const { data: productsData } = useInventoryQuery(searchTerm);

    const totalReturned = useMemo(() => {
        return returnedItems.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);
    }, [returnedItems]);

    const hasReplacementItems = replacementItems.length > 0;

    const totalReplacementUsd = useMemo(() => {
        return replacementItems.reduce((acc, item) => {
            return acc + Number(item.price) * (Number(item.quantity) || 0);
        }, 0);
    }, [replacementItems]);

    const totalReplacementBs = useMemo(() => {
        return replacementItems.reduce((acc, item) => {
            const rate = exchangeRates.find((r) => r.currency === item.currency)?.rate ?? 1;
            return acc + Number(item.price) * (Number(item.quantity) || 0) * rate;
        }, 0);
    }, [replacementItems, exchangeRates]);

    const handleAddReplacement = (product: Product) => {
        if (product.stock <= 0) return;

        setReplacementItems((prev) => {
            const existing = prev.find((item) => item.productId === product.id);
            if (existing) {
                return prev.map((item) =>
                    item.productId === product.id
                        ? { ...item, quantity: String((Number(item.quantity) || 0) + 1) }
                        : item,
                );
            }
            return [
                ...prev,
                {
                    productId: product.id,
                    name: product.name,
                    price: product.price,
                    currency: product.currency,
                    stock: product.stock,
                    quantity: '1',
                },
            ];
        });

        setSearchTerm('');
    };

    const handleReplacementQuantityChange = (productId: number, value: string) => {
        setReplacementItems((prev) =>
            prev.map((item) =>
                item.productId === productId
                    ? { ...item, quantity: normalizeDecimalInput(value) }
                    : item,
            ),
        );
    };

    const handleRemoveReplacement = (productId: number) => {
        setReplacementItems((prev) => prev.filter((item) => item.productId !== productId));
    };

    const handleReturnedQuantityChange = (invoiceItemId: number, value: string) => {
        setReturnedItems((prev) =>
            prev.map((item) =>
                item.invoiceItemId === invoiceItemId
                    ? { ...item, quantity: normalizeDecimalInput(value) }
                    : item,
            ),
        );
    };

    const handleConditionChange = (invoiceItemId: number, condition: ReturnCondition) => {
        setReturnedItems((prev) =>
            prev.map((item) =>
                item.invoiceItemId === invoiceItemId
                    ? { ...item, condition }
                    : item,
            ),
        );
    };

    const handleSubmit = () => {
        if (totalReturned <= 0) {
            toast.error('Debe seleccionar al menos un producto devuelto');
            return;
        }

        if (!reason.trim()) {
            toast.error('Debe indicar el motivo del cambio');
            return;
        }

        if (!hasReplacementItems) {
            toast.error('Debe agregar al menos un producto de reemplazo');
            return;
        }

        const sessionId = cashDrawerSession ? Number(cashDrawerSession) : 0;
        if (!sessionId) {
            toast.error('No hay sesión/cajero seleccionado para registrar el cambio');
            return;
        }

        const returnedItemsBody: ReturnItemBody[] = returnedItems
            .filter((item) => Number(item.quantity) > 0)
            .map((item) => ({
                invoiceItemId: item.invoiceItemId,
                quantity: Number(item.quantity),
                condition: item.condition,
            }));

        const replacementItemsBody = replacementItems
            .filter((item) => Number(item.quantity) > 0)
            .map((item) => ({
                productId: item.productId,
                quantity: Number(item.quantity),
            }));

        if (replacementItemsBody.length === 0) {
            toast.error('Debe indicar cantidades válidas en los productos de reemplazo');
            return;
        }

        const usdRate = exchangeRates.find((rate) => rate.currency === 'USD');
        const eurRate = exchangeRates.find((rate) => rate.currency === 'EUR');

        createChangeMutation.mutate(
            {
                invoiceId: invoice.id,
                reason: reason.trim(),
                returnedItems: returnedItemsBody,
                replacementItems: replacementItemsBody,
                sessionId,
                exchangeRateUsdId: usdRate?.id,
                exchangeRateEurId: eurRate?.id,
            },
            {
                onSuccess: (response: any) => {
                    if (!response?.success) {
                        toast.error(response?.message || 'No se pudo registrar el cambio');
                        return;
                    }
                    toast.success(response?.message || 'Cambio registrado correctamente');
                    onClose();
                },
                onError: () => {
                    toast.error('Ocurrió un error al registrar el cambio');
                },
            },
        );
    };

    return (
        <DialogContent className="max-w-5xl">
            <DialogHeader>
                <DialogTitle>Cambio - Factura #{invoice.invoiceNumber}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center justify-between rounded-md bg-muted/50 p-3">
                        <span className="text-muted-foreground">Cliente:</span>
                        <span className="font-medium">{invoice.customer?.fullName ?? '--'}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-md bg-muted/50 p-3">
                        <span className="text-muted-foreground">Total factura:</span>
                        <span className="font-medium">
                            {formatNumberWithDecimal(invoice.totalAmountBs)} Bs
                        </span>
                    </div>
                    <div className="flex items-center justify-between rounded-md bg-muted/50 p-3">
                        <span className="text-muted-foreground">Sesión:</span>
                        <span className="font-medium">#{cashDrawerSession || '--'}</span>
                    </div>
                </div>

                <div>
                    <Label className="mb-2 block">Productos devueltos</Label>
                    <div className="space-y-2">
                        {returnedItems.map((item) => (
                            <div key={item.invoiceItemId} className="flex items-center justify-between rounded-md border p-2">
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium">{item.productName}</p>
                                    <p className="text-xs text-muted-foreground">
                                        Vendida: {invoice.items.find((it) => it.id === item.invoiceItemId)?.quantity ?? 0}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1">
                                        <Label className="text-xs">Cant.</Label>
                                        <Input
                                            type="text"
                                            inputMode="decimal"
                                            className="w-20"
                                            value={item.quantity}
                                            onChange={(e) => handleReturnedQuantityChange(item.invoiceItemId, e.target.value)}
                                        />
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Label className="text-xs">Buen estado</Label>
                                        <Switch
                                            checked={item.condition === 'GOOD'}
                                            onCheckedChange={(checked) =>
                                                handleConditionChange(item.invoiceItemId, checked ? 'GOOD' : 'DEFECTIVE')
                                            }
                                        />
                                    </div>
                                    <p className="w-20 text-xs text-muted-foreground">
                                        {item.condition === 'GOOD' ? 'Reintegrar a stock' : 'Defectuoso'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Motivo del cambio</Label>
                    <textarea
                        className="min-h-20 w-full rounded-md border-2 border-gray-300 px-3 py-2 text-sm outline-none focus-visible:border-ring"
                        placeholder="Indique el motivo del cambio"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />
                </div>

                <Separator />

                <div>
                    <Label className="mb-2 block">Productos de reemplazo</Label>
                    <div className="relative" ref={searchContainerRef}>
                        <FilterComponent
                            placeholder="Buscar producto de reemplazo..."
                            onChange={setSearchTerm}
                        />
                        {searchTerm !== '' && (
                            <div className="absolute top-10 left-0 z-10 w-full rounded-md border-2 border-gray-300 bg-white shadow-md">
                                {(productsData?.products ?? []).length > 0 ? (
                                    (productsData?.products ?? []).map((product) => (
                                        <div
                                            key={product.id}
                                            onClick={() => product.stock > 0 && handleAddReplacement(product)}
                                            className={`flex items-center justify-between p-2 text-sm border-b last:border-0 hover:bg-gray-100 ${
                                                product.stock === 0 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                                            }`}
                                        >
                                            <div>
                                                <p className="font-semibold">{product.name} - {product.presentation}</p>
                                                <p>
                                                    Precio: {formatNumberWithDecimal(product.price)} {translateCurrency(product.currency)}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-500">Stock: {product.stock}</p>
                                                <p className="text-xs text-gray-500">{product.barcode}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="p-4 text-center text-gray-500">No se encontraron productos</p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="mt-3 space-y-2">
                        {replacementItems.length === 0 ? (
                            <p className="rounded-md bg-muted/50 p-4 text-center text-sm text-muted-foreground">
                                No hay productos de reemplazo agregados
                            </p>
                        ) : (
                            replacementItems.map((item) => (
                                <div key={item.productId} className="flex items-center justify-between rounded-md border p-2">
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">{item.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatNumberWithDecimal(item.price)} {translateCurrency(item.currency)} · Stock: {item.stock}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1">
                                            <Label className="text-xs">Cant.</Label>
                                            <Input
                                                type="text"
                                                inputMode="decimal"
                                                className="w-20"
                                                value={item.quantity}
                                                onChange={(e) => handleReplacementQuantityChange(item.productId, e.target.value)}
                                            />
                                        </div>
                                        <Button variant="destructive" size="icon-sm" onClick={() => handleRemoveReplacement(item.productId)}>
                                            <FaRegTrashCan />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {hasReplacementItems && (
                        <div className="mt-3 flex items-center justify-between rounded-md bg-muted/50 p-3 text-sm">
                            <span className="text-muted-foreground">Total reemplazo:</span>
                            <span className="font-semibold">
                                {formatNumberWithDecimal(totalReplacementBs)} Bs · {formatNumberWithDecimal(totalReplacementUsd)} $
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <DialogFooter>
                <Button variant="outline" type="button" onClick={onClose}>
                    Cancelar
                </Button>
                <Button
                    variant="primary"
                    type="button"
                    onClick={handleSubmit}
                    disabled={createChangeMutation.isPending}
                >
                    {createChangeMutation.isPending ? 'Procesando...' : 'Registrar Cambio'}
                </Button>
            </DialogFooter>
        </DialogContent>
    );
};
