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
import type { ExchangeRateType } from "@/interfaces/inventory.interface";
interface CardPayment {
    name: string;
    value: string;
    valueBs: string;
    variant: variantCardPayment;
}

interface Payments {
    paymentTypeId: number;
    typePayment: string;
    currency: ExchangeRateType;
    reference: string;
    amount: number;
    amountBs: number;
    change: number;
}

type variantCardPayment = 'primary' | 'secondary' | 'tertiary' | 'quaternary';

interface PaymentForm {
    typeSelected: string;
    reference: string;
    amount: string;
}

interface PaymentProps {
    customer?: Client | null;
    onCompleteSale?: () => void;
}

const PAYMENT_EPSILON = 0.0001;

const normalizeDecimalInput = (value: string) => {
    const sanitized = value.replace(/[^0-9.]/g, '');
    const [integerPart, ...decimalParts] = sanitized.split('.');

    if (decimalParts.length === 0) {
        return integerPart;
    }

    return `${integerPart}.${decimalParts.join('')}`;
};

export const Payment = ({ customer, onCompleteSale }: PaymentProps) => {
    const { total, totalUSD, productList, setProductList, setTotal, setTotalUSD } = useDispatchStore((state) => state)
    const { cashDrawerSession, cashier, user } = useAuthStore((state) => state);
    const exchangeRates = useInventoryStore((state) => state.exchangeRates);
    const createInvoiceMutation = useCreateInvoiceMutation();
    const [invoiceNumber, setInvoiceNumber] = useState<string>('');
    const componentRef = useRef<HTMLDivElement>(null);

    const [open, setOpen] = useState<boolean>(false);
    const [openChangeDialog, setOpenChangeDialog] = useState<boolean>(false);
    const [changeDeliveredUSDInput, setChangeDeliveredUSDInput] = useState<string>('0');

    const typesPaymentState = useDispatchStore((state) => state.typesPayments);
    const typesPayment = useMemo(() => Array.isArray(typesPaymentState) ? typesPaymentState : [], [typesPaymentState]);
    const [payments, setPayments] = useState<Payments[]>([]);

    const { setValue, control, handleSubmit, reset } = useForm<PaymentForm>({
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

    const currentUsdRate = usdRate || 1;

    const {
        totalPayedBs,
        totalPayedUSD,
        totalRestBs,
        totalRestUSD,
        changeBs,
        changeUSD,
    } = useMemo(() => {
        const paidBsRaw = payments.reduce((acc, payment) => acc + payment.amountBs, 0);
        const restBs = Math.max(total - paidBsRaw, 0);
        const restUSD = restBs / currentUsdRate;
        const changeBsValue = Math.max(paidBsRaw - total, 0);
        const changeUSDValue = changeBsValue / currentUsdRate;

        return {
            totalPayedBs: paidBsRaw,
            totalPayedUSD: paidBsRaw / currentUsdRate,
            totalRestBs: restBs,
            totalRestUSD: restUSD,
            changeBs: changeBsValue,
            changeUSD: changeUSDValue,
        };
    }, [currentUsdRate, payments, total]);

    const isPaymentComplete = useMemo(() => {
        return totalRestBs <= PAYMENT_EPSILON;
    }, [totalRestBs]);

    const requiredChangeUSD = useMemo(() => {
        return changeUSD > PAYMENT_EPSILON ? changeUSD : 0;
    }, [changeUSD]);

    const changeDeliveredUSD = useMemo(() => {
        const parsedValue = Number(changeDeliveredUSDInput);
        if (!Number.isFinite(parsedValue) || parsedValue < 0) {
            return 0;
        }

        return parsedValue;
    }, [changeDeliveredUSDInput]);

    const changeDeliveredBs = useMemo(() => {
        const remainingChangeUSD = Math.max(requiredChangeUSD - changeDeliveredUSD, 0);
        return remainingChangeUSD * currentUsdRate;
    }, [changeDeliveredUSD, currentUsdRate, requiredChangeUSD]);

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
                currency: payment.currency,
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

        const isSelectedTypeCash = selectedType.name.toLowerCase().includes('efectivo');
        const requiresReference = !isSelectedTypeCash;
        const normalizedReference = formData.reference.trim();

        if (requiresReference && !normalizedReference) {
            toast.error('Debe ingresar la referencia para este método de pago');
            return;
        }

        let amountBs = 0
        let amountUSD = 0

        if (selectedType.currency == 'BS') {
            amountBs = amount;
            amountUSD = amountBs / currentUsdRate;
        } else {
            amountUSD = amount;
            amountBs = amount * currentUsdRate;
        }

        setPayments((prevPayments) => {
            const paymentIndex = prevPayments.findIndex((payment) => {
                if (payment.paymentTypeId !== selectedType.id) return false;
                if (!requiresReference) return true;
                return payment.reference.trim() === normalizedReference;
            });

            if (paymentIndex === -1) {
                return [
                    ...prevPayments,
                    {
                        paymentTypeId: selectedType.id,
                        typePayment: selectedType.name,
                        currency: selectedType.currency,
                        amountBs: amountBs,
                        amount: amountUSD,
                        reference: normalizedReference,
                        change: 0
                    },
                ];
            }

            return prevPayments.map((payment, index) => {
                if (index !== paymentIndex) return payment;

                return {
                    ...payment,
                    amountBs: payment.amountBs + amountBs,
                    amount: payment.amount + amountUSD,
                };
            });
        });

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

    const submitInvoice = (paymentsToSend: Payments[] = payments) => {
        if (!customer?.id) {
            toast.error('Debe seleccionar un cliente para continuar');
            return;
        }

        if (!productList.length) {
            toast.error('Debe agregar productos para generar la factura');
            return;
        }

        if (!paymentsToSend.length) {
            toast.error('Debe registrar al menos un pago');
            return;
        }

        if (!isPaymentComplete) {
            toast.error('El pago aún no cubre el total de la compra');
            return;
        }

        console.log(exchangeRates);
        

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
            payments: paymentsToSend.map((payment) => {
                const raw = payment.currency === 'BS' ? payment.amountBs : payment.amount;
                return {
                    paymentTypeId: payment.paymentTypeId,
                    amountReceived: Math.round(raw * 100) / 100,
                    amountChange: Math.round((payment.change ?? 0) * 100) / 100,
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
                onCompleteSale?.();
            },
            onError: () => {
                toast.error('Ocurrió un error al registrar la factura');
            },
        });
    }

    const completePayment = () => {
        const hasChange = changeBs > PAYMENT_EPSILON || changeUSD > PAYMENT_EPSILON;

        const allPaymentsAreCash = payments.every((payment) => {
            const type = typesPayment.find((t) => t.id === payment.paymentTypeId);
            return type?.name.toLowerCase().includes('efectivo');
        });

        if (hasChange && allPaymentsAreCash) {
            setChangeDeliveredUSDInput('0');
            setOpenChangeDialog(true);
            return;
        }

        submitInvoice();
    }

    const confirmChangeAndCompletePayment = () => {
        if (changeDeliveredUSD > requiredChangeUSD + PAYMENT_EPSILON) {
            toast.error('El vuelto en USD no puede ser mayor al vuelto total requerido');
            return;
        }

        const cashUSD = typesPayment.find((item) => item.currency === 'USD' && item.name.toLocaleLowerCase().includes('efectivo'));
        const cashBS = typesPayment.find((item) => item.currency === 'BS' && item.name.toLocaleLowerCase().includes('efectivo'));

        if (!cashUSD && changeDeliveredUSD > PAYMENT_EPSILON) {
            toast.error('No existe un método de pago en efectivo USD para registrar el vuelto');
            return;
        }

        if (!cashBS && changeDeliveredBs > PAYMENT_EPSILON) {
            toast.error('No existe un método de pago en efectivo Bs para registrar el vuelto');
            return;
        }

        const nextPayments = [...payments];

        const originalPaymentIndex = nextPayments.findIndex((p) => p.amount > 0);

        if (originalPaymentIndex >= 0) {
            const originalPayment = nextPayments[originalPaymentIndex];
            const originalType = typesPayment.find((t) => t.id === originalPayment.paymentTypeId);

            if (originalType?.currency === 'USD') {
                nextPayments[originalPaymentIndex] = {
                    ...originalPayment,
                    change: Number(requiredChangeUSD),
                };
            } else if (originalType?.currency === 'BS') {
                nextPayments[originalPaymentIndex] = {
                    ...originalPayment,
                    change: Number(changeBs),
                };
            }
        }

        setPayments(nextPayments);

        setOpenChangeDialog(false);
        submitInvoice(nextPayments);
    }

    const calculateTotalRest = () => {
        const selectedType = typesPayment.find((type) => type.id.toString() === typeSelected);

        if (selectedType && selectedType.currency === 'USD') {
            setValue('amount', Math.ceil(totalRestUSD).toString());
        } else {
            setValue('amount', (Math.ceil(totalRestBs * 100) / 100).toFixed(2).toString());
        }
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
                                        <div className="flex items-center gap-2">
                                            <Controller
                                                control={control}
                                                name="amount"
                                                render={({ field }) => (
                                                    <Input
                                                        type="text"
                                                        inputMode="numeric"
                                                        value={field.value}
                                                        onChange={(event) => field.onChange(normalizeDecimalInput(event.target.value))}
                                                        placeholder="Ingrese el monto a pagar"
                                                    />
                                                )}
                                            />
                                            <Button
                                                disabled={!typeSelected || isPaymentComplete}
                                                variant="violet"
                                                type="button"
                                                onClick={calculateTotalRest}
                                            >
                                                Máximo
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isPaymentComplete || !typeSelected}
                                    variant="primary"
                                    className="mt-4 flex items-center w-full text-lg z-50"
                                    size='lg'
                                >
                                    <IoAddCircleOutline className="size-6" /> Agregar Pago
                                </Button>
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
                            <Button
                                variant="violet"
                                disabled={createInvoiceMutation.isPending || !isPaymentComplete}
                                className="text-lg flex items-center gap-3"
                                size='lg'
                                onClick={completePayment}>
                                <IoMdCheckmarkCircleOutline className="size-6" />
                                {createInvoiceMutation.isPending ? 'Procesando...' : 'Finalizar Venta'}
                            </Button>
                        </div>
                    </DialogFooter>

                </DialogContent>
            </Dialog>

            <Dialog open={openChangeDialog} onOpenChange={setOpenChangeDialog}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Confirmar vuelto</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="rounded-md bg-gray-100 p-3 text-sm">
                            <p className="font-semibold text-gray-800">Dinero recibido</p>
                            <p>{formatNumberWithDecimal(totalPayedBs)} Bs</p>
                            <p>{formatNumberWithDecimal(totalPayedUSD)} $</p>
                        </div>

                        <div className="rounded-md bg-red-50 p-3 text-sm">
                            <p className="font-semibold text-red-800">Vuelto total a entregar</p>
                            <p>{formatNumberWithDecimal(changeBs)} Bs</p>
                            <p>{formatNumberWithDecimal(changeUSD)} $</p>
                        </div>

                        <div className="space-y-2">
                            <Label>Vuelto a entregar en USD</Label>
                            <Input
                                type="text"
                                inputMode="decimal"
                                value={changeDeliveredUSDInput}
                                onChange={(event) => setChangeDeliveredUSDInput(normalizeDecimalInput(event.target.value))}
                                placeholder="Ingrese monto en USD"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Vuelto a entregar en Bs (calculado)</Label>
                            <Input value={formatNumberWithDecimal(changeDeliveredBs)} readOnly disabled />
                        </div>
                    </div>

                    <DialogFooter>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" type="button" onClick={() => setOpenChangeDialog(false)}>
                                Cancelar
                            </Button>
                            <Button
                                type="button"
                                variant="primary"
                                onClick={confirmChangeAndCompletePayment}
                                disabled={createInvoiceMutation.isPending}
                            >
                                Confirmar y finalizar
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
