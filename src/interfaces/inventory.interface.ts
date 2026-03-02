export interface InventoryInterface {
    products: Product[];
}

export interface Product {
    id:            number;
    name:          string;
    presentation:  string;
    barcode:       string;
    price:         string;
    currency:      string;
    stock:         number;
    isDetail:      boolean;
    parentId:      number | null;
    unitsDetail:   number | null;
    createdAt:     Date;
    updatedAt:     Date;
    exchangeRates: { [key: string]: number };
}


//Body
export interface ProductBody {
    name:         string;
    presentation: string;
    barcode:      string;
    price:        number;
    currency:     string;
    stock:        number;
    isDetail:     boolean;
    parentId:     number | null;
    unitsDetail:  number | null;
}

export interface ProductBreakdown {
    childId: number;
}