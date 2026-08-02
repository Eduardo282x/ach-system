import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Product, ProductBody, ExchangeRateType } from "@/interfaces/inventory.interface";
import { useCreateProductMutation, useUpdateProductMutation } from "@/hooks/inventory.hook";
import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { generateBarcodeApi } from "@/services/inventory.service";
import { translateCurrency } from "@/helpers/formatters";
import { Textarea } from "@/components/ui/textarea"

export type ProductFormMode = "create" | "edit";

interface ProductFormProps {
    mode: ProductFormMode;
    product: Product | null;
    closeForm: () => void;
}

export const ProductForm = ({ mode, product, closeForm }: ProductFormProps) => {
    const createProductMutation = useCreateProductMutation();
    const updateProductMutation = useUpdateProductMutation();
    const [disableBtnGenerate, setDisableBtnGenerate] = useState(false);

    const isEdit = mode === "edit" && product != null;

    const { register, handleSubmit, control, reset, setValue, getValues } = useForm<ProductBody>({
        defaultValues: {
            name: '',
            presentation: '',
            barcode: '',
            price: 0,
            currency: '',
            stock: 0,
            serialNumber: '',
            lote: '',
            brand: '',
            type: '',
            description: ''
        }
    });

    const onSubmit = async (data: ProductBody) => {
        if (isEdit && product) {
            const body: ProductBody = {
                ...data,
            };

            const response = await updateProductMutation.mutateAsync({
                id: product.id,
                data: body,
            });

            if (response.data != null && response.success) {
                closeForm();
            }
            return;
        }

        const body: ProductBody = {
            ...data,
        };

        const response = await createProductMutation.mutateAsync(body);

        if (response.data != null && response.success) {
            closeForm();
            reset({
                name: '',
                presentation: '',
                barcode: '',
                price: 0,
                currency: '',
                stock: 0,
                serialNumber: '',
                lote: '',
                brand: '',
                type: '',
                description: ''
            });
        }
    }

    useEffect(() => {
        if (mode === "edit" && product) {
            reset({
                name: product.name,
                presentation: product.presentation,
                barcode: product.barcode,
                price: typeof product.price === "number" ? product.price : Number(product.price),
                currency: product.currency,
                stock: product.stock,
                serialNumber: product.serialNumber,
                lote: product.lote,
                brand: product.brand,
                type: product.type,
                description: product.description,
            });
            return;
        }

        reset({
            name: '',
            presentation: '',
            barcode: '',
            price: 0,
            currency: '',
            stock: 0,
            serialNumber: '',
            lote: '',
            brand: '',
            type: '',
            description: '',
        });
    }, [mode, product, reset])

    const generateBarcode = async () => {
        const response = await generateBarcodeApi();
        if (response) {
            setValue("barcode", response);
        }
        setDisableBtnGenerate(true);
    }

    const barcodeValue = useWatch({
        control,
        name: 'barcode',
    })

    const currencyValue = useWatch({
        control,
        name: 'currency',
    })

    useEffect(() => {
        if (!barcodeValue) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setDisableBtnGenerate(false);
        }
    }, [barcodeValue])

    const RequiredField = () => {
        return <span className="text-red-500">*</span>
    }

    const OptionalField = () => {
        return <span className="text-gray-500 text-sm font-normal">(Opcional)</span>
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="w-3/4 mx-auto mt-8 h-full grid grid-cols-3 gap-4 px-8 py-4 bg-white rounded-xl shadow-md">
            <Field>
                <FieldLabel>Código {RequiredField()}</FieldLabel>
                <div className="flex items-center gap-2">
                    <Input maxLength={16} {...register('barcode')} disabled={isEdit} />
                    <Button type="button" disabled={disableBtnGenerate || isEdit} variant="primary" onClick={generateBarcode}>Generar</Button>
                </div>
            </Field>
            <Field>
                <FieldLabel>Nombre {RequiredField()}</FieldLabel>
                <Input {...register('name')} />
            </Field>
            <Field>
                <FieldLabel>Presentación {OptionalField()}</FieldLabel>
                <Input {...register('presentation')} />
            </Field>
            <div className="col-span-4 grid grid-cols-4 gap-4">
                <Field>
                    <FieldLabel>N° Serie {OptionalField()}</FieldLabel>
                    <Input {...register('serialNumber')} />
                </Field>
                <Field>
                    <FieldLabel>N° Lote {OptionalField()}</FieldLabel>
                    <Input {...register('lote')} />
                </Field>
                <Field>
                    <FieldLabel>Marca {RequiredField()}</FieldLabel>
                    <Input {...register('brand')} />
                </Field>
                <Field>
                    <FieldLabel>Tipo {RequiredField()}</FieldLabel>
                    <Input {...register('type')} />
                </Field>
            </div>
            <Field>
                <FieldLabel>Cantidad {RequiredField()}</FieldLabel>
                <Input
                    type="number"
                    {...register('stock', { valueAsNumber: true })}
                    onFocus={() => {
                        if (getValues('stock') === 0) setValue('stock', '')
                    }}
                />
            </Field>
            <Field>
                <FieldLabel>Precio {RequiredField()}</FieldLabel>
                <div className="flex items-center gap-2">
                    <Input
                        type="number"
                        step="0.01"
                        {...register('price', { valueAsNumber: true })}
                        onFocus={() => {
                            if (getValues('price') === 0) setValue('price', '')
                        }}
                    />
                    {currencyValue && <span className="text-gray-500 font-medium">{translateCurrency(currencyValue as ExchangeRateType)}</span>}
                </div>
            </Field>
            <Controller
                name="currency"
                control={control}
                render={({ field }) => (
                    <Field>
                        <FieldLabel>Moneda</FieldLabel>
                        <Select
                            name={field.name}
                            value={field.value}
                            onValueChange={field.onChange}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccione una moneda" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="USD">Dolares</SelectItem>
                                    <SelectItem value="EUR">Euros</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </Field>
                )}>
            </Controller>

            <Field className="col-span-4">
                <FieldLabel>Descripción {OptionalField()}</FieldLabel>
                <Textarea  {...register('description')} />
            </Field>

            <Button
                variant="primary"
                type="submit"
                className="col-span-4"
                disabled={createProductMutation.isPending || updateProductMutation.isPending}
            >
                Guardar Producto
            </Button>
        </form>
    )
}