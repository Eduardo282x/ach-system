import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { Client } from '@/interfaces/customer.interface'
import { createCustomerApi, getCustomersApi } from '@/services/customers.service'
import toast from 'react-hot-toast'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface SearchClientsProps {
    onClientChange: (client: Client | null) => void;
}

export const SearchClients = ({ onClientChange }: SearchClientsProps) => {
    const [identifyPrefix, setIdentifyPrefix] = useState('V');
    const [identify, setIdentify] = useState('');
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [openDialog, setOpenDialog] = useState(true);

    const searchClient = async () => {
        const identifyValue = identify.trim();

        if (!identifyValue) {
            toast.error('Ingresa una cédula para buscar');
            return;
        }

        setIsSearching(true);

        try {
            const response = await getCustomersApi(identifyValue);
            const client = response.clients[0];

            if (!client) {
                onClientChange(null);
                setShowCreate(true);
                setFullName('');
                setPhone('');
                setIdentifyPrefix('V');
                toast.error('Cliente no encontrado. Puedes crearlo ahora.', {
                    duration: 3000,
                    position: 'top-right',
                });
                return;
            }

            setFullName(client.fullName);
            setIdentifyPrefix(client.identify.slice(0, 1));
            setPhone(client.phone);
            setShowCreate(false);
            onClientChange(client);
            toast.success('Cliente encontrado', {
                duration: 3000,
                position: 'top-right',
            });
            setOpenDialog(false);
        } finally {
            setIsSearching(false);
        }
    }

    const createClient = async () => {
        const identifyValue = identify.trim();
        const fullNameValue = fullName.trim();
        const phoneValue = phone.trim();

        if (!identifyValue || !fullNameValue || !phoneValue) {
            toast.error('Completa cédula, nombre y teléfono para crear el cliente', {
                duration: 3000,
                position: 'top-right',
            });
            return;
        }

        setIsCreating(true);

        try {
            const response = await createCustomerApi({
                identify: `${identifyPrefix}${identifyValue}`,
                fullName: fullNameValue,
                phone: phoneValue,
            });

            if (!response.success || response.data == null) {
                toast.error(response.message || 'No se pudo crear el cliente', {
                    duration: 3000,
                    position: 'top-right',
                });
                return;
            }

            setShowCreate(false);
            onClientChange(response.data);
            toast.success(response.message || 'Cliente creado correctamente', {
                duration: 3000,
                position: 'top-right',
            });
            setOpenDialog(false);
        } finally {
            setIsCreating(false);
        }
    }

    const openDialogClient = () => {
        setOpenDialog(true);
    }

    return (
        <div className='w-[40%] h-full rounded-xl border-2 border-gray-300 bg-gray-100 overflow-hidden'>
            <div className='bg-white text-center text-xl font-semibold text-blue-800 py-2 relative'>
                <p>Informacion del cliente</p>

                <div className='absolute top-1 left-1'>
                    <Button variant='primary' onClick={openDialogClient}>
                        Buscar cliente
                    </Button>
                </div>
            </div>

            <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                    <p className='font-semibold'>Cedula</p>
                    <Input
                        value={`${identifyPrefix}-${identify}`}
                        disabled
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <p className='font-semibold'>Nombre</p>
                    <Input
                        value={fullName}
                        disabled
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <p className='font-semibold'>Teléfono</p>
                    <Input
                        value={phone}
                        disabled
                    />
                </div>
            </div>

            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            <p className='text-center text-blue-800 -mt-4 font-semibold text-xl'>Buscar cliente</p>
                        </DialogTitle>
                    </DialogHeader>
                    <div>
                        <div className="flex flex-col gap-1 my-2 md:col-span-2">
                            <p className='font-semibold'>Cédula</p>
                            <div className='flex items-center gap-2'>
                                <Select defaultValue={identifyPrefix} onValueChange={(value) => setIdentifyPrefix(value)}>
                                    <SelectTrigger className="w-20 bg-white" id="select-rows-per-page">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent align="start">
                                        <SelectGroup>
                                            <SelectItem value="V">V</SelectItem>
                                            <SelectItem value="E">E</SelectItem>
                                            <SelectItem value="J">J</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <Input
                                    value={identify}
                                    onChange={(event) => setIdentify(event.target.value)}
                                    placeholder="Ingrese la cédula del cliente"
                                />
                                <Button variant='primary' onClick={searchClient} disabled={isSearching}>
                                    {isSearching ? 'Buscando...' : 'Buscar'}
                                </Button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1 my-2">
                            <p className='font-semibold'>Nombre</p>
                            <Input
                                value={fullName}
                                onChange={(event) => setFullName(event.target.value)}
                                placeholder="Ingrese el nombre del cliente"
                            />
                        </div>

                        <div className="flex flex-col gap-1 my-2">
                            <p className='font-semibold'>Teléfono</p>
                            <Input
                                value={phone}
                                onChange={(event) => setPhone(event.target.value)}
                                placeholder="Ingrese el teléfono del cliente"
                            />
                        </div>

                        {showCreate && (
                            <div className='md:col-span-3 flex items-center justify-end'>
                                <Button variant='primary' onClick={createClient} disabled={isCreating}>
                                    {isCreating ? 'Creando cliente...' : 'Crear cliente'}
                                </Button>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
