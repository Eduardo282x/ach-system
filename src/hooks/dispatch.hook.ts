import type { BaseResponse } from "@/interfaces/base.interface";
import type { DispatchBody, InvoicesFilter, InvoiceResponseContent, ResumenFilter } from "@/interfaces/distpatch.interface";
import { createInvoicesApi, getInvoicesApi, getResumenSalesApi, getTypesPaymentApi } from "@/services/dispatch.service";
import { useDispatchStore } from "@/store/dispatch.store";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export const TYPES_PAYMENTS = "types-payments";

export const useTypesPaymentsQuery = () => {
    const setTypesPayment = useDispatchStore((state) => state.setTypesPayments);
	const query =  useQuery({
		queryKey: [TYPES_PAYMENTS],
		queryFn: () => getTypesPaymentApi(),
	});

    useEffect(() => {
        if (query.data) {
            setTypesPayment(query.data);
        }
    }, [query.data, setTypesPayment]);

    return query;
};

export const useResumenSalesQuery = (filter: ResumenFilter) => {
	const query =  useQuery({
		queryKey: ["resumen-sales", filter],
		queryFn: async () => getResumenSalesApi(filter),
	});

    return query;
};

export const useInvoicesQuery = (filter: InvoicesFilter) => {
    return useQuery({
        queryKey: ["invoices", filter],
        queryFn: async () => getInvoicesApi(filter),
    });
};

export const useCreateInvoiceMutation = () => {
    return useMutation<BaseResponse<InvoiceResponseContent | null>, Error, DispatchBody>({
        mutationFn: async (data: DispatchBody) => createInvoicesApi(data),
    });
};