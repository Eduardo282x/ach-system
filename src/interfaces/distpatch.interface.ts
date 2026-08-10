import type { ExchangeRateType } from "./inventory.interface";
import type { CashDrawer } from "./sessions.interface";
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
    hasDiscount: boolean;

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
    unitPrice: number;
}

//Resumen

export interface ResumenFilter {
    date: Date | string;
    sessionId?: number | undefined;
    cashDrawerId?: number | undefined;
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

export type InvoiceStatus = 'PAID' | 'PENDING' | 'CANCELLED' | 'RETURN' | 'CHANGE';

export interface InvoiceResponseContent {
    invoice: InvoiceResponse;
}

export interface OriginalInvoiceRef {
    id: number;
    invoiceNumber: string;
    status: InvoiceStatus;
}

export interface InvoiceResponse {
    id: number;
    originalInvoice?: OriginalInvoiceRef | null;
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
    cashDrawer: CashDrawer;
}

export interface User {
    id: number;
    name: string;
    role: TypeRole;
}

// Invoices List

export interface InvoicesFilter {
    search?: string;
    startDate?: string;
    endDate?: string;
    sessionId?: number;
    userId?: number;
    page?: number;
    size?: number;
}

export interface InvoicesPagination {
    page: number;
    size: number;
    total: number;
    totalPages: number;
}

export interface InvoicesResponse {
    invoices: InvoiceResponse[];
    pagination: InvoicesPagination;
}

// Return / Change

export type ReturnCondition = 'GOOD' | 'DEFECTIVE';
export type ReturnType = 'RETURN' | 'CHANGE';

export interface ReturnItemBody {
    invoiceItemId: number;
    quantity: number;
    condition: ReturnCondition;
}

export interface RefundPaymentBody {
    paymentTypeId: number;
    amount: number;
}

export interface CreateReturnBody {
    invoiceId: number;
    reason: string;
    items: ReturnItemBody[];
    payments: RefundPaymentBody[];
}

export interface ReplacementItemBody {
    productId: number;
    quantity: number;
}

export interface CreateChangeBody {
    invoiceId: number;
    reason: string;
    returnedItems: ReturnItemBody[];
    replacementItems: ReplacementItemBody[];
    sessionId: number;
    exchangeRateUsdId?: number;
    exchangeRateEurId?: number;
}

export interface ReturnItem {
    id: number;
    returnId: number;
    productId: number;
    quantity: string;
    condition: ReturnCondition;
    createdAt: Date;
    product: Product;
}

export interface ReturnRecord {
    id: number;
    invoiceId: number;
    type: ReturnType;
    reason: string;
    userId: number;
    createdAt: Date;
    items: ReturnItem[];
}

export interface CreateReturnResponseContent {
    return: ReturnRecord;
    invoice: InvoiceResponse;
}

export interface CreateChangeResponseContent {
    return: ReturnRecord;
    invoice: InvoiceResponse;
    newInvoice: InvoiceResponse;
}
