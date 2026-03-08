import type { Product } from "@/interfaces/inventory.interface";
import { create } from "zustand";

interface DispatchStore {
    productList:Product[];
    total: number;
    totalUSD: number;
    setTotal: (total: number) => void;
    setTotalUSD: (totalUSD: number) => void;
    setProductList: (products: Product[] | ((prevProducts: Product[]) => Product[])) => void;
}

export const useDispatchStore = create<DispatchStore>((set) => ({
    productList: [],
    total: 0,
    totalUSD: 0,
    setTotal: (total) => set({ total }),
    setTotalUSD: (totalUSD) => set({ totalUSD }),
    setProductList: (products) => set((state) => ({
        productList: typeof products === 'function' ? products(state.productList) : products,
    })),
}));