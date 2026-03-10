import type { ExchangeRateType } from "./inventory.interface";

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