export interface InventoryInterface {
    products: Product[];
}

export interface Product {
    id: number;
    name: string;
    presentation: string;
    barcode: string;
    price: string;
    currency: string;
    stock: number;
    isDetail: boolean;
    parentId: number | null;
    unitsDetail: number | null;
    createdAt: Date;
    updatedAt: Date;
    exchangeRates: { [key: string]: number };
}


//Body
export interface ProductBody {
    name: string;
    presentation: string;
    barcode: string;
    price: number;
    currency: string;
    stock: number;
    isDetail: boolean;
    parentId: number | null;
    unitsDetail: number | null;
}

export interface ProductBreakdown {
    childId: number;
}

//Tasas
export interface ExchangeRateContent {
    exchangeRate: ExchangeRate[];
}
export interface ExchangeRate {
    name: string;
    rate: number;
    currency: ExchangeRateType;
    isDefault: boolean;
    createdAt: Date;
}

export interface ExchangeRateBody {
    name: string;
    rate: string;
    currency: ExchangeRateType;
}

export type ExchangeRateType = 'USD' | 'EUR';