import type { InvoiceStatus } from "./distpatch.interface";
import type { ExchangeRateType } from "./inventory.interface";
import type { TypeRole } from "./users.interface";

export interface DashboardSummary {
    range:             Range;
    ingresos:          Ingresos;
    totalSales:        TotalSales;
    totalInvoices:     number;
    invoices:          Invoice[];
    frequentCustomers: FrequentCustomer[];
    topProducts:       TopProduct[];
    lowStockProducts:  LowStockProduct[];
}

export interface FrequentCustomer {
    customerId:    number;
    fullName:      string;
    identify:      string;
    totalInvoices: number;
}

export interface Ingresos {
    amountBs:        number;
    changeAmountBs:  number;
    totalNetBs:      number;
    amountUsd:       number;
    changeAmountUsd: number;
    totalNetUsd:     number;
}

export interface Invoice {
    id:              number;
    invoiceNumber:   string;
    totalAmountBs:   string;
    exchangeRateUsd: string;
    exchangeRateEur: string;
    totalAmountUsd:  string;
    totalReceivedBs: string;
    totalChangeBs:   string;
    status:          InvoiceStatus;
    userId:          number;
    customerId:      number;
    sessionId:       number;
    createdAt:       Date;
    customer:        Customer;
    user:            User;
    session:         Session;
    items:           Item[];
    paymentDetails:  PaymentDetail[];
}

export interface Customer {
    id:       number;
    fullName: string;
    identify: string;
}

export interface Item {
    id:        number;
    quantity:  number;
    unitPrice: string;
    subtotal:  string;
    product:   Product;
}

export interface Product {
    id:       number;
    name:     string;
    barcode?: string;
    currency: ExchangeRateType;
}

export interface PaymentDetail {
    id:             number;
    invoiceId:      number;
    paymentTypeId:  number;
    amountReceived: string;
    amountChange:   string;
    amountNet:      string;
    amountNetBs:    string;
    currency:       ExchangeRateType;
    denominations:  null;
    paymentType:    Product;
}

export interface Session {
    id:           number;
    cashDrawerId: number;
}

export interface User {
    id:   number;
    name: string;
    role: TypeRole;
}

export interface LowStockProduct {
    id:           number;
    name:         string;
    barcode:      string;
    stock:        number;
    presentation: string;
    price:        string;
    currency:     ExchangeRateType;
}

export interface Range {
    startDate: Date;
    endDate:   Date;
}

export interface TopProduct {
    productId:         number;
    name:              string;
    barcode:           string;
    presentation:      string;
    totalQuantitySold: number;
    totalAmountBs:     number;
    totalInvoices:     number;
}

export interface TotalSales {
    amountBs:  number;
    amountUsd: number;
}
