import type { Client, ClientBody, CustomerContent } from "@/interfaces/customer.interface";
import { deleteDataApi, getDataApi, postDataApi, putDataApi } from "./api.service";

const customersUrl = '/clients';

export const getCustomersApi = async (search?: string): Promise<CustomerContent> => {
    let params = '';
    if (search) {
        params += `?search=${search}`;
    }
    const response = await getDataApi<CustomerContent>(`${customersUrl}${params}`);
    if(response.data == null) {
        return { clients: [] };
    }
    return response.data;
}

export const createCustomerApi = async (data: ClientBody) => {
    const response = await postDataApi<ClientBody, Client>(`${customersUrl}`, data);
    return response;
}

export const updateCustomerApi = async (id: number, data: ClientBody) => {
    const response = await putDataApi<ClientBody, Client>(`${customersUrl}/${id}`, data);
    return response;
}

export const deleteCustomerApi = async (id: number) => {
    const response = await deleteDataApi<Client>(`${customersUrl}/${id}`, id);
    return response;
}