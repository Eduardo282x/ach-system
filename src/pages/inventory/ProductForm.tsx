import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ExchangeRateType, Product, ProductBody, ProductUpdateBody } from "@/interfaces/inventory.interface";
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
    isFull: boolean;
    mode: ProductFormMode;
    product: Product | null;
    closeForm: () => void;
    onCreated?: (product: Product) => void;
}

const defaultFatherValues: ProductBody = {
    name: '',
    presentation: '',
    barcode: '',
    price: 0,
    purchasePrice: 0,
    currency: 'USD',
    stock: 0,
    isDetail: false,
    parentId: null,
    unitsDetail: 1,
};

const defaultChildValues: ProductBody = {
    name: '',
    presentation: 'Detal',
    barcode: '',
    price: 0,
    purchasePrice: 0,
    currency: 'USD',
    stock: 0,
    isDetail: true,
    parentId: null,
    unitsDetail: null,
};

const computeUnitsDetail = (value: unknown, fallback = 1) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 1) {
        const safeFallback = Number(fallback);
        return Number.isFinite(safeFallback) && safeFallback >= 1 ? Math.floor(safeFallback) : 1;
    }
    return Math.floor(parsed);
};

export const ProductForm = ({ isFull, mode, product, closeForm, onCreated }: ProductFormProps) => {
    const createProductMutation = useCreateProductMutation();
    const updateProductMutation = useUpdateProductMutation();
    const [disableBtnGenerate, setDisableBtnGenerate] = useState(false);
    const [disableBtnGenerateChild, setDisableBtnGenerateChild] = useState(false);
    const isAddDetail = mode === "addDetail";
    const isCreate = mode === "create";
    const isEdit = mode === "edit" && product != null;
    const isEditChild = isEdit && product.parentId != null;
    const isEditParent = isEdit && !isEditChild;
    const existingChild = product?.productChild?.[0] ?? null;
    const isParentWithChild = isEditParent && existingChild != null;
    const isExistingChild = isEditParent && existingChild != null;
    const [isDetail, setIsDetail] = useState<boolean>(
        () => mode === "addDetail" || product?.parentId != null || (product?.productChild?.length ?? 0) > 0,
    );

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

    const onSubmit = async (formData: ProductBody) => {
        // Agregar un detalle a un padre ya registrado.
        if (isAddDetail && product) {
            const unitsDetail = computeUnitsDetail(formProductFather.getValues('unitsDetail'), 1);
            const payload: ProductUpdateBody = {
                unitsDetail,
                child: {
                    name: formData.name,
                    presentation: formData.presentation,
                    barcode: formData.barcode,
                    price: formData.price,
                    purchasePrice: formData.purchasePrice ?? 0,
                    stock: formData.stock,
                },
            };

            const response = await updateProductMutation.mutateAsync({
                id: product.id,
                data: payload,
            });

            if (response.data != null && response.success) {
                toast.success("Producto detalle agregado correctamente", {
                    duration: 1500,
                    position: 'top-right'
                });
                onCreated?.(response.data);
                closeForm();
                resetForms();
            } else {
                toast.error(response.message || "No se pudo agregar el producto detalle", {
                    duration: 2000,
                    position: 'top-right'
                });
            }
            return;
        }

        // Editar un producto que ya es detalle.
        if (isEditChild && product) {
            const payload: ProductUpdateBody = {
                name: formData.name,
                presentation: formData.presentation,
                barcode: formData.barcode,
                price: formData.price,
                purchasePrice: formData.purchasePrice ?? 0,
                currency: formData.currency,
                stock: formData.stock,
                isDetail: true,
                parentId: product.parentId ?? null,
                unitsDetail: null,
            };

            const response = await updateProductMutation.mutateAsync({
                id: product.id,
                data: payload,
            });

            if (response.data != null && response.success) {
                toast.success("Producto actualizado correctamente", {
                    duration: 1500,
                    position: 'top-right'
                });
                closeForm();
                resetForms();
            } else {
                toast.error(response.message || "No se pudo actualizar el producto", {
                    duration: 2000,
                    position: 'top-right'
                });
            }
            return;
        }

        // Editar un producto padre, con o sin detalle asociado.
        if (isEditParent && product) {
            if (showChildForm) {
                const isValidChild = await formProductChildren.trigger();
                if (!isValidChild) return;
            }

            const childData = showChildForm ? formProductChildren.getValues() : null;
            const unitsDetail = computeUnitsDetail(formData.unitsDetail, product.unitsDetail ?? 1);
            const payload: ProductUpdateBody = {
                name: formData.name,
                presentation: formData.presentation,
                barcode: formData.barcode,
                price: formData.price,
                purchasePrice: formData.purchasePrice ?? 0,
                currency: formData.currency,
                stock: formData.stock,
                isDetail,
                parentId: null,
                unitsDetail: isDetail ? unitsDetail : null,
            };

            if (isDetail && childData) {
                payload.child = {
                    ...(existingChild ? { id: existingChild.id } : {}),
                    name: childData.name,
                    presentation: childData.presentation,
                    barcode: childData.barcode,
                    price: childData.price,
                    purchasePrice: childData.purchasePrice ?? 0,
                    stock: childData.stock,
                };
            }

            const response = await updateProductMutation.mutateAsync({
                id: product.id,
                data: payload,
            });

            if (response.data != null && response.success) {
                toast.success("Producto actualizado correctamente", {
                    duration: 1500,
                    position: 'top-right'
                });
                closeForm();
                resetForms();
            } else {
                toast.error(response.message || "No se pudo actualizar el producto", {
                    duration: 2000,
                    position: 'top-right'
                });
            }
            return;
        }

        // Crear un producto padre sin detalle.
        if (!isDetail) {
            const body: ProductBody = {
                ...formData,
                parentId: null,
                isDetail: false,
                unitsDetail: null,
            };

            const response = await createProductMutation.mutateAsync(body);

            if (response.data != null && response.success) {
                onCreated?.(response.data);
                closeForm();
                resetForms();
            } else {
                toast.error(response.message || "No se pudo crear el producto", {
                    duration: 2000,
                    position: 'top-right'
                });
            }
            return;
        }

        // Crear un producto padre junto con su detalle.
        const isValidChild = await formProductChildren.trigger();
        if (!isValidChild) return;

        const childData = formProductChildren.getValues();
        const childStock = Number.isFinite(Number(childData.stock)) ? Number(childData.stock) : 0;
        const unitsDetail = computeUnitsDetail(formData.unitsDetail, childStock || 1);

        const fatherResponse = await createProductMutation.mutateAsync({
            ...formData,
            parentId: null,
            isDetail: false,
            unitsDetail,
        });

        if (fatherResponse.data == null || !fatherResponse.success) {
            toast.error(fatherResponse.message || "No se pudo crear el producto padre", {
                duration: 2000,
                position: 'top-right'
            });
            return;
        }

        const childResponse = await createProductMutation.mutateAsync({
            ...childData,
            parentId: fatherResponse.data.id,
            isDetail: true,
            unitsDetail: null,
            currency: formData.currency,
            stock: childStock,
        });

        if (childResponse.data == null || !childResponse.success) {
            toast.error(
                childResponse.message ||
                "El producto padre fue creado, pero ocurrió un error al crear el producto detallado.",
                {
                    duration: 2000,
                    position: 'top-right'
                }
            );
            return;
        }

        onCreated?.(fatherResponse.data);
        closeForm();
        resetForms();
    }

    const { reset: resetFatherForm } = formProductFather;
    const { reset: resetChildrenForm } = formProductChildren;

    useEffect(() => {
        if (mode === "edit" && product) {
            // El producto seleccionado es un detalle: se edita con el formulario principal.
            if (product.parentId != null) {
                resetFatherForm({
                    name: product.name,
                    presentation: product.presentation,
                    barcode: product.barcode,
                    price: Number(product.price),
                    purchasePrice: Number(product.purchasePrice ?? 0),
                    currency: product.currency,
                    stock: Number(product.stock),
                    isDetail: true,
                    parentId: product.parentId,
                    unitsDetail: null,
                });
                resetChildrenForm(defaultChildValues);
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setIsDetail(true);
                return;
            }

            // El producto seleccionado es un padre. Se precarga su detalle si existe.
            resetFatherForm({
                name: product.name,
                presentation: product.presentation,
                barcode: product.barcode,
                price: Number(product.price),
                purchasePrice: Number(product.purchasePrice ?? 0),
                currency: product.currency,
                stock: Number(product.stock),
                isDetail: false,
                parentId: null,
                unitsDetail: product.unitsDetail ?? 1,
            });

            const child = product.productChild?.[0];
            if (child) {
                resetChildrenForm({
                    name: child.name,
                    presentation: child.presentation,
                    barcode: child.barcode,
                    price: Number(child.price),
                    purchasePrice: Number(child.purchasePrice ?? 0),
                    currency: child.currency,
                    stock: Number(child.stock),
                    isDetail: true,
                    parentId: product.id,
                    unitsDetail: null,
                });
                setIsDetail(true);
            } else {
                resetChildrenForm(defaultChildValues);
                setIsDetail(false);
            }
            return;
        }

        if (mode === "addDetail" && product) {
            resetFatherForm({
                ...defaultFatherValues,
                currency: product.currency,
                unitsDetail: product.unitsDetail ?? 1,
            });
            resetChildrenForm({
                ...defaultChildValues,
                currency: product.currency,
            });
            setIsDetail(true);
            return;
        }

        resetFatherForm(defaultFatherValues);
        resetChildrenForm(defaultChildValues);
        setIsDetail(false);
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

    const childStockValue = useWatch({
        control: formProductChildren.control,
        name: 'stock',
    });

    // Al crear un detalle nuevo, usamos el stock inicial del hijo como
    // valor sugerido para las unidades por detalle.
    useEffect(() => {
        const canSuggestUnits = isCreate || (isEditParent && !isExistingChild);
        if (!canSuggestUnits || !isDetail) return;

        const stock = Number(childStockValue);
        if (Number.isFinite(stock) && stock > 0) {
            formProductFather.setValue('unitsDetail', Math.max(1, Math.floor(stock)));
        }
    }, [childStockValue, isCreate, isDetail, isEditParent, isExistingChild, formProductFather]);

    const showChildForm = isAddDetail || ((isCreate || isEditParent) && isDetail);
    const parentForDisplay = isAddDetail ? product : (isEditChild ? product?.productParent ?? null : null);

    const childErrors = formProductChildren.formState.errors;

    const RequiredField = () => {
        return <span className="text-red-500">*</span>
    }

    const OptionalField = () => {
        return <span className="text-gray-500 text-sm font-normal">(Opcional)</span>
    }

    const submitForm = isAddDetail ? formProductChildren : formProductFather;

    return (
        <form onSubmit={submitForm.handleSubmit(onSubmit)} className={`${isFull ? 'w-full' : 'w-3/4 px-8 py-4  rounded-xl shadow-md'} mx-auto mt-8 h-full grid grid-cols-3 gap-4 bg-white`}>

            {(isAddDetail || isEditChild) && parentForDisplay && (
                <Field className="col-span-2">
                    <FieldLabel>Producto Padre</FieldLabel>
                    <Input disabled={true} value={`${parentForDisplay.barcode} - ${parentForDisplay.name} - ${parentForDisplay.price}${translateCurrency(parentForDisplay.currency)}`} />
                </Field>
            )}

            {!isAddDetail && (
                <>
                    <Field className="col-span-1">
                        <FieldLabel>Código</FieldLabel>
                        <div className="flex items-center gap-2">
                            <Input {...formProductFather.register('barcode')} disabled={isEdit} />
                            <Button type="button" disabled={disableBtnGenerate || isEdit} variant="primary" onClick={() => generateBarcode(formProductFather, setDisableBtnGenerate)}>Generar</Button>
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
                        <Input
                            type="number"
                            step="0.01"
                            {...formProductFather.register('stock', {
                                setValueAs: (value) => (value === '' || value === null || value === undefined ? 0 : Number(value)),
                            })}
                            disabled={isEdit}
                        />
                    </Field>
                    <Field className="col-span-1">
                        <FieldLabel>Precio de Compra {OptionalField()}</FieldLabel>
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                step="0.01"
                                min="0"
                                {...formProductFather.register('purchasePrice', {
                                    setValueAs: (value) => (value === '' || value === null || value === undefined ? 0 : Number(value)),
                                })}
                            />
                            {currencyValue && <span className="text-gray-500 font-medium">{translateCurrency(currencyValue as ExchangeRateType)}</span>}
                        </div>
                    </Field>
                    <Field className="col-span-1">
                        <FieldLabel>Precio de Venta {RequiredField()}</FieldLabel>
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
                                    disabled={isEdit}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccione una moneda" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="USD">Dolares</SelectItem>
                                            {import.meta.env.VITE_IGNORE_EUR !== 'true' && (
                                                <SelectItem value={'EUR'}>Euro</SelectItem>
                                            )}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </Field>
                        )}>
                    </Controller>

                    <div className="col-span-2 flex items-center justify-start gap-2">
                        <Checkbox
                            id="product-detail-checkbox"
                            checked={isEditChild || isDetail}
                            disabled={isEditChild || isParentWithChild}
                            onCheckedChange={(checked) => setIsDetail(checked === true)}
                        />
                        <p>Producto Detallado </p>
                    </div>
                </>
            )}

            {showChildForm && (
                <div className="col-span-3 grid grid-cols-3 gap-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-4">
                    <div className="col-span-3 text-sm font-semibold text-gray-600">
                        {isExistingChild ? 'Producto detalle asociado' : 'Nuevo producto detalle'}
                    </div>
                    <Field className="col-span-1">
                        <FieldLabel>Código {RequiredField()}</FieldLabel>
                        <div className="flex items-center gap-2">
                            <Input
                                {...formProductChildren.register('barcode', { required: 'El código es obligatorio' })}
                                disabled={isExistingChild}
                            />
                            <Button
                                type="button"
                                disabled={disableBtnGenerateChild || isExistingChild}
                                variant="primary"
                                onClick={() => generateBarcode(formProductChildren, setDisableBtnGenerateChild)}
                            >Generar</Button>
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
                    </Field>
                    <Field className="col-span-1">
                        <FieldLabel>Precio de Compra {OptionalField()}</FieldLabel>
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                step="0.01"
                                min="0"
                                {...formProductChildren.register('purchasePrice', {
                                    setValueAs: (value) => (value === '' || value === null || value === undefined ? 0 : Number(value)),
                                })}
                            />
                            {currencyValue && <span className="text-gray-500 font-medium">{translateCurrency(currencyValue as ExchangeRateType)}</span>}
                        </div>
                    </Field>
                    <Field className="col-span-1">
                        <FieldLabel>Precio de Venta {RequiredField()}</FieldLabel>
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
                        <FieldLabel>Unidades por detalle {RequiredField()}</FieldLabel>
                        <Input
                            type="number"
                            step="0.01"
                            {...formProductChildren.register('stock', {
                                setValueAs: (value) => (value === '' || value === null || value === undefined ? 0 : Number(value)),
                            })}
                            disabled={isExistingChild}
                        />
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
