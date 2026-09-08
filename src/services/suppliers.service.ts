import type { Supplier, SupplierInterface } from "@/interfaces/suppliers.interface";
import { getDataApi, postDataApi } from "./api.service";

const suppliersUrl = '/suppliers';

export const getSuppliersApi = async (search?: string): Promise<SupplierInterface> => {
    let params = '';
    if (search) {
        params += `?search=${search}`;
    }
    const response = await getDataApi<SupplierInterface>(`${suppliersUrl}${params}`);
    if (response.data == null) {
        return { suppliers: [] };
    }
    return response.data;
}

export const createSupplierApi = async (data: Omit<Supplier, 'id'>) => {
    const response = await postDataApi<Omit<Supplier, 'id'>, Supplier>(`${suppliersUrl}`, data);
    return response;
}

export const updateSupplierApi = async (id: number, data: Omit<Supplier, 'id'>) => {
    const response = await postDataApi<Omit<Supplier, 'id'>, Supplier>(`${suppliersUrl}/${id}`, data);
    return response;
}
