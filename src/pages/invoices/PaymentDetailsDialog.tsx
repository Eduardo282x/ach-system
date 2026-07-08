import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { formatNumberWithDecimal, translateCurrency } from "@/helpers/formatters";
import type { ExchangeRateType } from "@/interfaces/inventory.interface";
import type { PaymentDetail } from "@/interfaces/distpatch.interface";

interface PaymentDetailsDialogProps {
    open: boolean;
    onClose: () => void;
    paymentDetails: PaymentDetail[];
    totalAmountBs: string;
    totalAmountUsd: string;
}

export const PaymentDetailsDialog = ({
    open,
    onClose,
    paymentDetails,
    totalAmountBs,
    totalAmountUsd,
}: PaymentDetailsDialogProps) => {
    const isMultiCurrency = paymentDetails.length > 1 ||
        (paymentDetails.length === 1 && paymentDetails[0].currency !== 'BS');

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Detalles de Pago</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Tipo de pago:</span>
                        <span className="font-medium">
                            {isMultiCurrency ? 'Multi-moneda' : 'Pago simple'}
                        </span>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                        {paymentDetails.map((payment) => (
                            <div
                                key={payment.id}
                                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                            >
                                <div className="space-y-1">
                                    <p className="font-medium text-sm">
                                        {payment.paymentType?.name ?? 'N/A'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Moneda: {translateCurrency(payment.currency as ExchangeRateType)}
                                    </p>
                                </div>
                                <div className="text-right space-y-1">
                                    <p className="text-sm font-semibold">
                                        {formatNumberWithDecimal(payment.amountReceived)} {translateCurrency(payment.currency as ExchangeRateType)}
                                    </p>
                                    {Number(payment.amountChange) > 0 && (
                                        <p className="text-xs text-muted-foreground">
                                            Vuelto: {formatNumberWithDecimal(payment.amountChange)} {translateCurrency(payment.currency as ExchangeRateType)}
                                        </p>
                                    )}
                                    <p className="text-xs text-green-600 font-medium">
                                        Neto: {formatNumberWithDecimal(payment.amountNet)} {translateCurrency(payment.currency as ExchangeRateType)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Separator />

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Total factura (Bs):</span>
                            <span className="font-bold">{formatNumberWithDecimal(totalAmountBs)} Bs</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Total factura (USD):</span>
                            <span className="font-bold">${formatNumberWithDecimal(totalAmountUsd)}</span>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
