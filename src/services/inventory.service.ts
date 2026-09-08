import type { ExchangeRate, ExchangeRateBody, ExchangeRateContent, HistoryInventoryContent, InventoryEntryBody, InventoryEntryContent, InventoryInterface, Product, ProductBody, ProductBreakdown } from "@/interfaces/inventory.interface";
import { deleteDataApi, getDataApi, getDataFileApi, postDataApi, putDataApi } from "./api.service";
import type { Pagination } from "@/interfaces/base.interface";

const inventoryUrl = '/products';
const inventoryEntriesUrl = '/inventory/entries';
const excelUrl = '/excel';

export const getInventoryApi = async (search?: string, filter?: Pagination): Promise<InventoryInterface> => {
    let params = '';
    if (search) {
        params += `?search=${search}`;
    }
    if (filter?.page) {
        params += `${params ? '&' : '?'}page=${filter.page}&size=${filter.size}`;
    }
    const response = await getDataApi<InventoryInterface>(`${inventoryUrl}${params}`);
    if (response.data == null) {
        return { products: [], pagination: { total: 0, page: 1, size: filter?.size || 10 } };
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

//Entradas de inventario
export const getInventoryEntriesApi = async (filter: Pagination): Promise<InventoryEntryContent> => {
    let params = '';
    if (filter.page) {
        params += `?page=${filter.page}&size=${filter.size}`;
    }
    const response = await getDataApi<InventoryEntryContent>(`${inventoryEntriesUrl}${params}`);
    if (response.data == null) {
        return { inventoryEntries: [], pagination: { total: 0, page: 1, size: filter.size } };
    }
    return response.data;
}
export const createInventoryEntryApi = async (data: InventoryEntryBody) => {
    const response = await postDataApi<InventoryEntryBody, InventoryEntryContent>(`${inventoryEntriesUrl}`, data);
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
export const putExchangeRateDefaultApi = async (id: number): Promise<ExchangeRate | null> => {
    const response = await putDataApi<null, ExchangeRate | null>(`${inventoryUrl}/exchange-rate/default/${id}`, null);
    return response.data;
}
export const getExchangeRateAutomaticApi = async (): Promise<ExchangeRate[]> => {
    const response = await postDataApi<null, ExchangeRate[]>(`${inventoryUrl}/exchange-rate/automatic`, null);
    return response.data || [];
}

//Template
export const downloadTemplateProduct = async () => {
    return await getDataFileApi(`${inventoryUrl}/template`);
}

//Excel
export const uploadExcelProducts = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return await postDataApi<FormData, unknown>(`${excelUrl}/products/upload`, formData);
}