import { forwardRef } from "react";
import { formatNumberWithDecimal, formatNumberWithDots } from "@/helpers/formatters";

interface InvoiceProduct {
    id: number;
    name: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
}

interface InvoicePayment {
    typePayment: string;
    reference: string;
    amountBs: number;
    amountUSD: number;
}

interface InvoiceData {
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

    if (!data) return null; // No renderizar nada si no hay data

    return (
        <div ref={ref} className="w-full h-full relative">
            <div className="p-4 w-96 scale-50 origin-top-left absolute top-0 left-0 text-sm">
                <p className='text-xl font-bold text-center'>Inversiones Gustavo V, C.A</p>

                <div className='flex items-start justify-between w-full my-4'>
                    <div>
                        <p><strong>Despacho: </strong>#{data.invoiceNumber ?? '--'}</p>
                        <p><strong>Fecha: </strong>{data.date}</p>
                        <p><strong>Cliente: </strong>{data.customer.fullName}</p>
                        <p><strong>Telefono: </strong>{data.customer.phone}</p>
                    </div>
                    <div>
                        <p><strong>Cajero: </strong>{data.cashier}</p>
                        <p><strong>Hora: </strong>{data.time}</p>
                        <p><strong>C.I: </strong>{formatNumberWithDots(data.customer.identify, '', '', true)}</p>
                    </div>
                </div>

                <div className="w-full border-2 border-dashed border-black"></div>

                {data.productsList.map((product, index) => (
                    <div key={index} className="flex items-start justify-between w-full my-4">
                        <div>
                            <p><strong>{product.quantity}</strong> x {product.name}</p>
                            <p>P/U: {formatNumberWithDecimal(product.unitPrice)} Bs</p>
                        </div>
                        <p><strong>Subtotal: </strong>{formatNumberWithDecimal(product.subtotal)} Bs</p>
                    </div>
                ))}

                <div className="w-full border-2 border-dashed border-black"></div>

                <div>
                    <div className="flex items-start justify-between w-full my-4">
                        <p className="font-bold text-lg">Total a Pagar:</p>
                        <div className="text-right">
                            <p className="font-bold text-lg">{formatNumberWithDecimal(data.totals.totalBs)} Bs</p>
                            <p className="font-semibold">${formatNumberWithDecimal(data.totals.totalUSD)}</p>
                        </div>
                    </div>
                </div>

                <div>
                    <p className="font-bold">Métodos de pago:</p>
                    {data.payments.length === 0 ? (
                        <p>--</p>
                    ) : (
                        data.payments.map((payment, index) => (
                            <div key={index} className="flex items-start justify-between w-full mt-2">
                                <div>
                                    <p>{payment.typePayment}</p>
                                    <p className="text-xs">Ref: {payment.reference || '--'}</p>
                                </div>
                                <div className="text-right">
                                    <p>{formatNumberWithDecimal(payment.amountBs)} Bs</p>
                                    <p className="text-xs">${formatNumberWithDecimal(payment.amountUSD)}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <p className="text-center mt-4">¡Gracias por su compra!</p>

            </div>
        </div>
    )
});

PrintInvoice.displayName = 'PrintInvoice';
