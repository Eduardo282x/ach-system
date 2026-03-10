import type { ExchangeRateType } from "./inventory.interface";
import type { TypeRole } from "./users.interface";

export interface TypesPaymentContent {
    paymentTypes: PaymentType[];
}

export interface PaymentType {
    id: number;
    name: string;
    currency: ExchangeRateType;
    createdAt: Date;
    updatedAt: Date;
}


export interface DispatchBody {
    customerId: number;
    sessionId: number;
    exchangeRateUsdId: number;
    exchangeRateEurId: number;

    items: ProductsDispatchBody[];
    payments: PaymentBody[]
}

export interface PaymentBody {
    paymentTypeId: number;
    amountReceived: number;
    amountChange: number;
}

export interface ProductsDispatchBody {
    productId: number;
    quantity: number;
}

//Resumen

export interface ResumenFilter {
    date: Date | string;
    sessionId?: number | undefined;
}

export interface ResumenContent {
    date: Date;
    sessionId: null | number;
    totalInvoice: number;
    total: TotalResumen;
    resumen: Resuman[];
}

export interface TotalResumen {
    amount: number;
    changeAmount: number;
    totalAmount: number;
    amountBs: number;
    changeAmountBs: number;
    totalAmountBs: number;
    amountUsd: number;
    changeAmountUsd: number;
    totalAmountUsd: number;
}


export interface Resuman {
    paymentTypeId: number;
    payment: string;
    currency: ExchangeRateType;
    amount: number;
    amountUsd: number;
    changeAmount: number;
    changeAmountUsd: number;
    totalAmount: number;
    totalAmountUsd: number;
}


//Invoice

export type InvoiceStatus = 'PAID' | 'PENDING' | 'CANCELLED';

export interface InvoiceResponseContent {
    invoice: InvoiceResponse;
}

export interface InvoiceResponse {
    id: number;
    invoiceNumber: string;
    totalAmountBs: string;
    exchangeRateUsd: string;
    exchangeRateEur: string;
    totalAmountUsd: string;
    totalReceivedBs: string;
    totalChangeBs: string;
    status: InvoiceStatus;
    userId: number;
    customerId: number;
    sessionId: number;
    createdAt: Date;
    customer: Customer;
    user: User;
    session: Session;
    items: Item[];
    paymentDetails: PaymentDetail[];
}

export interface Customer {
    id: number;
    fullName: string;
    identify: string;
}

export interface Item {
    id: number;
    quantity: number;
    unitPrice: string;
    subtotal: string;
    product: Product;
}

export interface Product {
    id: number;
    name: string;
    barcode: string;
    currency: ExchangeRateType;
    stock: number;
}

export interface PaymentDetail {
    id: number;
    invoiceId: number;
    paymentTypeId: number;
    amountReceived: string;
    amountChange: string;
    amountNet: string;
    amountNetBs: string;
    currency: string;
    denominations: null;
    paymentType: PaymentType;
}

export interface PaymentType {
    id: number;
    name: string;
    currency: ExchangeRateType;
}

export interface Session {
    id: number;
    cashDrawerId: number;
}

export interface User {
    id: number;
    name: string;
    role: TypeRole;
}
