import { formatDate } from '@/helpers/formatters';
import { useSessionsQuery } from '@/hooks/sessions.hook';

export const InfoCashDrawer = () => {
    const today = new Date();
    const { data } = useSessionsQuery({ status: 'OPEN' });

    const drawerLabel = data ? data?.sessions[0]?.cashDrawer?.name || '' : '';
    const cashier = data ? data?.sessions[0]?.user?.name || '' : '';

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
                    <p className='text-base font-medium'>{cashier || 'Sin cajero'}</p>
                </div>

                <div className="rounded-md bg-white p-3 border border-gray-200">
                    <p className='font-semibold text-sm text-gray-600'>Caja</p>
                    <p className='text-base font-medium'>{drawerLabel ? `${drawerLabel}` : 'Sin caja seleccionada'}</p>
                </div>
            </div>
        </div>
    )
}
