import type { Client, ClientInterface } from "@/interfaces/clients.interface";
import { getDataApi, postDataApi } from "./api.service";

const clientsUrl = '/clients';

export const getClientsApi = async (): Promise<ClientInterface> => {
    const response = await getDataApi<ClientInterface>(`${clientsUrl}`);
    if(response.data == null) {
        return { clients: [] };
    }
    return response.data;
}

export const createClientApi = async (data: Omit<Client, 'id'>) => {
    const response = await postDataApi<Omit<Client, 'id'>, Client>(`${clientsUrl}`, data);
    return response;
}

export const updateClientApi = async (id: number, data: Omit<Client, 'id'>) => {
    const response = await postDataApi<Omit<Client, 'id'>, Client>(`${clientsUrl}/${id}`, data);
    return response;
}