import type { Supplier } from "@/interfaces/suppliers.interface";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createSupplierApi, getSuppliersApi, updateSupplierApi } from "@/services/suppliers.service";
import { useMemo } from "react";

export const SUPPLIERS_QUERY_KEY = "suppliers";

const supplierMatchesSearch = (supplier: Supplier, search: string) => {
	if (!search) {
		return true;
	}

	const normalized = search.toLowerCase();
	return (
		(supplier.name ?? '').toLowerCase().includes(normalized) ||
		(supplier.identify ?? '').toLowerCase().includes(normalized) ||
		(supplier.phone ?? '').toLowerCase().includes(normalized)
	);
};

export const useSuppliersQuery = (search: string) => {
	const normalizedSearch = search.trim().toLowerCase();

	const query = useQuery({
		queryKey: [SUPPLIERS_QUERY_KEY],
		queryFn: () => getSuppliersApi(),
	});

	const suppliers = useMemo(() => {
		const source = query.data?.suppliers ?? [];

		if (!normalizedSearch) {
			return source;
		}

		return source.filter((supplier) => supplierMatchesSearch(supplier, normalizedSearch));
	}, [query.data?.suppliers, normalizedSearch]);

	return {
		...query,
		data: {
			suppliers,
		},
	};
};

export const useCreateSupplierMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: Omit<Supplier, 'id'>) => createSupplierApi(data),
		onSuccess: async (response) => {
			if (response.data == null) {
				return;
			}

			await queryClient.invalidateQueries({ queryKey: [SUPPLIERS_QUERY_KEY] });
		},
	});
};

export const useUpdateSupplierMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ id, data }: { id: number; data: Omit<Supplier, 'id'> }) => updateSupplierApi(id, data),
		onSuccess: async (response) => {
			if (response.data == null) {
				return;
			}

			await queryClient.invalidateQueries({ queryKey: [SUPPLIERS_QUERY_KEY] });
		},
	});
};
