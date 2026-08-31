import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { InventoryEntryBody, Product } from "@/interfaces/inventory.interface";
import { useCreateInventoryEntryMutation, useProductSearchQuery } from "@/hooks/inventory.hook";
import { formatNumberWithDecimal, formatOnlyDateStringFilter } from "@/helpers/formatters";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import toast from 'react-hot-toast';
import { FaRegTrashCan } from "react-icons/fa6";
import { IoIosSearch } from "react-icons/io";

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
    unitPrice: number;
}

export const InventoryEntryForm = ({ closeForm }: InventoryEntryFormProps) => {
    const createInventoryEntryMutation = useCreateInventoryEntryMutation();
    const [productSearch, setProductSearch] = useState("");
    const [details, setDetails] = useState<EntryDetail[]>([]);
    const [date, setDate] = useState<Date>(new Date());

    const { data: searchData, isLoading: isSearching } = useProductSearchQuery(productSearch);

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
                    unitPrice: Number(product.price),
                },
            ];
        });
        setProductSearch("");
    };

    const removeDetail = (productId: number) => {
        setDetails((prev) => prev.filter((item) => item.productId !== productId));
    };

    const changeDetail = (productId: number, field: "quantity" | "unitPrice", value: number) => {
        setDetails((prev) =>
            prev.map((item) => (item.productId === productId ? { ...item, [field]: value } : item))
        );
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
            closeForm();
            return;
        }

        toast.error(response.message || "No se pudo crear la entrada de inventario.", {
            duration: 2000,
            position: 'top-right'
        });
    };

    const products = searchData?.products ?? [];

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
                        </div>
                    )}
                </div>

                <div className="overflow-x-auto rounded-md border bg-white">
                    <div className="flex items-center gap-3 p-2 border-b-2 text-sm font-semibold min-w-[40rem]">
                        <p className="w-32 shrink-0">Código</p>
                        <p className="min-w-0 flex-1">Producto</p>
                        <p className="w-24 shrink-0 text-center">Cantidad</p>
                        <p className="w-28 shrink-0 text-right">Precio</p>
                        <p className="w-28 shrink-0 text-right">Subtotal</p>
                        <p className="w-10 shrink-0"></p>
                    </div>

                    {details.length === 0 ? (
                        <p className="text-center py-8 text-gray-500 text-sm">No hay productos agregados</p>
                    ) : (
                        details.map((detail) => (
                            <div key={detail.productId} className="flex items-center gap-3 p-2 border-b-2 last:border-0 text-sm min-w-[40rem]">
                                <p className="w-32 shrink-0 truncate">{detail.barcode}</p>
                                <p className="min-w-0 flex-1 truncate">{detail.name} - {detail.presentation}</p>
                                <div className="w-24 shrink-0 text-center">
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        className="h-8 w-20 mx-auto text-center"
                                        value={detail.quantity}
                                        onChange={(event) => changeDetail(detail.productId, "quantity", Number(event.target.value))}
                                    />
                                </div>
                                <div className="w-28 shrink-0 text-right">
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        className="h-8 w-24 ml-auto text-right"
                                        value={detail.unitPrice}
                                        onChange={(event) => changeDetail(detail.productId, "unitPrice", Number(event.target.value))}
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
        </form>
    );
}