import type { CashDrawerContent, CloseSession, CreateUpdateCashDrawer, OpenSession, SessionFilter, SessionsContent } from "@/interfaces/sessions.interface";
import { getDataApi, postDataApi, putDataApi } from "./api.service";

const sessionsUrl = '/sessions';

export const getSessionsApi = async (filter?: Partial<SessionFilter>): Promise<SessionsContent> => {
    let params = '';
    if (filter && filter.startDate && filter.endDate) {
        params = `?startDate=${filter.startDate}&endDate=${filter.endDate}`;
    }
    if (filter && filter.cashDrawerId) {
        params += params ? `&cashDrawerId=${filter.cashDrawerId}` : `?cashDrawerId=${filter.cashDrawerId}`;
    }
    const response = await getDataApi<SessionsContent>(`${sessionsUrl}${params}`);
    if (response.data == null) {
        return { sessions: [] };
    }
    return response.data;
}

export const openSessionApi = async (data: OpenSession) => {
    const response = await postDataApi<OpenSession, SessionsContent>(`${sessionsUrl}/open`, data);
    return response;
}

export const closeSessionApi = async (data: CloseSession) => {
    const response = await postDataApi<CloseSession, SessionsContent>(`${sessionsUrl}/close`, data);
    return response;
}


//CashDrawer
export const getCashDrawersApi = async (): Promise<CashDrawerContent> => {
    const response = await getDataApi<CashDrawerContent>(`${sessionsUrl}/cash-drawer`);
    if (response.data == null) {
        return { cashDrawers: [] };
    }
    return response.data;
}

export const createCashDrawerApi = async (name: string): Promise<CreateUpdateCashDrawer> => {
    const response = await postDataApi<{ name: string }, CreateUpdateCashDrawer>(`${sessionsUrl}/cash-drawer`, { name });
    if (response.data == null) {
        return { cashDrawer: { id: 0, name: '' } };
    }
    return response.data;
}

export const updateCashDrawerApi = async (id: number, name: string): Promise<CreateUpdateCashDrawer> => {
    const response = await putDataApi<{ name: string }, CreateUpdateCashDrawer>(`${sessionsUrl}/cash-drawer/${id}`, { name });
    if (response.data == null) {
        return { cashDrawer: { id: 0, name: '' } };
    }
    return response.data;
}