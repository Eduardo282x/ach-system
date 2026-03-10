import type { DispatchBody, PaymentType, TypesPaymentContent } from "@/interfaces/distpatch.interface";
import { getDataApi, postDataApi } from "./api.service";

const salesUrl = '/sales';

export const getTypesPaymentApi = async (): Promise<PaymentType[]> => {
    const result = await getDataApi<TypesPaymentContent>(`${salesUrl}/types-payment`);
    return result.data?.paymentTypes ?? [];
}

export const getInvoicesApi = async () => {
    const result = await getDataApi(`${salesUrl}/invoices`);
    return result.data;
}

export const createInvoicesApi = async (data: DispatchBody) => {
    const result = await postDataApi<DispatchBody, unknown>(`${salesUrl}/invoices`, data);
    return result;
}