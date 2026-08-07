import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "../ui/button";
import type { DailyReminder } from "@/interfaces/base.interface";
import { IoMdCheckmarkCircleOutline, IoMdEye, IoMdEyeOff } from "react-icons/io";
import { FiInfo } from "react-icons/fi";
import { Input } from "../ui/input";
import { useState } from "react";
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

interface AlertDialogAdminProps {
    title: string;
    description: string;
    open: boolean;
    labelBtnConfirm?: string;
    close: () => void;
    onConfirm: (password: string) => void;
    onCancel: () => void;
}

export const AlertDialogComponentAdminPassword = ({ title, description, open, labelBtnConfirm = "Confirmar", close, onConfirm, onCancel }: AlertDialogAdminProps) => {
    const [password, setPassword] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);

    const handleConfirm = () => {
        onConfirm(password);
        setPassword('');
    }

    return (
        <Dialog open={open} onOpenChange={close}>
            <DialogContent className="max-w-5xl">
                <DialogHeader>
                    <DialogTitle className="text-red-500 font-semibold text-lg">{title}</DialogTitle>
                    <DialogDescription className="text-gray-900">
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <div>
                    <p className="font-semibold mb-2 text-lg">Ingrese la contraseña de administrador para confirmar:</p>
                    <div className="flex items-center justify-between relative">
                        <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Contraseña de administrador"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <div className="absolute top-0 right-0">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <IoMdEye /> : <IoMdEyeOff />}
                            </Button>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
                    <Button variant="destructive" onClick={handleConfirm}>
                        {labelBtnConfirm}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export const CustomSnackbarMessage = ({ contentMessage }: { contentMessage: DailyReminder }) => {
    const { title, message, status } = contentMessage;
    return (
        <div className="flex items-start gap-3 p-3 w-full">
            {status === 'success' && (
                <IoMdCheckmarkCircleOutline className="text-green-500 size-8 shrink-0" />
            )}
            {status === 'warning' && (
                <FiInfo className="text-yellow-500 size-8 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-xl">{title}</p>
                <p className="text-sm wrap-break-word whitespace-normal">{message}</p>
            </div>
        </div>
    )
}

interface AlertDialogAdminSimpleProps {
    open: boolean;
    labelBtnConfirm?: string;
    close: () => void;
    onConfirm: (password: string) => void | Promise<void>;
    onCancel: () => void;
}

export const AlertDialogComponentPasswordSimple = ({ open, labelBtnConfirm = "Confirmar", close, onConfirm, onCancel }: AlertDialogAdminSimpleProps) => {
    const [password, setPassword] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    const handleConfirm = async () => {
        setLoading(true);
        try {
            await onConfirm(password);
        } finally {
            setLoading(false);
            setPassword('');
        }
    };

    return (
        <Dialog open={open} onOpenChange={close}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-red-500 font-semibold text-lg">Eliminar</DialogTitle>
                    <DialogDescription className="text-gray-900 text-lg">
                        Ingrese la contraseña de administrador para confirmar:
                    </DialogDescription>
                </DialogHeader>
                <div>
                    <div className="flex items-center justify-between relative">
                        <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Contraseña de administrador"
                            value={password}
                            disabled={loading}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <div className="absolute top-0 right-0">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={loading}
                            >
                                {showPassword ? <IoMdEye /> : <IoMdEyeOff />}
                            </Button>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={onCancel} disabled={loading}>Cancelar</Button>
                    <Button variant="destructive" onClick={handleConfirm} disabled={loading}>
                        {loading ? 'Validando...' : labelBtnConfirm}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}