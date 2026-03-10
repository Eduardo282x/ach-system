import { Button } from "@/components/ui/button"
import { formatDate, formatNumberWithDecimal, formatOnlyTime } from "@/helpers/formatters";
import { useDispatchStore } from "@/store/dispatch.store";
import { useInventoryStore } from "@/store/inventory.store";
import { useMemo, useRef, useState } from "react";
import { FiShoppingCart } from "react-icons/fi";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { MdOutlinePayments } from "react-icons/md";
import { FaRegCreditCard } from "react-icons/fa6";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { IoAddCircleOutline } from "react-icons/io5";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { FaRegTrashCan } from "react-icons/fa6";
import { CiViewList } from "react-icons/ci";
import { Controller, useWatch, useForm } from "react-hook-form";
import type { DispatchBody } from "@/interfaces/distpatch.interface";
import { useCreateInvoiceMutation } from "@/hooks/dispatch.hook";
import { useAuthStore } from "@/store/auth.store";
import toast from "react-hot-toast";
import { PrintInvoice } from "./PrintInvoice";
import { useReactToPrint } from 'react-to-print';
import type { Client } from "@/interfaces/customer.interface";
import { flushSync } from "react-dom";
interface CardPayment {
    name: string;
    value: string;
    valueBs: string;
    variant: variantCardPayment;
}

interface Payments {
    typePayment: string;
    reference: string;
    amount: number;
    amountBs: number;
}

type variantCardPayment = 'primary' | 'secondary' | 'tertiary' | 'quaternary';

interface PaymentForm {
    typeSelected: string;
    reference: string;
    amount: string;
}

interface PaymentProps {
    customer?: Client | null;
}

export const Payment = ({ customer }: PaymentProps) => {
    const { total, totalUSD, productList, setProductList, setTotal, setTotalUSD } = useDispatchStore((state) => state)
    const { cashDrawerSession, cashier, user } = useAuthStore((state) => state);
    const exchangeRates = useInventoryStore((state) => state.exchangeRates);
    const createInvoiceMutation = useCreateInvoiceMutation();
    const [invoiceNumber, setInvoiceNumber] = useState<string>('');
    const componentRef = useRef<HTMLDivElement>(null);

    const [open, setOpen] = useState<boolean>(false);

    const typesPaymentState = useDispatchStore((state) => state.typesPayments);
    const typesPayment = useMemo(() => Array.isArray(typesPaymentState) ? typesPaymentState : [], [typesPaymentState]);
    const [payments, setPayments] = useState<Payments[]>([]);

    const { control, handleSubmit, reset } = useForm<PaymentForm>({
        defaultValues: {
            typeSelected: '',
            reference: '',
            amount: '',
        },
    });

    const typeSelected = useWatch({
        control,
        name: 'typeSelected',
    });

    const isCash = useMemo(() => {
        const selectedType = typesPayment.find((type) => type.id.toString() === typeSelected);
        return selectedType?.name.toLowerCase().includes('efectivo') || false;
    }, [typeSelected, typesPayment]);

    const usdRate = useMemo(() => {
        const usd = exchangeRates.find((rate) => rate.currency === 'USD');
        if (usd?.rate && usd.rate > 0) {
            return usd.rate;
        }

        if (totalUSD > 0) {
            return total / totalUSD;
        }

        return 1;
    }, [exchangeRates, total, totalUSD]);

    const totalPayedBs = useMemo(() => {
        return payments.reduce((acc, payment) => acc + payment.amountBs, 0);
    }, [payments]);

    const paymentProgress = total > 0 ? Math.min(totalPayedBs / total, 1) : 0;
    const totalPayedUSD = totalUSD * paymentProgress;
    const totalRestBs = Math.max(total - totalPayedBs, 0);
    const totalRestUSD = Math.max(totalUSD - totalPayedUSD, 0);
    const changeBs = Math.max(totalPayedBs - total, 0);
    const changeUSD = total > 0 ? (changeBs / total) * totalUSD : 0;

    const variantsStyles: Record<variantCardPayment, string> = {
        primary: 'bg-blue-100',
        secondary: 'bg-green-200',
        tertiary: 'bg-yellow-100',
        quaternary: 'bg-red-100',
    };

    const variantsStylesText: Record<variantCardPayment, string> = {
        primary: 'text-blue-800',
        secondary: 'text-green-800',
        tertiary: 'text-yellow-800',
        quaternary: 'text-red-800',
    };

    const cardsPayment: CardPayment[] = [
        { name: 'Total a Pagar', value: `${formatNumberWithDecimal(totalUSD)}`, valueBs: `${formatNumberWithDecimal(total)}`, variant: 'primary' },
        { name: 'Total Pagado', value: `${formatNumberWithDecimal(totalPayedUSD)}`, valueBs: `${formatNumberWithDecimal(totalPayedBs)}`, variant: 'secondary' },
        { name: 'Restante', value: `${formatNumberWithDecimal(totalRestUSD)}`, valueBs: `${formatNumberWithDecimal(totalRestBs)}`, variant: 'tertiary' },
        { name: 'Cambio/Vuelto', value: `${formatNumberWithDecimal(changeUSD)}`, valueBs: `${formatNumberWithDecimal(changeBs)}`, variant: 'quaternary' },
    ];

    const invoiceData = useMemo(() => {
        const now = new Date();
        return {
            invoiceNumber: invoiceNumber,
            date: formatDate(now),
            time: formatOnlyTime(now),
            cashier: cashier?.name || user?.name || '--',
            customer: {
                fullName: customer?.fullName || '--',
                identify: customer?.identify || '--',
                phone: customer?.phone || '--',
            },
            totals: {
                totalBs: total,
                totalUSD,
            },
            productsList: productList.map((product) => {

                const findExchangeRate = exchangeRates.find((rate) => rate.currency === product.currency);
                const exchangeRate = findExchangeRate ? findExchangeRate.rate : 1;

                const unitPrice = Number(product.price) * exchangeRate;

                const quantity = product.quantity ?? 0;
                const subtotal = product.subtotalBs ?? quantity * unitPrice;
                return {
                    id: product.id,
                    name: product.name,
                    quantity,
                    unitPrice,
                    subtotal,
                };
            }),
            payments: payments.map((payment) => ({
                typePayment: payment.typePayment,
                reference: payment.reference,
                amountBs: payment.amountBs,
                amountUSD: payment.amount,
            })),
        };
    }, [cashier?.name, customer?.fullName, customer?.identify, customer?.phone, payments, productList, total, totalUSD, invoiceNumber, user?.name, exchangeRates]);

    const openDialog = () => {
        setOpen(true);
    }

    const addPayment = (formData: PaymentForm) => {
        if (!formData.typeSelected) return;
        const amount = Number(formData.amount);
        if (!amount || amount <= 0) return;

        const selectedType = typesPayment.find((type) => type.id.toString() === formData.typeSelected);
        if (!selectedType) return;

        let amountBs = 0
        let amountUSD = 0

        const restBsBefore = Math.max(total - totalPayedBs, 0);
        const restUSDBefore = Math.max(totalUSD - totalPayedUSD, 0);

        if (selectedType.currency == 'BS') {
            amountBs = amount;
            if (restBsBefore > 0) {
                const proportionalUSD = (amountBs / restBsBefore) * restUSDBefore;
                amountUSD = Math.min(proportionalUSD, restUSDBefore);
            } else {
                amountUSD = 0;
            }
        } else {
            amountUSD = amount;
            amountBs = amount * (usdRate || 1);
        }

        setPayments((prevPayments) => [
            ...prevPayments,
            {
                typePayment: selectedType.name,
                amountBs: amountBs,
                amount: amountUSD,
                reference: formData.reference,
            },
        ]);

        reset({
            typeSelected: '',
            amount: '',
            reference: '',
        });
    }

    const removePayment = (index: number) => {
        setPayments((prevPayments) => prevPayments.filter((_, i) => i !== index));
    }

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: 'Factura',
        onAfterPrint: () => {
        }
    });

    const completePayment = () => {
        if (!customer?.id) {
            toast.error('Debe seleccionar un cliente para continuar');
            return;
        }

        if (!productList.length) {
            toast.error('Debe agregar productos para generar la factura');
            return;
        }

        if (!payments.length) {
            toast.error('Debe registrar al menos un pago');
            return;
        }

        // if (totalRestBs > -1) {
        //     toast.error('El pago aún no cubre el total de la compra');
        //     return;
        // }

        const usdRateValue = exchangeRates.find((rate) => rate.currency === 'USD')?.id ?? usdRate;
        const eurRateValue = exchangeRates.find((rate) => rate.currency === 'EUR')?.id ?? 0;
        // const sessionId = 3;
        const sessionId = cashDrawerSession ? Number(cashDrawerSession) : 0;

        if (!sessionId) {
            toast.error('No hay sesión/cajero seleccionado para registrar la factura');
            return;
        }

        const dispatchData: DispatchBody = {
            customerId: customer.id,
            sessionId,
            exchangeRateUsdId: usdRateValue,
            exchangeRateEurId: eurRateValue,
            items: productList.map((product) => ({
                productId: product.id,
                quantity: product.quantity ?? 1,
            })),
            payments: payments.map((payment) => {
                const type = typesPayment.find((type) => type.name === payment.typePayment);
                return {
                    paymentTypeId: type ? type.id : 0,
                    amountReceived: type?.currency === 'BS' ? payment.amountBs : payment.amount,
                    amountChange: 0,
                }
            }),
        }

        createInvoiceMutation.mutate(dispatchData, {
            onSuccess: (response) => {
                if (!response?.success) {
                    toast.error(response?.message || 'No se pudo registrar la factura');
                    return;
                }

                const receivedInvoiceNumber = response.data?.invoice?.invoiceNumber ?? '';
                flushSync(() => {
                    setInvoiceNumber(receivedInvoiceNumber);
                });

                handlePrint();

                setPayments([]);
                setProductList([]);
                setTotal(0);
                setTotalUSD(0);
                setOpen(false);
            },
            onError: () => {
                toast.error('Ocurrió un error al registrar la factura');
            },
        });
    }

    return (
        <div className='w-[20%] h-full rounded-xl border-2 border-gray-300 bg-gray-100 overflow-hidden'>
            {/* Imprimir factura */}
            <div className='hidden'>
                <PrintInvoice ref={componentRef} data={invoiceData} />
            </div>

            <div className='text-center text-xl bg-white font-semibold text-blue-800 py-2'>
                <p>Total</p>
            </div>

            <div className="flex items-center justify-end pr-4 h-[50%] mt-2">
                <div className="text-2xl text-right p-4 font-semibold">
                    <p>{formatNumberWithDecimal(total)} Bs</p>
                    <p>${formatNumberWithDecimal(totalUSD)}</p>
                </div>
                <Button variant='primary' disabled={total == 0} onClick={openDialog} className="h-full w-18"><FiShoppingCart className="size-8" /></Button>
            </div>


            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="w-3/4!">
                    <DialogHeader>
                        <DialogTitle>
                            <div className="flex items-center gap-2 text-2xl">
                                <div className="bg-green-100 p-2 rounded-md">
                                    <MdOutlinePayments className="text-green-800" />
                                </div>
                                Procesar Pago
                            </div>
                        </DialogTitle>

                    </DialogHeader>
                    <div className="grid grid-cols-4 gap-4">
                        {cardsPayment.map((card) => (
                            <div key={card.name} className={`px-4 py-2 rounded-md ${variantsStyles[card.variant]} ${variantsStylesText[card.variant]}`}>
                                <p className="font-semibold text-lg">{card.name}</p>
                                <p className="text-lg font-semibold  text-black">{card.valueBs} Bs</p>
                                <p className="font-semibold">{card.value} $</p>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-start justify-between h-80">
                        <div className="w-1/3 pr-4 h-full">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="bg-yellow-100 p-2 rounded-md">
                                    <FaRegCreditCard className="text-yellow-800" />
                                </div>
                                <p className="font-semibold text-lg">Métodos de pago</p>
                            </div>

                            <form onSubmit={handleSubmit(addPayment)} className="flex flex-col justify-between h-full">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Seleccione un método de pago: </Label>
                                        <Controller
                                            control={control}
                                            name="typeSelected"
                                            render={({ field }) => (
                                                <Select value={field.value} onValueChange={field.onChange}>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Seleccione un método de pago" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectGroup>
                                                            {typesPayment && typesPayment.map((option) => (
                                                                <SelectItem key={option.id} value={option.id.toString()}>{option.name}</SelectItem>
                                                            ))}
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                    </div>

                                    {!isCash && (
                                        <div className="space-y-2">
                                            <Label>Refencia:</Label>
                                            <Controller
                                                control={control}
                                                name="reference"
                                                render={({ field }) => (
                                                    <Input type="number" value={field.value} onChange={field.onChange} placeholder="Ingrese la referencia" />
                                                )}
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label>Monto a pagar:</Label>
                                        <Controller
                                            control={control}
                                            name="amount"
                                            render={({ field }) => (
                                                <Input type="number" step="0.01" value={field.value} onChange={field.onChange} placeholder="Ingrese el monto a pagar" />
                                            )}
                                        />
                                    </div>
                                </div>

                                <Button type="submit" disabled={totalRestBs <= 0} variant="primary" className="mt-4 flex items-center w-full text-lg" size='lg'><IoAddCircleOutline className="size-6" /> Agregar Pago</Button>
                            </form>
                        </div>
                        <div className="w-3/4 bg-gray-100 h-full p-4">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="bg-orange-200 p-2 rounded-md">
                                    <CiViewList className="text-orange-800" />
                                </div>
                                <p className="font-semibold text-lg">Pagos Agregados</p>
                            </div>

                            <div className="h-60 overflow-y-auto">
                                {payments.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-600">
                                        <CiViewList className="size-12 mb-4" />
                                        <p>No hay pagos agregados</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        {payments.map((payment, index) => (
                                            <div key={index} className="flex items-center justify-between bg-white p-2 rounded-md">
                                                <div>
                                                    <p>{payment.typePayment}</p>
                                                    <p className="text-sm text-gray-700">Ref: {payment.reference ? payment.reference : '--'}</p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <p className="text-lg">{formatNumberWithDecimal(payment.amountBs)} Bs</p>
                                                        <span className="text-sm text-gray-600">{formatNumberWithDecimal(payment.amount)} $</span>
                                                    </div>
                                                    <Button variant="destructive" size="sm" onClick={() => removePayment(index)}><FaRegTrashCan className="size-4" /></Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <div className="flex justify-end gap-2">
                            <Button variant="violet" disabled={createInvoiceMutation.isPending} className="text-lg flex items-center gap-3" size='lg' onClick={completePayment}><IoMdCheckmarkCircleOutline className="size-6" /> {createInvoiceMutation.isPending ? 'Procesando...' : 'Finalizar Venta'}</Button>
                        </div>
                    </DialogFooter>

                </DialogContent>
            </Dialog>
        </div>
    )
}
