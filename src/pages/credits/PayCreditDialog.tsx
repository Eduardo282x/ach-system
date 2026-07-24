import { AlertDialogComponent } from "@/components/dialog/AlertDialogComponent";
import type { InvoiceResponse } from "@/interfaces/distpatch.interface";

interface PayCreditDialogProps {
    open: boolean;
    invoice: InvoiceResponse | null;
    onConfirm: () => void;
    onCancel: () => void;
}

export const PayCreditDialog = ({ open, invoice, onConfirm, onCancel }: PayCreditDialogProps) => {
    return (
        <AlertDialogComponent
            title="Saldar Deuda"
            description={`¿Estás seguro que desea saldar la deuda del recibo #${invoice?.invoiceNumber ?? ""} por un monto de ${invoice?.totalAmountBs ?? ""} Bs / ${invoice?.totalAmountUsd ?? ""} USD?`}
            open={open}
            close={onCancel}
            labelBtnConfirm="Saldar"
            onConfirm={onConfirm}
            onCancel={onCancel}
        />
    );
};
