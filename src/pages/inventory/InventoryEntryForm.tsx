import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { InventoryEntryBody, Product } from "@/interfaces/inventory.interface";
import type { Supplier } from "@/interfaces/suppliers.interface";
import { useCreateInventoryEntryMutation, useProductSearchQuery, useSupplierSearchQuery } from "@/hooks/inventory.hook";
import { formatNumberWithDecimal, formatOnlyDateStringFilter } from "@/helpers/formatters";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import toast from 'react-hot-toast';
import { FaRegTrashCan } from "react-icons/fa6";
import { IoIosSearch, IoMdAdd } from "react-icons/io";
import { ProductForm } from "./ProductForm";

interface InventoryEntryFormProps {
    closeForm: () => void;
}

interface EntryHeaderFields {
    controlNumber: string;
    title: string;
    description: string;
}

interface EntryDetail {
    productId: number;
    name: string;
    barcode: string;
    presentation: string;
    quantity: number;
    purchasePrice: number;
    iva: number;
    unitPrice: number;
}

const DEFAULT_IVA = 16;

const computeUnitPrice = (purchasePrice: number, iva: number): number => {
    const value = purchasePrice * (1 + iva / 100);
    return Number(value.toFixed(2));
};

export const InventoryEntryForm = ({ closeForm }: InventoryEntryFormProps) => {
    const createInventoryEntryMutation = useCreateInventoryEntryMutation();
    const [productSearch, setProductSearch] = useState("");
    const [supplierSearch, setSupplierSearch] = useState("");
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
    const [details, setDetails] = useState<EntryDetail[]>([]);
    const [date, setDate] = useState<Date>(new Date());
    const [globalIva, setGlobalIva] = useState<number>(DEFAULT_IVA);
    const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);

    const { data: searchData, isLoading: isSearching } = useProductSearchQuery(productSearch);
    const { data: supplierData, isLoading: isSearchingSuppliers } = useSupplierSearchQuery(supplierSearch);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<EntryHeaderFields>({
        defaultValues: {
            controlNumber: "",
            title: "",
            description: "",
        },
    });

    const addProduct = (product: Product) => {
        const purchasePrice = Number(product.price);
        setDetails((prev) => {
            const exists = prev.find((item) => item.productId === product.id);
            if (exists) {
                return prev.map((item) =>
                    item.productId === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [
                ...prev,
                {
                    productId: product.id,
                    name: product.name,
                    barcode: product.barcode,
                    presentation: product.presentation,
                    quantity: 1,
                    purchasePrice,
                    iva: globalIva,
                    unitPrice: computeUnitPrice(purchasePrice, globalIva),
                },
            ];
        });
        setProductSearch("");
    };

    const removeDetail = (productId: number) => {
        setDetails((prev) => prev.filter((item) => item.productId !== productId));
    };

    const changeDetail = (productId: number, field: "quantity" | "purchasePrice" | "iva", value: number) => {
        setDetails((prev) =>
            prev.map((item) => {
                if (item.productId !== productId) return item;
                const next = { ...item, [field]: value };
                if (field === "purchasePrice" || field === "iva") {
                    next.unitPrice = computeUnitPrice(next.purchasePrice, next.iva);
                }
                return next;
            })
        );
    };

    const updateGlobalIva = (value: number) => {
        setGlobalIva(value);
        setDetails((prev) =>
            prev.map((item) => ({
                ...item,
                iva: value,
                unitPrice: computeUnitPrice(item.purchasePrice, value),
            }))
        );
    };

    const selectSupplier = (supplier: Supplier) => {
        setSelectedSupplier(supplier);
        setSupplierSearch(supplier.name);
    };

    const onSubmit = async (header: EntryHeaderFields) => {
        if (details.length === 0) {
            toast.error("Debe agregar al menos un producto a la entrada.", {
                duration: 1500,
                position: 'top-right'
            });
            return;
        }

        const body: InventoryEntryBody = {
            controlNumber: header.controlNumber,
            title: header.title,
            description: header.description ?? "",
            date: formatOnlyDateStringFilter(date),
            details: details.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
            })),
        };

        const response = await createInventoryEntryMutation.mutateAsync(body);

        if (response.data != null && response.success) {
            toast.success("Entrada de inventario creada correctamente.", {
                duration: 2000,
                position: 'top-right'
            });
            reset();
            setDetails([]);
            setSelectedSupplier(null);
            setSupplierSearch("");
            closeForm();
            return;
        }

        toast.error(response.message || "No se pudo crear la entrada de inventario.", {
            duration: 2000,
            position: 'top-right'
        });
    };

    const products = searchData?.products ?? [];
    const suppliers = supplierData?.suppliers ?? [];

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="w-3/4 mx-auto mt-8 h-full grid grid-cols-3 gap-4 px-8 py-4 bg-white rounded-xl shadow-md">
            <Field className="col-span-1">
                <FieldLabel>N° de Control <span className="text-red-500">*</span></FieldLabel>
                <Input
                    placeholder="ENT-000002"
                    {...register('controlNumber', { required: 'El número de control es obligatorio' })}
                />
                {errors.controlNumber?.message && <span className="text-sm text-red-500">{errors.controlNumber.message}</span>}
            </Field>

            <Field className="col-span-1">
                <FieldLabel>Título <span className="text-red-500">*</span></FieldLabel>
                <Input
                    placeholder="Compra proveedor"
                    {...register('title', { required: 'El título es obligatorio' })}
                />
                {errors.title?.message && <span className="text-sm text-red-500">{errors.title.message}</span>}
            </Field>

            <Field className="col-span-1">
                <FieldLabel>Fecha <span className="text-red-500">*</span></FieldLabel>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start font-normal pl-3">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP", { locale: es }) : <span>Selecciona una fecha</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={(selectedDate) => {
                                if (selectedDate) {
                                    setDate(selectedDate);
                                }
                            }}
                            defaultMonth={date}
                            disabled={{ after: new Date() }}
                            locale={es}
                        />
                    </PopoverContent>
                </Popover>
            </Field>

            <Field className="col-span-2">
                <FieldLabel>Proveedor <span className="text-gray-500 text-sm font-normal">(Opcional)</span></FieldLabel>
                <div className="relative">
                    <div className="relative">
                        <Input
                            placeholder="Buscar proveedor..."
                            className="w-full"
                            value={supplierSearch}
                            onChange={(event) => {
                                setSupplierSearch(event.target.value);
                                if (event.target.value !== selectedSupplier?.name) {
                                    setSelectedSupplier(null);
                                }
                            }}
                        />
                        {isSearchingSuppliers && (
                            <div className="absolute top-2.5 right-3 text-sm text-gray-400">
                                <Spinner />
                            </div>
                        )}
                    </div>

                    {supplierSearch.trim() !== '' && (
                        <div className="absolute top-11 w-full left-0 border-2 border-gray-300 rounded-md bg-white shadow-md z-50">
                            {suppliers.length > 0 ? suppliers.map((supplier) => (
                                <div
                                    key={supplier.id}
                                    onClick={() => selectSupplier(supplier)}
                                    className="text-sm flex items-center justify-between p-2 border-b last:border-0 hover:bg-gray-100 cursor-pointer"
                                >
                                    <div>
                                        <p className="font-semibold">{supplier.name}</p>
                                        {supplier.identify && <p><span className="font-semibold">Identificación:</span> {supplier.identify}</p>}
                                    </div>
                                </div>
                            )) : (
                                <p className="text-center p-4 text-gray-500">No se encontraron proveedores</p>
                            )}
                        </div>
                    )}
                </div>
            </Field>

            <Field className="col-span-1">
                <FieldLabel>IVA % Fijo</FieldLabel>
                <Input
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full"
                    value={globalIva}
                    onChange={(event) => updateGlobalIva(Number(event.target.value))}
                />
            </Field>

            <Field className="col-span-3">
                <FieldLabel>Descripción <span className="text-gray-500 text-sm font-normal">(Opcional)</span></FieldLabel>
                <Textarea placeholder="Mercancía recibida..." {...register('description')} />
            </Field>

            <div className="col-span-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-4 grid grid-cols-1 gap-4">
                <div className="relative">
                    <div className="relative">
                        <div className="absolute top-2 left-2 text-xl text-gray-400">
                            <IoIosSearch />
                        </div>
                        <Input
                            placeholder="Buscar producto por nombre o código..."
                            className="pl-9 w-full"
                            value={productSearch}
                            onChange={(event) => setProductSearch(event.target.value)}
                        />
                        {isSearching && (
                            <div className="absolute top-2.5 right-3 text-sm text-gray-400">
                                <Spinner />
                            </div>
                        )}
                    </div>

                    {productSearch.trim() !== '' && (
                        <div className="absolute top-11 w-full left-0 border-2 border-gray-300 rounded-md bg-white shadow-md z-50">
                            {products.length > 0 ? products.map((product) => (
                                <div
                                    key={product.id}
                                    onClick={() => addProduct(product)}
                                    className="text-sm flex items-center justify-between p-2 border-b last:border-0 hover:bg-gray-100 cursor-pointer"
                                >
                                    <div>
                                        <p className="font-semibold">{product.name} - {product.presentation}</p>
                                        <p><span className="font-semibold">Precio:</span> {formatNumberWithDecimal(product.price)} | Stock: {product.stock}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 w-32 truncate">{product.barcode}</p>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-center p-4 text-gray-500">No se encontraron productos</p>
                            )}
                            <div className="border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setProductSearch("");
                                        setIsProductDialogOpen(true);
                                    }}
                                    className="w-full text-sm flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer text-blue-700 font-semibold"
                                >
                                    <IoMdAdd /> Crear nuevo producto
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="overflow-x-auto rounded-md border bg-white">
                    <div className="flex items-center gap-3 p-2 border-b-2 text-sm font-semibold min-w-[56rem]">
                        <p className="w-32 shrink-0">Código</p>
                        <p className="min-w-0 flex-1">Producto</p>
                        <p className="w-20 shrink-0 text-center">Cantidad</p>
                        <p className="w-28 shrink-0 text-right">Precio de compra</p>
                        <p className="w-20 shrink-0 text-center">IVA %</p>
                        <p className="w-28 shrink-0 text-right">Precio</p>
                        <p className="w-28 shrink-0 text-right">Subtotal</p>
                        <p className="w-10 shrink-0"></p>
                    </div>

                    {details.length === 0 ? (
                        <p className="text-center py-8 text-gray-500 text-sm">No hay productos agregados</p>
                    ) : (
                        details.map((detail) => (
                            <div key={detail.productId} className="flex items-center gap-3 p-2 border-b-2 last:border-0 text-sm min-w-[56rem]">
                                <p className="w-32 shrink-0 truncate">{detail.barcode}</p>
                                <p className="min-w-0 flex-1 truncate">{detail.name} - {detail.presentation}</p>
                                <div className="w-20 shrink-0 text-center">
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        className="h-8 w-16 mx-auto text-center"
                                        value={detail.quantity}
                                        onChange={(event) => changeDetail(detail.productId, "quantity", Number(event.target.value))}
                                    />
                                </div>
                                <div className="w-28 shrink-0 text-right">
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className="h-8 w-24 ml-auto text-right"
                                        value={detail.purchasePrice}
                                        onChange={(event) => changeDetail(detail.productId, "purchasePrice", Number(event.target.value))}
                                    />
                                </div>
                                <div className="w-20 shrink-0 text-center">
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className="h-8 w-16 mx-auto text-center"
                                        value={detail.iva}
                                        onChange={(event) => changeDetail(detail.productId, "iva", Number(event.target.value))}
                                    />
                                </div>
                                <div className="w-28 shrink-0 text-right">
                                    <Input
                                        type="number"
                                        step="0.01"
                                        className="h-8 w-24 ml-auto text-right"
                                        value={detail.unitPrice}
                                        disabled
                                    />
                                </div>
                                <p className="w-28 shrink-0 text-right font-semibold">
                                    {formatNumberWithDecimal((detail.quantity || 0) * (detail.unitPrice || 0))}
                                </p>
                                <div className="w-10 shrink-0 text-center">
                                    <Button variant="ghost" size="icon-sm" onClick={() => removeDetail(detail.productId)}>
                                        <FaRegTrashCan className="text-red-600" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <Button
                variant="primary"
                type="submit"
                className="col-span-3"
                disabled={createInventoryEntryMutation.isPending}
            >
                {createInventoryEntryMutation.isPending ? <Spinner /> : 'Guardar Entrada'}
            </Button>

            <Dialog open={isProductDialogOpen} onOpenChange={(open) => !open && setIsProductDialogOpen(false)}>
                <DialogContent className="max-w-4xl sm:w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Nuevo Producto</DialogTitle>
                        <DialogDescription>Completa los datos para crear un nuevo producto.</DialogDescription>
                    </DialogHeader>
                    <ProductForm
                        isFull={true}
                        mode="create"
                        product={null}
                        closeForm={() => setIsProductDialogOpen(false)}
                        onCreated={(product) => {
                            addProduct(product);
                            setIsProductDialogOpen(false);
                        }}
                    />
                </DialogContent>
            </Dialog>
        </form>
    );
}
