import { SearchClients } from './SearchClients'
import { InfoCashDrawer } from './InfoCashDrawer'
import { useEffect, useState } from 'react';
import { ListProducts } from './ListProducts';
import type { Client } from '@/interfaces/customer.interface';
import { Payment } from './Payment';
import { useTypesPaymentsQuery } from '@/hooks/dispatch.hook';
import { useDispatchStore } from '@/store/dispatch.store';
import { AlertDialogComponent } from '@/components/dialog/AlertDialogComponent';

export const Dispatch = () => {
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const disabled = selectedClient == null;
    useTypesPaymentsQuery();
    const { setProductList } = useDispatchStore(state => state)

    useEffect(() => {
        return () => {
            setProductList([]); // Limpiar la lista de productos al salir del componente
        }
    }, [setProductList]);

    return (
        <div className='w-full'>

            <div className="flex items-center gap-4 h-36 mb-2">
                <SearchClients onClientChange={setSelectedClient} />
                <InfoCashDrawer />
                <Payment customer={selectedClient} />
            </div>

            <div className={`w-full transition-opacity ${disabled ? 'opacity-70' : 'opacity-100'} relative`} aria-disabled={disabled}>
                {disabled && (
                    <div>
                        <div className="absolute inset-0 bg-gray-700 opacity-50 z-10" />
                        <div className="absolute inset-0 flex items-center justify-center z-20">
                            <p className="text-gray-600 text-lg font-semibold">Seleccione un cliente para continuar</p>
                        </div>
                    </div>
                )}
                <ListProducts />
            </div>
        </div>
    )
}


interface DispatchAlertDialogProps {
    open: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export const DispatchAlertDialog = ({ open, onConfirm, onCancel }: DispatchAlertDialogProps) => {
    return (
        <AlertDialogComponent
            title="¿Estás seguro de que deseas salir?"
            description="Se perderán los cambios no guardados."
            open={open}
            close={onCancel}
            onCancel={onCancel}
            onConfirm={onConfirm}
        />
    )
}