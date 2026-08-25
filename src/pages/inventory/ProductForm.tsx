import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ExchangeRateType, Product, ProductBody } from "@/interfaces/inventory.interface";
import { useCreateProductMutation, useUpdateProductMutation } from "@/hooks/inventory.hook";
import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import { generateBarcodeApi } from "@/services/inventory.service";
import { translateCurrency } from "@/helpers/formatters";
import { Checkbox } from "@/components/ui/checkbox"
import toast from 'react-hot-toast';

export type ProductFormMode = "create" | "edit" | "addDetail";

interface ProductFormProps {
    mode: ProductFormMode;
    product: Product | null;
    closeForm: () => void;
}

const defaultFatherValues: ProductBody = {
    name: '',
    presentation: '',
    barcode: '',
    price: 0,
    currency: 'USD',
    stock: 0,
    isDetail: false,
    parentId: null,
    unitsDetail: 0,
};

const defaultChildValues: ProductBody = {
    name: '',
    presentation: 'Detal',
    barcode: '',
    price: 0,
    currency: 'USD',
    stock: 0,
    isDetail: true,
    parentId: null,
    unitsDetail: null,
};

export const ProductForm = ({ mode, product, closeForm }: ProductFormProps) => {
    const createProductMutation = useCreateProductMutation();
    const updateProductMutation = useUpdateProductMutation();
    const [disableBtnGenerate, setDisableBtnGenerate] = useState(false);
    const [disableBtnGenerateChild, setDisableBtnGenerateChild] = useState(false);
    const isAddDetail = mode === "addDetail";
    const isCreate = mode === "create";
    const isEdit = mode === "edit" && product != null;
    const isEditChild = isEdit && product.parentId != null;
    const [isDetail, setIsDetail] = useState<boolean>(false);

    const formProductFather = useForm<ProductBody>({
        defaultValues: defaultFatherValues
    });

    const formProductChildren = useForm<ProductBody>({
        defaultValues: defaultChildValues
    });

    const resetForms = () => {
        formProductFather.reset(defaultFatherValues);
        formProductChildren.reset(defaultChildValues);
    }

    const onSubmit = async (fatherData: ProductBody) => {
        if (isEdit && product) {
            const body: ProductBody = {
                ...fatherData,
                parentId: isEditChild ? product.parentId : null,
                isDetail: isEditChild,
                unitsDetail: isEditChild ? null : Math.max(1, fatherData.unitsDetail ?? 1),
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

        if (!isDetail) {
            const body: ProductBody = {
                ...fatherData,
                parentId: isAddDetail && product ? product.id : null,
                isDetail: isAddDetail,
                unitsDetail: isAddDetail ? null : Math.max(1, fatherData.unitsDetail ?? 1),
            };

            const response = await createProductMutation.mutateAsync(body);

            if (response.data != null && response.success) {
                closeForm();
                resetForms();
            }
            return;
        }

        const isValidChild = await formProductChildren.trigger();
        if (!isValidChild) return;

        const childData = formProductChildren.getValues();
        const childStock = Number.isFinite(childData.stock) ? childData.stock : 0;

        const fatherResponse = await createProductMutation.mutateAsync({
            ...fatherData,
            parentId: null,
            isDetail: false,
            unitsDetail: Math.max(1, childStock),
        });

        if (fatherResponse.data == null || !fatherResponse.success) return;

        const childResponse = await createProductMutation.mutateAsync({
            ...childData,
            parentId: fatherResponse.data.id,
            isDetail: true,
            unitsDetail: null,
            currency: fatherData.currency,
            stock: childStock,
        });

        if (childResponse.data == null || !childResponse.success) {
            toast.error("El producto padre fue creado, pero ocurrió un error al crear el producto detallado.", {
                duration: 1500,
                position: 'top-right'
            });
            return;
        }

        closeForm();
        resetForms();
    }

    const { reset: resetFatherForm } = formProductFather;
    const { reset: resetChildrenForm } = formProductChildren;

    useEffect(() => {
        if (mode === "edit" && product) {
            resetFatherForm({
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
            resetChildrenForm(defaultChildValues);
            return;
        }

        if (mode === "addDetail" && product) {
            resetFatherForm({
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
            resetChildrenForm(defaultChildValues);
            return;
        }

        resetFatherForm(defaultFatherValues);
        resetChildrenForm(defaultChildValues);
    }, [mode, product, resetFatherForm, resetChildrenForm])

    const generateBarcode = async (form: UseFormReturn<ProductBody>, setDisabled: (value: boolean) => void) => {
        const response = await generateBarcodeApi();
        if (response) {
            form.setValue("barcode", response);
        }
        setDisabled(true);
    }

    const barcodeValue = useWatch({
        control: formProductFather.control,
        name: 'barcode',
    })

    const barcodeValueChild = useWatch({
        control: formProductChildren.control,
        name: 'barcode',
    })

    useEffect(() => {
        if (!barcodeValue) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setDisableBtnGenerate(false);
        }
    }, [barcodeValue])

    useEffect(() => {
        if (!barcodeValueChild) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setDisableBtnGenerateChild(false);
        }
    }, [barcodeValueChild])

    const currencyValue = useWatch({
        control: formProductFather.control,
        name: 'currency',
    });

    const showChildForm = isCreate && Boolean(isDetail);

    const childErrors = formProductChildren.formState.errors;

    const RequiredField = () => {
        return <span className="text-red-500">*</span>
    }

    const OptionalField = () => {
        return <span className="text-gray-500 text-sm font-normal">(Opcional)</span>
    }


    return (
        <form onSubmit={formProductFather.handleSubmit(onSubmit)} className="w-3/4 mx-auto mt-8 h-full grid grid-cols-3 gap-4 px-8 py-4 bg-white rounded-xl shadow-md">

            {product && isAddDetail && (
                <Field className="col-span-2">
                    <FieldLabel>Producto Padre</FieldLabel>
                    <Input disabled={true} value={`${product.barcode} - ${product.name} - ${product.price}${translateCurrency(product.currency)}`} />
                </Field>
            )}

            <Field className="col-span-1">
                <FieldLabel>Código</FieldLabel>
                <div className="flex items-center gap-2">
                    <Input {...formProductFather.register('barcode')} />
                    <Button type="button" disabled={disableBtnGenerate} variant="primary" onClick={() => generateBarcode(formProductFather, setDisableBtnGenerate)}>Generar</Button>
                </div>
            </Field>
            <Field className="col-span-1">
                <FieldLabel>Nombre</FieldLabel>
                <Input {...formProductFather.register('name')} />
            </Field>
            <Field className="col-span-1">
                <FieldLabel>Presentación {OptionalField()}</FieldLabel>
                <Input {...formProductFather.register('presentation')} />
            </Field>
            <Field className="col-span-1">
                <FieldLabel>Cantidad</FieldLabel>
                <Input type="number" step="0.01" {...formProductFather.register('stock', { valueAsNumber: true })} />
            </Field>
            <Field className="col-span-1">
                <FieldLabel>Precio {RequiredField()}</FieldLabel>
                <div className="flex items-center gap-2">
                    <Input
                        type="number"
                        step="0.01"
                        {...formProductFather.register('price', { valueAsNumber: true })}
                        onFocus={() => {
                            if (formProductFather.getValues('price') === 0) formProductFather.setValue('price', '' as unknown as number)
                        }}
                    />
                    {currencyValue && <span className="text-gray-500 font-medium">{translateCurrency(currencyValue as ExchangeRateType)}</span>}
                </div>
            </Field>
            <Controller
                name="currency"
                control={formProductFather.control}
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

            <div className="col-span-2 flex items-center justify-start gap-2">
                <Checkbox
                    id="product-detail-checkbox"
                    checked={isDetail}
                    onCheckedChange={(checked) => setIsDetail(checked === true)}
                />
                <p>Producto Detallado </p>
            </div>

            {showChildForm && (
                <div className="col-span-3 grid grid-cols-3 gap-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-4">
                    <Field className="col-span-1">
                        <FieldLabel>Código {RequiredField()}</FieldLabel>
                        <div className="flex items-center gap-2">
                            <Input {...formProductChildren.register('barcode', { required: 'El código es obligatorio' })} />
                            <Button type="button" disabled={disableBtnGenerateChild} variant="primary" onClick={() => generateBarcode(formProductChildren, setDisableBtnGenerateChild)}>Generar</Button>
                        </div>
                        {childErrors.barcode?.message && <span className="text-sm text-red-500">{childErrors.barcode.message}</span>}
                    </Field>
                    <Field className="col-span-1">
                        <FieldLabel>Nombre {RequiredField()}</FieldLabel>
                        <Input {...formProductChildren.register('name', { required: 'El nombre es obligatorio' })} />
                        {childErrors.name?.message && <span className="text-sm text-red-500">{childErrors.name.message}</span>}
                    </Field>
                    <Field className="col-span-1">
                        <FieldLabel>Presentacion {OptionalField()}</FieldLabel>
                        <Input {...formProductChildren.register('presentation')} />
                        {childErrors.name?.message && <span className="text-sm text-red-500">{childErrors.name.message}</span>}
                    </Field>
                    <Field className="col-span-1">
                        <FieldLabel>Precio {RequiredField()}</FieldLabel>
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                step="0.01"
                                {...formProductChildren.register('price', {
                                    valueAsNumber: true,
                                    validate: (value) => (value != null && !Number.isNaN(value)) || 'El precio es obligatorio',
                                })}
                                onFocus={() => {
                                    if (formProductChildren.getValues('price') === 0) formProductChildren.setValue('price', '' as unknown as number)
                                }}
                            />
                            {currencyValue && <span className="text-gray-500 font-medium">{translateCurrency(currencyValue as ExchangeRateType)}</span>}
                        </div>
                        {childErrors.price?.message && <span className="text-sm text-red-500">{childErrors.price.message}</span>}
                    </Field>
                    <Field className="col-span-1">
                        <FieldLabel>Cantidad</FieldLabel>
                        <Input type="number" step="0.01" {...formProductChildren.register('stock', { valueAsNumber: true })} />
                    </Field>
                </div>
            )}

            <Button
                variant="primary"
                type="submit"
                className="col-span-3"
                disabled={createProductMutation.isPending || updateProductMutation.isPending}
            >
                Guardar Producto
            </Button>
        </form>
    )
}