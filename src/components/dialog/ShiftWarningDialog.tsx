import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FiAlertTriangle, FiClock } from "react-icons/fi";

interface ShiftWarningDialogProps {
    open: boolean;
    type: '5min' | '1min';
    shiftName: string;
    endTime: string;
    onConfirm: () => void;
    onDismiss: () => void;
}

const warningConfig = {
    '5min': {
        title: 'Tu turno termina en 5 minutos',
        description: 'Por favor, prepara el cierre de tu sesión antes de que finalice el turno.',
        icon: FiClock,
        buttonVariant: 'primary' as const,
        buttonText: 'Entendido',
    },
    '1min': {
        title: 'Tu turno está por terminar',
        description: 'Queda 1 minuto. Cierra sesión ahora para habilitar el siguiente turno.',
        icon: FiAlertTriangle,
        buttonVariant: 'destructive' as const,
        buttonText: 'Cerrar sesión',
    },
};

export const ShiftWarningDialog = ({
    open,
    type,
    shiftName,
    endTime,
    onConfirm,
    onDismiss,
}: ShiftWarningDialogProps) => {
    const config = warningConfig[type];
    const Icon = config.icon;

    return (
        <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onDismiss(); }}>
            <DialogContent showCloseButton={false} className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className={`flex items-center justify-center rounded-full p-2 ${type === '1min' ? 'bg-red-100' : 'bg-yellow-100'}`}>
                            <Icon className={`size-6 ${type === '1min' ? 'text-red-600' : 'text-yellow-600'}`} />
                        </div>
                        <DialogTitle>{config.title}</DialogTitle>
                    </div>
                    <DialogDescription className="pt-2 text-black text-xl font-semibold">
                        {config.description}
                    </DialogDescription>
                </DialogHeader>

                <div className="rounded-md bg-gray-50 border p-3 text-sm">
                    <p><span className="font-semibold">Turno:</span> {shiftName}</p>
                    <p><span className="font-semibold">Hora de cierre:</span> {endTime}</p>
                </div>

                <DialogFooter>
                    <Button variant={config.buttonVariant} onClick={type === '1min' ? onConfirm : onDismiss}>
                        {config.buttonText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
