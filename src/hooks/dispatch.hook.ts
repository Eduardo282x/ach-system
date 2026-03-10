import type { BaseResponse } from "@/interfaces/base.interface";
import type { DispatchBody, InvoiceResponseContent, ResumenFilter } from "@/interfaces/distpatch.interface";
import { createInvoicesApi, getResumenSalesApi, getTypesPaymentApi } from "@/services/dispatch.service";
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

export const useCreateInvoiceMutation = () => {
    return useMutation<BaseResponse<InvoiceResponseContent | null>, Error, DispatchBody>({
        mutationFn: async (data: DispatchBody) => createInvoicesApi(data),
    });
};