import type { User } from "./sessions.interface";

export interface InventoryInterface {
    products: Product[];
}

export interface Product {
    id: number;
    name: string;
    presentation: string;
    barcode: string;
    price: string;
    currency: ExchangeRateType;
    stock?: number;
    isDetail?: boolean;
    parentId?: number | null;
    unitsDetail?: number | null;
    createdAt?: Date;
    updatedAt?: Date;
    exchangeRates?: { [key: string]: number };
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
    rate: number;
    currency: ExchangeRateType;
}

export type ExchangeRateType = 'USD' | 'EUR';

//History
export interface HistoryInventoryContent {
    history: HistoryInventory[];
    pagination: PaginationContent;
}

export interface PaginationContent {
    total: number;
    page: number;
    size: number;
}

export interface HistoryInventory {
    id: number;
    productId: number;
    quantity: number;
    type: MovementType;
    reason: string;
    userId: number;
    createdAt: Date;
    product: Product;
    user: User;
}

export type MovementType =
    'SALE' |
    'RESTOCK' |
    'CONVERSION' |
    'ADJUSTMENT' |
    'RETURN';

// Duplicate Product interface removed. See above for the merged definition.