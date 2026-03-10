import type { BaseResponse } from "@/interfaces/base.interface";
import { formatOnlyDateStringFilter } from "@/helpers/formatters";
import type { DispatchBody, InvoiceResponseContent, PaymentType, ResumenContent, ResumenFilter, TypesPaymentContent } from "@/interfaces/distpatch.interface";
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
    const result = await getDataApi<ResumenContent>(`${salesUrl}/resumen${params}`);
    return result.data;
}

export const getResumenSalesExcelApi = async (filter: ResumenFilter): Promise<Blob> => {
    const parsedDate = typeof filter.date === 'string' ? filter.date : formatOnlyDateStringFilter(filter.date);
    let params = `?date=${parsedDate ?? ''}`;

    if (filter && filter.sessionId) {
        params += `&sessionId=${filter.sessionId}` ;
    }
    const result = await getDataFileApi(`${salesUrl}/resumen-excel${params}`);
    return result;
}

export const getInvoicesApi = async () => {
    const result = await getDataApi(`${salesUrl}/invoices`);
    return result.data;
}

export const createInvoicesApi = async (data: DispatchBody): Promise<BaseResponse<InvoiceResponseContent | null>> => {
    const result = await postDataApi<DispatchBody, InvoiceResponseContent>(`${salesUrl}/invoices`, data);
    return result;
}