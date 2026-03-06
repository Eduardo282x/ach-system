import type { ExchangeRate, ExchangeRateBody, ExchangeRateContent, HistoryInventoryContent, InventoryInterface, Product, ProductBody, ProductBreakdown } from "@/interfaces/inventory.interface";
import { deleteDataApi, getDataApi, postDataApi, putDataApi } from "./api.service";
import type { Pagination } from "@/interfaces/base.interface";

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

export const getInventoryHistoryApi = async (filter: Pagination): Promise<HistoryInventoryContent> => {
    let params = '';
    if (filter.page) {
        params += `?page=${filter.page}&size=${filter.size}`;
    }
    if (filter.startDate && filter.endDate) {
        params += `${params ? '&' : '?'}startDate=${filter.startDate}&endDate=${filter.endDate}`;
    }
    const response = await getDataApi<HistoryInventoryContent>(`${inventoryUrl}/inventory/history${params}`);
    if (response.data == null) {
        return { history: [], pagination: { total: 0, page: 1, size: filter.size } };
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
export const postExchangeRateApi = async (data: ExchangeRateBody): Promise<ExchangeRate | null> => {
    const response = await postDataApi<ExchangeRateBody, ExchangeRate | null>(`${inventoryUrl}/exchange-rate`, data);
    return response.data;
}
export const getExchangeRateAutomaticApi = async (): Promise<ExchangeRate[]> => {
    const response = await postDataApi<null, ExchangeRate[]>(`${inventoryUrl}/exchange-rate/automatic`, null);
    return response.data || [];
}