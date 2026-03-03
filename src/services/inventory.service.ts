import type { ExchangeRate, ExchangeRateContent, InventoryInterface, Product, ProductBody, ProductBreakdown } from "@/interfaces/inventory.interface";
import { deleteDataApi, getDataApi, postDataApi, putDataApi } from "./api.service";

const inventoryUrl = '/products';

export const getInventoryApi = async (search?: string): Promise<InventoryInterface> => {
    let params = '';
    if (search) {
        params += `?search=${search}`;
    }
    const response = await getDataApi<InventoryInterface>(`${inventoryUrl}${params}`);
    if (response.data == null) {
        return { products: [] };
    }
    return response.data;
}

export const generateBarcodeApi = async (): Promise<string> => {
    const response = await getDataApi<string>(`${inventoryUrl}/barcode`);
    return response.data || '';
}

export const createProductApi = async (data: ProductBody) => {
    const response = await postDataApi<ProductBody, Product>(`${inventoryUrl}`, data);
    return response;
}
export const updateProductApi = async (id: number, data: ProductBody) => {
    const response = await putDataApi<ProductBody, Product>(`${inventoryUrl}/${id}`, data);
    return response;
}
export const breakDownProductApi = async (data: ProductBreakdown) => {
    const response = await postDataApi<ProductBreakdown, Product>(`${inventoryUrl}/breakdown`, data);
    return response;
}
export const deleteProductApi = async (id: number) => {
    const response = await deleteDataApi<Product>(`${inventoryUrl}`, id);
    return response;
}

//Tasas
export const getExchangeRateTodayApi = async (): Promise<ExchangeRateContent> => {
    const response = await getDataApi<ExchangeRateContent>(`${inventoryUrl}/exchange-rate/today`);
    return response.data || { exchangeRate: [] };
}
export const getExchangeRateAutomaticApi = async (): Promise<ExchangeRate[]> => {
    const response = await postDataApi<null, ExchangeRate[]>(`${inventoryUrl}/exchange-rate/automatic`, null);
    return response.data || [];
}