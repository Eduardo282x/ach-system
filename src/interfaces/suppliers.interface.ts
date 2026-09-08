export interface SupplierInterface {
    suppliers: Supplier[];
}

export interface Supplier {
    id: number;
    identify: string;
    phone: string;
    name: string;
    address: string;
}
