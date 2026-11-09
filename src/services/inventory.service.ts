import type { DeleteProductPayload, ExchangeRate, ExchangeRateBody, ExchangeRateContent, HistoryInventoryContent, InventoryEntryBody, InventoryEntryContent, InventoryEntryImportResult, InventoryInterface, Product, ProductBody, ProductBreakdown, ProductImportResult, ProductUpdateBody } from "@/interfaces/inventory.interface";
import { deleteDataBodyApi, getDataApi, getDataFileApi, postDataApi, putDataApi } from "./api.service";
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

export const getInventoryHistoryApi = async (filter: Pagination & { search?: string }): Promise<HistoryInventoryContent> => {
    const params = new URLSearchParams();

    if (filter.page) {
        params.append('page', String(filter.page));
        params.append('size', String(filter.size));
    }
    if (filter.startDate && filter.endDate) {
        params.append('startDate', String(filter.startDate));
        params.append('endDate', String(filter.endDate));
    }
    if (filter.search) {
        params.append('search', filter.search);
    }

    const queryString = params.toString();
    const response = await getDataApi<HistoryInventoryContent>(`${inventoryUrl}/inventory/history${queryString ? `?${queryString}` : ''}`);
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
export const updateProductApi = async (id: number, data: ProductUpdateBody) => {
    const response = await putDataApi<ProductUpdateBody, Product>(`${inventoryUrl}/${id}`, data);
    return response;
}
export const breakDownProductApi = async (data: ProductBreakdown) => {
    const response = await postDataApi<ProductBreakdown, Product>(`${inventoryUrl}/breakdown`, data);
    return response;
}
export const deleteProductApi = async (data: DeleteProductPayload) => {
    const response = await deleteDataBodyApi<DeleteProductPayload, Product>(`${inventoryUrl}`, data);
    return response;
}
export const validatePasswordAdminApi = async (password: string): Promise<boolean> => {
    const response = await postDataApi<{ password: string }, boolean>(`${inventoryUrl}/validate-password`, { password });
    return response.data ?? false;
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

//Entradas de inventario
export const getInventoryEntriesApi = async (filter: Pagination & { search?: string }): Promise<InventoryEntryContent> => {
    const params = new URLSearchParams();

    if (filter.page) {
        params.append('page', String(filter.page));
        params.append('size', String(filter.size));
    }
    if (filter.search) {
        params.append('search', filter.search);
    }

    const queryString = params.toString();
    const response = await getDataApi<InventoryEntryContent>(`${inventoryEntriesUrl}${queryString ? `?${queryString}` : ''}`);
    if (response.data == null) {
        return { inventoryEntries: [], pagination: { total: 0, page: 1, size: filter.size } };
    }
    return response.data;
}
export const createInventoryEntryApi = async (data: InventoryEntryBody) => {
    const response = await postDataApi<InventoryEntryBody, InventoryEntryContent>(`${inventoryEntriesUrl}`, data);
    return response;
}

//Template
export const downloadTemplateProduct = async () => {
    return await getDataFileApi(`${excelUrl}/products/template`);
}

//Excel
export const uploadExcelProducts = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return await postDataApi<FormData, ProductImportResult>(`${excelUrl}/products/upload`, formData);
}

export const uploadInventoryEntryExcel = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return await postDataApi<FormData, InventoryEntryImportResult>(`${excelUrl}/inventory-entries/upload`, formData);
}