import type { InvoiceStatus } from "./distpatch.interface";
import type { ExchangeRateType } from "./inventory.interface";
import type { TypeRole } from "./users.interface";

export interface DashboardSummary {
    range:             Range;
    totalSales:        TotalSales;
    totalCost:         TotalSales;
    profit:            Profit;
    totalInvoices:     number;
    paidInvoices:      number;
    pendingInvoices:   number;
    receivable:        TotalSales;
    collected:         Collected;
    paymentBreakdown:  PaymentBreakdownItem[];
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

export interface Profit {
    amountBs:         number;
    amountUsd:        number;
    marginPercent:    number;
    itemsWithoutCost: number;
}

export interface CollectedCurrency {
    received: number;
    change:   number;
    net:      number;
}

export interface Collected {
    original: {
        bs:  CollectedCurrency;
        usd: CollectedCurrency;
        eur: CollectedCurrency;
    };
    equivalents: {
        totalBs:  CollectedCurrency;
        totalUsd: CollectedCurrency;
    };
    conversions: {
        bsToUsd: number;
        usdToBs: number;
    };
    grandTotal: {
        bs:  number;
        usd: number;
    };
}

export interface PaymentBreakdownItem {
    paymentTypeId: number;
    payment:       string;
    currency:      ExchangeRateType;
    received:      number;
    change:        number;
    net:           number;
    receivedBs:    number;
    changeBs:      number;
    netBs:         number;
    receivedUsd:   number;
    changeUsd:     number;
    netUsd:        number;
}

export interface Invoice {
    id:               number;
    invoiceNumber:    string;
    totalAmountBs:    string;
    exchangeRateUsd:  { id: number; rate: string };
    exchangeRateEur:  { id: number; rate: string };
    totalAmountUsd:   string;
    totalReceivedBs:  string;
    totalReceivedUsd: string;
    totalChangeBs:    string;
    totalChangeUsd:   string;
    status:           InvoiceStatus;
    userId:           number;
    customerId:       number;
    sessionId:        number;
    createdAt:        Date;
    customer:         Customer;
    user:             User;
    session:          Session;
    items:            Item[];
    paymentDetails:   PaymentDetail[];
}

export interface Customer {
    id:       number;
    fullName: string;
    identify: string;
}

export interface Item {
    id:           number;
    quantity:     number;
    unitPrice:    string;
    unitCost:     string;
    subtotal:     string;
    costSubtotal: string;
    product:      Product;
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
    paymentType:    { id: number; name: string; currency: ExchangeRateType };
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
    totalCostBs:       number;
    totalProfitBs:     number;
    totalInvoices:     number;
}

export interface TotalSales {
    amountBs:  number;
    amountUsd: number;
}

export type TrendGroupBy = "month" | "week" | "day" | "weekday";

export interface DashboardTrend {
    range:   TrendRange;
    groupBy: TrendGroupBy;
    bounds:  TrendBounds;
    periods: TrendPeriod[];
    totals:  TrendTotals;
}

export interface TrendRange {
    startDate: string;
    endDate:   string;
}

export interface TrendBounds {
    firstInvoice: string | null;
    lastInvoice:  string | null;
}

export interface TrendPeriod {
    key:               string;
    label:             string;
    startDate:         string | null;
    endDate:           string | null;
    totalInvoices:     number;
    totalItems:        number;
    totalSalesBs:      number;
    totalSalesUsd:     number;
    totalCostBs:       number;
    totalCostUsd:      number;
    profitBs:          number;
    profitUsd:         number;
    netCashBs:         number;
    netCashUsd:        number;
}

export interface TrendTotals {
    totalInvoices: number;
    totalItems:    number;
    totalSalesBs:  number;
    totalSalesUsd: number;
    totalCostBs:   number;
    totalCostUsd:  number;
    profitBs:      number;
    profitUsd:     number;
    netCashBs:     number;
    netCashUsd:    number;
}
