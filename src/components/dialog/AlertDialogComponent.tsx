import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "../ui/button";
import type { DailyReminder } from "@/interfaces/base.interface";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { FiInfo } from "react-icons/fi";
interface AlertDialogProps {
    title: string;
    description: string;
    open: boolean;
    labelBtnConfirm?: string;
    close: () => void;
    onConfirm: () => void;
    onCancel: () => void;
}

export const AlertDialogComponent = ({ title, description, open, labelBtnConfirm = "Confirmar", close, onConfirm, onCancel }: AlertDialogProps) => {
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
                    <Button variant="destructive" onClick={onConfirm}>{labelBtnConfirm}</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export const CustomSnackbarMessage = ({contentMessage}: {contentMessage: DailyReminder}) => {
    const { title, message, status } = contentMessage;
    return (
        <div className="flex items-start gap-3 p-3 w-full">
            {status === 'success' && (
                <IoMdCheckmarkCircleOutline className="text-green-500 size-8 shrink-0" />
            )}
            {status === 'warning' && (
                <FiInfo className="text-yellow-500 size-8 shrink-0"/>
            )}
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-xl">{title}</p>
                <p className="text-sm wrap-break-word whitespace-normal">{message}</p>
            </div>
        </div>
    )
}