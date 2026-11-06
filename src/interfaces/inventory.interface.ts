import type { User } from "./sessions.interface";

export interface InventoryInterface {
    products: Product[];
    pagination: PaginationContent;
}

export interface Product {
    id: number;
    name: string;
    presentation: string;
    barcode: string;
    price: string;
    purchasePrice?: string | number;
    currency: ExchangeRateType;
    quantity?: number;
    stock: number;
    subtotalBs?: number;
    subtotal?: number;
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
    purchasePrice?: number;
    currency: string;
    stock: number;
    isDetail: boolean;
    parentId: number | null | undefined;
    unitsDetail: number | null;
}

export interface ProductBreakdown {
    childId: number;
}

export interface DeleteProductPayload {
    id: number;
    password: string;
}

//Tasas
export interface ExchangeRateContent {
    exchangeRate: ExchangeRate[];
}
export interface ExchangeRate {
    id: number;
    name: string;
    rate: number;
    currency: ExchangeRateType;
    isDefault: boolean;
    createdAt: Date;
    date: Date;
}

export interface ExchangeRateBody {
    name: string;
    rate: number;
    currency: ExchangeRateType;
}

export type ExchangeRateType = 'USD' | 'EUR' | 'BS';

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
export interface InventoryEntryContent {
    inventoryEntries: InventoryEntry[];
    pagination: PaginationContent;
}

export interface InventoryEntry {
    id: number;
    controlNumber: string;
    title: string;
    description: string;
    date: Date;
    createdAt: Date;
    updatedAt: Date;
    inventoryEntryDetails: InventoryEntryDetail[];
}

export interface InventoryEntryDetail {
    id: number;
    inventoryEntryId: number;
    productId: number;
    quantity: string;
    unitPrice: string;
    salePrice?: string | null;
    subtotal: string;
    product: Product;
}


export interface InventoryEntryBody {
    controlNumber: string;
    title: string;
    description: string;
    date: string;
    details: InventoryEntryDetailBody[];
}

export interface InventoryEntryDetailBody {
    productId: number;
    quantity: number;
    unitPrice: number;
    salePrice?: number;
}

//Excel imports
export interface ImportedProductChange {
    barcode: string;
    name: string;
    action: 'created' | 'updated';
    quantityAdded: number;
    previous?: {
        name: string;
        presentation: string;
        barcode: string;
        price: number;
        purchasePrice: number;
        stock: number;
    };
    current: {
        name: string;
        presentation: string;
        barcode: string;
        price: number;
        purchasePrice: number;
        stock: number;
    };
}

export interface ImportError {
    row: number;
    barcode?: string;
    name?: string;
    reason: string;
}

export interface ImportSummary {
    created: number;
    updated: number;
    skipped: number;
    errors: ImportError[];
    products: ImportedProductChange[];
}

export interface ProductImportResult extends ImportSummary {
    message?: string;
}

export interface InventoryEntryImportResult {
    entry: {
        id: number;
        controlNumber: string;
        title: string;
        description: string;
        date: string;
    };
    summary: ImportSummary;
}