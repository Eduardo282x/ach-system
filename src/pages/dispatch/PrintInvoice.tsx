import { forwardRef, useLayoutEffect, useRef, useState } from "react";
import { formatNumberWithDecimal, formatNumberWithDots } from "@/helpers/formatters";
import type { ExchangeRateType } from "@/interfaces/inventory.interface";

interface InvoiceProduct {
    id: number;
    name: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
}

interface InvoicePayment {
    typePayment: string;
    currency: ExchangeRateType;
    reference: string;
    amountBs: number;
    amountUSD: number;
}

export interface InvoiceData {
    invoiceNumber?: number | string;
    date: string;
    time: string;
    cashier: string;
    customer: {
        fullName: string;
        identify: string;
        phone: string;
    };
    totals: {
        totalBs: number;
        totalUSD: number;
    };
    productsList: InvoiceProduct[];
    payments: InvoicePayment[];
}

interface PrintInvoiceProps {
    data: InvoiceData;
}

export const PrintInvoice = forwardRef((props: PrintInvoiceProps, ref: React.Ref<HTMLDivElement>) => {
    const { data } = props;
    const contentRef = useRef<HTMLDivElement>(null);
    const [printScale, setPrintScale] = useState(1);
    const [printHeight, setPrintHeight] = useState<number | null>(null);

    // Mide la altura real del contenido oculto para escalarlo y evitar una segunda página.
    useLayoutEffect(() => {
        const content = contentRef.current;
        const page = content?.closest<HTMLDivElement>('.print-invoice');
        if (!data || !content || !page) return;

        const styles = window.getComputedStyle(page);
        const paddingTop = Number.parseFloat(styles.paddingTop) || 0;
        const paddingBottom = Number.parseFloat(styles.paddingBottom) || 0;
        const availableHeight = page.clientHeight - paddingTop - paddingBottom;
        const naturalHeight = content.scrollHeight;

        if (availableHeight <= 0 || naturalHeight <= 0) return;

        const MIN_PRINT_SCALE = 0.55;
        const nextScale = Math.max(MIN_PRINT_SCALE, Math.min(1, availableHeight / naturalHeight));
        setPrintScale(nextScale);
        setPrintHeight(Math.min(naturalHeight * nextScale, availableHeight));
    }, [data]);

    if (!data) return null; // No renderizar nada si no hay data

    return (
        <div ref={ref} className="print-invoice">
            <div
                className="print-invoice-viewport"
                style={printHeight != null ? { height: `${printHeight}px` } : undefined}
            >
                <div
                    ref={contentRef}
                    className="print-invoice-content"
                    style={{ transform: `scale(${printScale})` }}
                >
                    <p className='print-invoice-title text-2xl font-bold text-center'>{import.meta.env.VITE_NAME}</p>

                <div className='print-invoice-meta print-invoice-row flex items-start justify-between w-full my-4 text-lg'>
                    <div className="overflow-hidden wrap-break-words">
                        <p><strong>Despacho: </strong>#{data.invoiceNumber ?? '--'}</p>
                        <p><strong>Fecha: </strong>{data.date}</p>
                        <p><strong>Cliente: </strong>{data.customer.fullName}</p>
                        <p><strong>Teléfono: </strong>{data.customer.phone}</p>
                    </div>
                    <div className="text-right overflow-hidden wrap-break-words">
                        <p><strong>Cajero: </strong>{data.cashier}</p>
                        <p><strong>Hora: </strong>{data.time}</p>
                        <p><strong>C.I: </strong>{formatNumberWithDots(data.customer.identify, '', '', true)}</p>
                    </div>
                </div>

                <div className="print-invoice-divider w-full border-2 border-dashed border-black"></div>

                {data.productsList.map((product, index) => (
                    <div key={index} className="print-invoice-product print-invoice-row flex items-start justify-between w-full my-4 text-xl">
                        <div className="overflow-hidden wrap-break-words min-w-0 w-full">
                            <p><strong>{product.quantity}</strong> x {product.name}</p>
                            <p>X {formatNumberWithDecimal(product.unitPrice)} Bs</p>
                        </div>
                        <p className="w-[40%] text-right">{formatNumberWithDecimal(product.subtotal)} Bs</p>
                    </div>
                ))}

                <div className="print-invoice-divider w-full border-2 border-dashed border-black"></div>

                <div>
                    <div className="print-invoice-total print-invoice-row flex items-start justify-between w-full my-4">
                        <p className="font-bold text-2xl">Total a Pagar:</p>
                        <div className="text-right">
                            <p className="font-bold text-2xl">{formatNumberWithDecimal(data.totals.totalBs)} Bs</p>
                            <p className="font-semibold">${formatNumberWithDecimal(data.totals.totalUSD)}</p>
                        </div>
                    </div>
                </div>

                <div className="print-invoice-payment text-xl">
                    <p className="font-bold">Métodos de pago:</p>
                    {data.payments.length === 0 ? (
                        <p>--</p>
                    ) : (
                        data.payments.map((payment, index) => (
                            <div key={index} className="print-invoice-row flex items-start justify-between w-full mt-2">
                                <div className="overflow-hidden wrap-break-words min-w-0">
                                    <p>{payment.typePayment}</p>
                                    <p className="text-sm">Ref: {payment.reference || '--'}</p>
                                </div>
                                <div className="text-right">
                                    {payment.currency === 'USD' ? (
                                        <>
                                            <p>${formatNumberWithDecimal(payment.amountUSD)}</p>
                                            <p className="text-sm">{formatNumberWithDecimal(payment.amountBs)} Bs</p>
                                        </>
                                    ) : (
                                        <>
                                            <p>{formatNumberWithDecimal(payment.amountBs)} Bs</p>
                                            <p className="text-sm">${formatNumberWithDecimal(payment.amountUSD)}</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <p className="print-invoice-footer text-center mt-4">¡Gracias por su compra!</p>

                </div>
            </div>
        </div>
    )
});

PrintInvoice.displayName = 'PrintInvoice';
