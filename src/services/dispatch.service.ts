import type { BaseResponse } from "@/interfaces/base.interface";
import { formatOnlyDateStringFilter } from "@/helpers/formatters";
import type { DispatchBody, InvoicesFilter, InvoicesResponse, InvoiceResponseContent, PaymentType, ResumenContent, ResumenFilter, TypesPaymentContent } from "@/interfaces/distpatch.interface";
import { getDataApi, getDataFileApi, postDataApi } from "./api.service";

const salesUrl = '/sales';

export const getTypesPaymentApi = async (): Promise<PaymentType[]> => {
    const result = await getDataApi<TypesPaymentContent>(`${salesUrl}/types-payment`);
    return result.data?.paymentTypes ?? [];
}

export const getResumenSalesApi = async (filter: ResumenFilter): Promise<ResumenContent | null> => {
    const parsedDate = typeof filter.date === 'string' ? filter.date : formatOnlyDateStringFilter(filter.date);
    let params = `?date=${parsedDate ?? ''}`;

    if (filter && filter.sessionId) {
        params += `&sessionId=${filter.sessionId}` ;
    }
    if (filter && filter.shiftId) {
        params += `&shiftId=${filter.shiftId}`;
    }
    if (filter && filter.cashDrawerId) {
        params += `&cashDrawerId=${filter.cashDrawerId}`;
    }
    const result = await getDataApi<ResumenContent>(`${salesUrl}/resumen${params}`);
    return result.data;
}

export const getResumenSalesExcelApi = async (filter: ResumenFilter): Promise<Blob> => {
    const parsedDate = typeof filter.date === 'string' ? filter.date : formatOnlyDateStringFilter(filter.date);
    let params = `?date=${parsedDate ?? ''}`;

    if (filter && filter.sessionId) {
        params += `&sessionId=${filter.sessionId}` ;
    }
    if (filter && filter.shiftId) {
        params += `&shiftId=${filter.shiftId}`;
    }
    const result = await getDataFileApi(`${salesUrl}/resumen-excel${params}`);
    return result;
}

export const getInvoicesApi = async (filter: InvoicesFilter): Promise<InvoicesResponse | null> => {
    const params = new URLSearchParams();

    if (filter.search) params.append('search', filter.search);
    if (filter.startDate) params.append('startDate', filter.startDate);
    if (filter.endDate) params.append('endDate', filter.endDate);
    if (filter.sessionId) params.append('sessionId', String(filter.sessionId));
    if (filter.userId) params.append('userId', String(filter.userId));
    if (filter.shiftId) params.append('shiftId', String(filter.shiftId));
    if (filter.page) params.append('page', String(filter.page));
    if (filter.size) params.append('size', String(filter.size));

    const queryString = params.toString();
    const result = await getDataApi<InvoicesResponse>(`${salesUrl}/invoices${queryString ? `?${queryString}` : ''}`);
    return result.data;
}

export const createInvoicesApi = async (data: DispatchBody): Promise<BaseResponse<InvoiceResponseContent | null>> => {
    const result = await postDataApi<DispatchBody, InvoiceResponseContent>(`${salesUrl}/invoices`, data);
    return result;
}