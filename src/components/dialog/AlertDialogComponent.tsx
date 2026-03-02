import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "../ui/button";

interface AlertDialogProps {
    title: string;
    description: string;
    open: boolean;
    close: () => void;
    onConfirm: () => void;
    onCancel: () => void;
}

export const AlertDialogComponent = ({ title, description, open, close, onConfirm, onCancel }: AlertDialogProps) => {
    return (
        <Dialog open={open} onOpenChange={close}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
                    <Button variant="destructive" onClick={onConfirm}>Confirmar</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
