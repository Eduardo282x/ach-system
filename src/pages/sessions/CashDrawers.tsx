import { TableComponent } from '@/components/table/TableComponent'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FaArrowLeft } from 'react-icons/fa'
import { IoMdAdd } from 'react-icons/io'
import { cashDrawerColumns } from './cashDrawer.data'
import type { CashDrawer } from '@/interfaces/sessions.interface'
import { useState } from 'react'
import { useCashDrawersQuery, useCreateCashDrawerMutation, useUpdateCashDrawerMutation } from '@/hooks/sessions.hook'

interface CashDrawersProps {
    close: () => void;
}

export const CashDrawers = ({ close }: CashDrawersProps) => {
    const { data, isLoading } = useCashDrawersQuery();
    const createCashDrawerMutation = useCreateCashDrawerMutation();
    const updateCashDrawerMutation = useUpdateCashDrawerMutation();
    const cashDrawers = data?.cashDrawers ?? [];
    const [cashDrawerSelected, setCashDrawerSelected] = useState<CashDrawer | null>(null);
    const [name, setName] = useState<string>('');


    const getActionCashDrawerTable = (action: string, data: CashDrawer) => {
        if (action === "edit") {
            setCashDrawerSelected(data);
            setName(data.name);
        }
    }

    const cancelForm = () =>{
        setCashDrawerSelected(null);
        setName('');
    }

    const saveCashDrawer = () => {
        if (cashDrawerSelected) {
            // edit cash drawer
            updateCashDrawerMutation.mutate({ id: cashDrawerSelected.id, name });
        } else {
            // create cash drawer
            createCashDrawerMutation.mutate(name);
        }

        setName('');
        setCashDrawerSelected(null);
    }

    return (
        <div>
            <div className="flex items-center mb-2">
                <Button variant="secondary" onClick={close}><FaArrowLeft /> </Button>
                <p className="text-2xl font-semibold mb-2 ml-2">Cajas</p>
            </div>

            <div className="rounded-xl bg-white p-4">
                <div className="w-full flex items-center justify-between mb-4">

                    <div className="flex items-center gap-2">
                        <Input placeholder="Nombre de la caja" value={name} onChange={(e) => setName(e.target.value)} />
                        <Button variant="primary" onClick={saveCashDrawer}><IoMdAdd /> {cashDrawerSelected ? `Editar Caja: ${cashDrawerSelected.name}` : "Crear Caja"}</Button>
                        {cashDrawerSelected && <Button variant="secondary" onClick={cancelForm}>Cancelar</Button>}
                    </div>
                </div>

                <TableComponent
                    onChange={getActionCashDrawerTable}
                    columns={cashDrawerColumns}
                    data={isLoading ? [] : cashDrawers}
                />
            </div>
        </div>
    )
}
