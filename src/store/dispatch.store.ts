import { formatOnlyDateStringFilter } from "@/helpers/formatters";
import type { PaymentType, ResumenContent, ResumenFilter } from "@/interfaces/distpatch.interface";
import type { Product } from "@/interfaces/inventory.interface";
import { create } from "zustand";

interface DispatchStore {
    productList:Product[];
    total: number;
    totalUSD: number;
    typesPayments: PaymentType[];
    setTotal: (total: number) => void;
    setTotalUSD: (totalUSD: number) => void;
    setTypesPayments: (typesPayments: PaymentType[]) => void;
    setProductList: (products: Product[] | ((prevProducts: Product[]) => Product[])) => void;
}

export const useDispatchStore = create<DispatchStore>((set) => ({
    productList: [],
    total: 0,
    totalUSD: 0,
    typesPayments: [],
    setTotal: (total) => set({ total }),
    setTotalUSD: (totalUSD) => set({ totalUSD }),
    setTypesPayments: (typesPayments) => set({ typesPayments }),
    setProductList: (products) => set((state) => ({
        productList: typeof products === 'function' ? products(state.productList) : products,
    })),
}));

interface SalesStore {
    filter: ResumenFilter;
    resumen: ResumenContent | null;
    setFilter: (filter: ResumenFilter) => void;
    setResumen: (resumen: ResumenContent) => void;
}

export const useSalesStore = create<SalesStore>((set) => ({
    resumen: null,
    filter: { date: formatOnlyDateStringFilter(new Date()) },
    setFilter: (filter) => set({ filter }),
    setResumen: (resumen) => set({ resumen }),
}));