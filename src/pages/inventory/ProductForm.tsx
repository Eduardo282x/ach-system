import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Product, ProductBody } from "@/interfaces/inventory.interface";
import { useCreateProductMutation, useUpdateProductMutation } from "@/hooks/inventory.hook";
import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { generateBarcodeApi } from "@/services/inventory.service";
import { translateCurrency } from "@/helpers/formatters";

export type ProductFormMode = "create" | "edit" | "addDetail";

interface ProductFormProps {
    mode: ProductFormMode;
    product: Product | null;
    closeForm: () => void;
}

export const ProductForm = ({ mode, product, closeForm }: ProductFormProps) => {
    const createProductMutation = useCreateProductMutation();
    const updateProductMutation = useUpdateProductMutation();
    const [disableBtnGenerate, setDisableBtnGenerate] = useState(false);
    const isAddDetail = mode === "addDetail";
    const isEdit = mode === "edit" && product != null;
    const isEditChild = isEdit && product.parentId != null;
    const showUnitsDetail = !isAddDetail && !isEditChild;

    const { register, handleSubmit, control, reset, setValue } = useForm<ProductBody>({
        defaultValues: {
            name: '',
            presentation: '',
            barcode: '',
            price: 0,
            currency: '',
            stock: 0,
            isDetail: false,
            parentId: null,
            unitsDetail: 0,
        }
    });

    const onSubmit = async (data: ProductBody) => {
        if (isEdit && product) {
            const body: ProductBody = {
                ...data,
                parentId: isEditChild ? product.parentId : null,
                isDetail: isEditChild,
                unitsDetail: isEditChild ? null : Math.max(1, data.unitsDetail ?? 1),
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
            parentId: isAddDetail && product ? product.id : null,
            isDetail: isAddDetail,
            unitsDetail: isAddDetail ? null : Math.max(1, data.unitsDetail ?? 1),
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
                isDetail: false,
                parentId: null,
                unitsDetail: null,
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
                isDetail: product.isDetail,
                parentId: product.parentId,
                unitsDetail: product.unitsDetail,
            });
            return;
        }

        if (mode === "addDetail" && product) {
            reset({
                name: product.name,
                presentation: '',
                barcode: '',
                price: 0,
                currency: product.currency,
                stock: 0,
                isDetail: true,
                parentId: product.id,
                unitsDetail: null,
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
            isDetail: false,
            parentId: null,
            unitsDetail: null,
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

    useEffect(() => {
        if (!barcodeValue) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setDisableBtnGenerate(false);
        }
    }, [barcodeValue])


    return (
        <form onSubmit={handleSubmit(onSubmit)} className="w-1/2 mx-auto mt-8 h-full grid grid-cols-2 gap-4 px-8 py-4 bg-white rounded-xl shadow-md">

            {product && isAddDetail && (
                <Field className="col-span-2">
                    <FieldLabel>Producto Padre</FieldLabel>
                    <Input disabled={true} value={`${product.barcode} - ${product.name} - ${product.price}${translateCurrency(product.currency)}`} />
                </Field>
            )}

            <Field className="col-span-1">
                <FieldLabel>Código</FieldLabel>
                <div className="flex items-center gap-2">
                    <Input {...register('barcode')} />
                    <Button type="button" disabled={disableBtnGenerate} variant="primary" onClick={generateBarcode}>Generar</Button>
                </div>
            </Field>
            <Field className="col-span-1">
                <FieldLabel>Nombre</FieldLabel>
                <Input {...register('name')} />
            </Field>
            <Field className="col-span-1">
                <FieldLabel>Presentación <span className="text-gray-500 text-sm font-normal">(Opcional)</span></FieldLabel>
                <Input {...register('presentation')} />
            </Field>
            <Field className="col-span-1">
                <FieldLabel>Cantidad</FieldLabel>
                <Input type="number" {...register('stock', { valueAsNumber: true })} />
            </Field>
            <Field className="col-span-1">
                <FieldLabel>Precio</FieldLabel>
                <Input type="number" step="0.01" {...register('price', { valueAsNumber: true })} />
            </Field>
            <Controller
                name="currency"
                control={control}
                render={({ field }) => (
                    <Field className="col-span-1">
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
            {showUnitsDetail && (
                <Field className="col-span-1">
                    <FieldLabel>Cantidad Detallada</FieldLabel>
                    <Input type="number" min={1} {...register('unitsDetail', { valueAsNumber: true, min: 1 })} />
                </Field>
            )}

            <Button
                variant="primary"
                type="submit"
                className="col-span-2"
                disabled={createProductMutation.isPending || updateProductMutation.isPending}
            >
                Guardar Producto
            </Button>
        </form>
    )
}