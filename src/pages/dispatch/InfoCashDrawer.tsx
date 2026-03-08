import { formatDate } from '@/helpers/formatters';
import { useAuthStore } from '@/store/auth.store';

export const InfoCashDrawer = () => {
    const today = new Date();
    const { cashier } = useAuthStore((state) => state);
    const cashierState = cashier as unknown;
    const drawerLabel = typeof cashierState === 'object' && cashierState !== null && 'cashDrawer' in cashierState
        ? String((cashierState as { cashDrawer?: string | number }).cashDrawer ?? '')
        : typeof cashierState === 'string'
            ? cashierState
            : '';

    return (
        <div className='w-[40%] h-full rounded-xl border-2 border-gray-300 bg-gray-100 overflow-hidden'>
            <div className='text-center text-xl bg-white font-semibold text-blue-800 py-2'>
                <p>Informacion del cajero</p>
            </div>

            <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-md bg-white p-3 border border-gray-200">
                    <p className='font-semibold text-sm text-gray-600'>Fecha</p>
                    <p className='text-base font-medium'>{formatDate(today)}</p>
                </div>

                <div className="rounded-md bg-white p-3 border border-gray-200">
                    <p className='font-semibold text-sm text-gray-600'>Cajero</p>
                    <p className='text-base font-medium'>{cashier?.name || 'Sin cajero'}</p>
                </div>

                <div className="rounded-md bg-white p-3 border border-gray-200">
                    <p className='font-semibold text-sm text-gray-600'>Caja</p>
                    <p className='text-base font-medium'>{drawerLabel ? `Caja ${drawerLabel}` : 'Sin caja seleccionada'}</p>
                </div>
            </div>
        </div>
    )
}
