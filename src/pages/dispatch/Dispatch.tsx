import { SearchClients } from './SearchClients'
import { InfoCashDrawer } from './InfoCashDrawer'
import { useCallback, useEffect, useState } from 'react';
import { ListProducts } from './ListProducts';
import type { Client } from '@/interfaces/customer.interface';
import { Payment } from './Payment';
import { useTypesPaymentsQuery } from '@/hooks/dispatch.hook';
import { useDispatchStore } from '@/store/dispatch.store';
import { AlertDialogComponent } from '@/components/dialog/AlertDialogComponent';

export const Dispatch = () => {
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [resetKey, setResetKey] = useState<number>(0);
    const disabled = selectedClient == null;
    useTypesPaymentsQuery();
    const { setProductList } = useDispatchStore(state => state)

    useEffect(() => {
        return () => {
            setProductList([]); // Limpiar la lista de productos al salir del componente
        }
    }, [setProductList]);

    const handleCompleteSale = useCallback(() => {
        setSelectedClient(null);
        setResetKey((prev) => prev + 1);
    }, []);

    return (
        <div className='w-full h-full min-h-0 flex flex-col'>

            <div className="flex flex-col lg:flex-row items-stretch gap-4 lg:h-36 mb-2 shrink-0">
                <div className="w-full lg:w-[40%]">
                    <SearchClients key={resetKey} onClientChange={setSelectedClient} />
                </div>
                <div className="w-full lg:w-[40%]">
                    <InfoCashDrawer />
                </div>
                <div className="w-full lg:w-[20%]">
                    <Payment customer={selectedClient} onCompleteSale={handleCompleteSale} />
                </div>
            </div>

            <div className={`w-full flex-1 min-h-[320px] lg:min-h-0 transition-opacity ${disabled ? 'opacity-70' : 'opacity-100'} relative`} aria-disabled={disabled}>
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