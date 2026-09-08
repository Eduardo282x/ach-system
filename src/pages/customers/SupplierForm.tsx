import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Supplier } from "@/interfaces/suppliers.interface";
import { useCreateSupplierMutation, useUpdateSupplierMutation } from "./suppliers.hook";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from 'react-hot-toast';

export type SupplierFormMode = "create" | "edit";

interface SupplierFormProps {
    mode: SupplierFormMode;
    supplier: Supplier | null;
    closeForm: () => void;
    onCreated?: (supplier: Supplier) => void;
}

interface SupplierFormValues {
    name: string;
    phone: string;
    address: string;
}

const defaultValues: SupplierFormValues = {
    name: '',
    phone: '',
    address: '',
};

export const SupplierForm = ({ mode, supplier, closeForm, onCreated }: SupplierFormProps) => {
    const createSupplierMutation = useCreateSupplierMutation();
    const updateSupplierMutation = useUpdateSupplierMutation();
    const [identifyPrefix, setIdentifyPrefix] = useState('V');
    const [identifyNumber, setIdentifyNumber] = useState('');

    const { register, handleSubmit, reset } = useForm<SupplierFormValues>({
        defaultValues,
    });

    useEffect(() => {
        if (mode === "edit" && supplier) {
            reset({
                name: supplier.name,
                phone: supplier.phone,
                address: supplier.address,
            });
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIdentifyPrefix(supplier.identify.slice(0, 1));
            setIdentifyNumber(supplier.identify.slice(1));
            return;
        }

        reset(defaultValues);
        setIdentifyPrefix('V');
        setIdentifyNumber('');
    }, [mode, supplier, reset]);

    const onChangeIdentify = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setIdentifyNumber(value.replace(/\D/g, ''));
    }

    const onSubmit = async (values: SupplierFormValues) => {
        const nameValue = values.name.trim();
        const phoneValue = values.phone.trim();
        const addressValue = values.address.trim();

        if (!nameValue || !identifyNumber || !phoneValue || !addressValue) {
            toast.error('Completa nombre, identificación, teléfono y dirección para guardar el proveedor', {
                duration: 3000,
                position: 'top-right',
            });
            return;
        }

        const body: Omit<Supplier, 'id'> = {
            name: nameValue,
            identify: `${identifyPrefix}${identifyNumber}`,
            phone: phoneValue,
            address: addressValue,
        };

        if (mode === "edit" && supplier) {
            const response = await updateSupplierMutation.mutateAsync({ id: supplier.id, data: body });
            if (response.data != null && response.success) {
                toast.success(response.message || 'Proveedor actualizado correctamente', {
                    duration: 3000,
                    position: 'top-right',
                });
                closeForm();
            }
            return;
        }

        const response = await createSupplierMutation.mutateAsync(body);
        if (response.data != null && response.success) {
            onCreated?.(response.data);
            toast.success(response.message || 'Proveedor creado correctamente', {
                duration: 3000,
                position: 'top-right',
            });
            closeForm();
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="w-3/4 px-8 py-4 rounded-xl shadow-md mx-auto mt-8 h-full grid grid-cols-3 gap-4 bg-white">
            <Field className="col-span-1">
                <FieldLabel>Nombre</FieldLabel>
                <Input {...register('name')} placeholder="Ingrese el nombre del proveedor" />
            </Field>

            <Field className="col-span-1">
                <FieldLabel>Cédula / RIF</FieldLabel>
                <div className="flex items-center gap-2">
                    <Select value={identifyPrefix} onValueChange={(value) => setIdentifyPrefix(value)}>
                        <SelectTrigger className="w-20 bg-white">
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
                        value={identifyNumber}
                        onChange={onChangeIdentify}
                        placeholder="Número"
                    />
                </div>
            </Field>

            <Field className="col-span-1">
                <FieldLabel>Teléfono</FieldLabel>
                <Input {...register('phone')} placeholder="Ingrese el teléfono del proveedor" />
            </Field>

            <Field className="col-span-1">
                <FieldLabel>Dirección</FieldLabel>
                <Input {...register('address')} placeholder="Ingrese la dirección del proveedor" />
            </Field>

            <Button
                variant="primary"
                type="submit"
                className="col-span-3"
                disabled={createSupplierMutation.isPending || updateSupplierMutation.isPending}
            >
                {mode === "edit" ? 'Guardar Proveedor' : 'Crear Proveedor'}
            </Button>
        </form>
    )
}
