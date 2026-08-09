import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { formatNumberWithDecimal } from "@/helpers/formatters";
import { useCreateReturnMutation } from "@/hooks/dispatch.hook";
import { useDispatchStore } from "@/store/dispatch.store";
import type { InvoiceResponse, RefundPaymentBody, ReturnCondition, ReturnItemBody } from "@/interfaces/distpatch.interface";
import toast from "react-hot-toast";

interface ReturnDialogProps {
    open: boolean;
    onClose: () => void;
    invoice: InvoiceResponse | null;
}

interface ItemSelection {
    invoiceItemId: number;
    productName: string;
    quantity: string;
    condition: ReturnCondition;
}

const normalizeDecimalInput = (value: string) => {
    const sanitized = value.replace(/[^0-9.]/g, '');
    const [integerPart, ...decimalParts] = sanitized.split('.');
    if (decimalParts.length === 0) {
        return integerPart;
    }
    return `${integerPart}.${decimalParts.join('')}`;
};

export const ReturnDialog = ({ open, onClose, invoice }: ReturnDialogProps) => {
    return (
        <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
            {open && invoice && (
                <ReturnDialogContent key={invoice.id} invoice={invoice} onClose={onClose} />
            )}
        </Dialog>
    );
};

const ReturnDialogContent = ({
    invoice,
    onClose,
}: {
    invoice: InvoiceResponse;
    onClose: () => void;
}) => {
    const createReturnMutation = useCreateReturnMutation();
    const typesPayments = useDispatchStore((state) => state.typesPayments);

    const [items, setItems] = useState<ItemSelection[]>(() =>
        invoice.items.map((item) => ({
            invoiceItemId: item.id,
            productName: item.product?.name ?? '--',
            quantity: String(item.quantity),
            condition: 'GOOD',
        })),
    );
    const [reason, setReason] = useState("");
    const [refundUsd, setRefundUsd] = useState("");
    const [refundBs, setRefundBs] = useState("");

    const devolutionPayments = useMemo(
        () => typesPayments.filter((type) => type.name.toLowerCase().includes('devoluci')),
        [typesPayments],
    );

    const usdPayment = useMemo(
        () => devolutionPayments.find((type) => type.currency === 'USD'),
        [devolutionPayments],
    );

    const bsPayment = useMemo(
        () => devolutionPayments.find((type) => type.currency === 'BS'),
        [devolutionPayments],
    );

    const totalSelected = useMemo(() => {
        return items.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);
    }, [items]);

    const totalRefundUsd = useMemo(() => {
        const usd = Number(refundUsd);
        return Number.isFinite(usd) && usd > 0 ? usd : 0;
    }, [refundUsd]);

    const totalRefundBs = useMemo(() => {
        const bs = Number(refundBs);
        return Number.isFinite(bs) && bs > 0 ? bs : 0;
    }, [refundBs]);

    const hasSelectedItems = totalSelected > 0;
    const hasRefund = totalRefundUsd > 0 || totalRefundBs > 0;

    const handleQuantityChange = (invoiceItemId: number, value: string) => {
        setItems((prev) =>
            prev.map((item) =>
                item.invoiceItemId === invoiceItemId
                    ? { ...item, quantity: normalizeDecimalInput(value) }
                    : item,
            ),
        );
    };

    const handleConditionChange = (invoiceItemId: number, condition: ReturnCondition) => {
        setItems((prev) =>
            prev.map((item) =>
                item.invoiceItemId === invoiceItemId
                    ? { ...item, condition }
                    : item,
            ),
        );
    };

    const handleSubmit = () => {
        if (!hasSelectedItems) {
            toast.error('Debe seleccionar al menos un producto a devolver');
            return;
        }

        if (!reason.trim()) {
            toast.error('Debe indicar el motivo de la devolución');
            return;
        }

        if (!hasRefund) {
            toast.error('Debe indicar el monto del reembolso en USD o Bs');
            return;
        }

        if (totalRefundUsd > 0 && !usdPayment) {
            toast.error('No existe un método de pago de devolución en USD');
            return;
        }

        if (totalRefundBs > 0 && !bsPayment) {
            toast.error('No existe un método de pago de devolución en Bs');
            return;
        }

        const returnItems: ReturnItemBody[] = items
            .filter((item) => Number(item.quantity) > 0)
            .map((item) => ({
                invoiceItemId: item.invoiceItemId,
                quantity: Number(item.quantity),
                condition: item.condition,
            }));

        const payments: RefundPaymentBody[] = [];
        if (totalRefundUsd > 0 && usdPayment) {
            payments.push({ paymentTypeId: usdPayment.id, amount: totalRefundUsd });
        }
        if (totalRefundBs > 0 && bsPayment) {
            payments.push({ paymentTypeId: bsPayment.id, amount: totalRefundBs });
        }

        createReturnMutation.mutate(
            {
                invoiceId: invoice.id,
                reason: reason.trim(),
                items: returnItems,
                payments,
            },
            {
                onSuccess: (response) => {
                    if (!response?.success) {
                        toast.error(response?.message || 'No se pudo registrar la devolución');
                        return;
                    }
                    toast.success(response?.message || 'Devolución registrada correctamente');
                    onClose();
                },
                onError: () => {
                    toast.error('Ocurrió un error al registrar la devolución');
                },
            },
        );
    };

    return (
        <DialogContent className="!max-w-4xl !w-4xl"> 
            <DialogHeader>
                <DialogTitle>Devolución - Factura #{invoice.invoiceNumber}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                <div className="grid grid-cols-2 gap-4 text-sm">
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
                </div>

                <div>
                    <Label className="mb-2 block">Productos a devolver</Label>
                    <div className="space-y-2">
                        {items.map((item) => (
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
                                            onChange={(e) => handleQuantityChange(item.invoiceItemId, e.target.value)}
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
                    <Label>Motivo de la devolución</Label>
                    <textarea
                        className="min-h-20 w-full rounded-md border-2 border-gray-300 px-3 py-2 text-sm outline-none focus-visible:border-ring"
                        placeholder="Indique el motivo de la devolución"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />
                </div>

                <Separator />

                <div>
                    <Label className="mb-2 block">Reembolso al cliente</Label>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label>Monto en USD ($)</Label>
                            <Input
                                type="text"
                                inputMode="decimal"
                                value={refundUsd}
                                onChange={(e) => setRefundUsd(normalizeDecimalInput(e.target.value))}
                                placeholder="0.00"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>Monto en Bs</Label>
                            <Input
                                type="text"
                                inputMode="decimal"
                                value={refundBs}
                                onChange={(e) => setRefundBs(normalizeDecimalInput(e.target.value))}
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center justify-between rounded-md bg-muted/50 p-2">
                            <span className="text-muted-foreground">Método USD:</span>
                            <span className="font-medium">{usdPayment?.name ?? 'No configurado'}</span>
                        </div>
                        <div className="flex items-center justify-between rounded-md bg-muted/50 p-2">
                            <span className="text-muted-foreground">Método Bs:</span>
                            <span className="font-medium">{bsPayment?.name ?? 'No configurado'}</span>
                        </div>
                    </div>
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
                    disabled={createReturnMutation.isPending}
                >
                    {createReturnMutation.isPending ? 'Procesando...' : 'Registrar Devolución'}
                </Button>
            </DialogFooter>
        </DialogContent>
    );
};
