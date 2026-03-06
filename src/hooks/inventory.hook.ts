import type { ExchangeRateBody, Product, ProductBody } from "@/interfaces/inventory.interface";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { breakDownProductApi, createProductApi, deleteProductApi, getExchangeRateAutomaticApi, getExchangeRateTodayApi, getInventoryApi, getInventoryHistoryApi, postExchangeRateApi, updateProductApi } from "@/services/inventory.service";
import { useInventoryStore } from "@/store/inventory.store";
import { useEffect } from "react";
import type { Pagination } from "@/interfaces/base.interface";

export const INVENTORY_QUERY_KEY = "inventory";
export const EXCHANGE_RATE_TODAY_QUERY_KEY = "exchange-rate-today";
export const EXCHANGE_RATE_AUTOMATIC_QUERY_KEY = "exchange-rate-automatic";

const productMatchesSearch = (product: Product, search: string) => {
	if (!search) {
		return true;
	}

	const normalized = search.toLowerCase();
	return (
		product.name.toLowerCase().includes(normalized) ||
		product.barcode.toLowerCase().includes(normalized)
	);
};

const upsertInventoryCache = (
	queryClient: ReturnType<typeof useQueryClient>,
	product: Product,
) => {
	const queries = queryClient.getQueriesData<{ products: Product[] }>({
		queryKey: [INVENTORY_QUERY_KEY],
	});

	queries.forEach(([queryKey, oldData]) => {
		if (!oldData) {
			return;
		}

		const search = typeof queryKey[1] === "string" ? queryKey[1] : "";
		const exists = oldData.products.some((item) => item.id === product.id);
		const matches = productMatchesSearch(product, search);

		if (exists) {
			queryClient.setQueryData<{ products: Product[] }>(queryKey, {
				products: matches
					? oldData.products.map((item) => (item.id === product.id ? product : item))
					: oldData.products.filter((item) => item.id !== product.id),
			});
			return;
		}

		if (matches) {
			queryClient.setQueryData<{ products: Product[] }>(queryKey, {
				products: [product, ...oldData.products],
			});
		}
	});
};

export const useInventoryQuery = (search: string) => {
	const normalizedSearch = search.trim();

	return useQuery({
		queryKey: [INVENTORY_QUERY_KEY, normalizedSearch],
		queryFn: () => getInventoryApi(normalizedSearch || undefined),
	});
};

export const useInventoryHistoryQuery = (filter: Pagination) => {
	return useQuery({
		queryKey: [INVENTORY_QUERY_KEY, filter],
		queryFn: () => getInventoryHistoryApi(filter),
	});
};

export const useExchangeRateTodayQuery = () => {
	const setExchangeRates = useInventoryStore((state) => state.setExchangeRates);

	const query = useQuery({
		queryKey: [EXCHANGE_RATE_TODAY_QUERY_KEY],
		queryFn: () => getExchangeRateTodayApi(),
	});

	useEffect(() => {
		if (query.data) {
			setExchangeRates(query.data.exchangeRate);
		}
	}, [query.data, setExchangeRates]);

	return query;
};

export const useExchangeRateAutomaticQuery = () => {
	const setExchangeRates = useInventoryStore((state) => state.setExchangeRates);

	const query = useQuery({
		queryKey: [EXCHANGE_RATE_AUTOMATIC_QUERY_KEY],
		queryFn: () => getExchangeRateAutomaticApi(),
		enabled: false,
	});

	useEffect(() => {
		if (Array.isArray(query.data)) {
			setExchangeRates(query.data);
		}
	}, [query.data, setExchangeRates]);

	return query;
};

export const useExchangeRateMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: ExchangeRateBody) => postExchangeRateApi(data),
		onSuccess: (response) => {
			if (response == null) {
				return;
			}

			const currentRates = useInventoryStore.getState().exchangeRates;
			const exists = currentRates.some((rate) => rate.currency === response.currency);

			const updatedRates = exists
				? currentRates.map((rate) => (rate.currency === response.currency ? response : rate))
				: [response, ...currentRates];

			useInventoryStore.getState().setExchangeRates(updatedRates);

			queryClient.setQueryData<{ exchangeRate: typeof updatedRates }>(
				[EXCHANGE_RATE_TODAY_QUERY_KEY],
				{ exchangeRate: updatedRates },
			);
		},
	});
};

export const useCreateProductMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: ProductBody) => createProductApi(data),
		onSuccess: (response) => {
			if (response.data == null) {
				return;
			}

			upsertInventoryCache(queryClient, response.data);
		},
	});
};

export const useUpdateProductMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ id, data }: { id: number; data: ProductBody }) => updateProductApi(id, data),
		onSuccess: (response) => {
			if (response.data == null) {
				return;
			}

			upsertInventoryCache(queryClient, response.data);
		},
	});
};

export const useDeleteProductMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: number) => deleteProductApi(id),
		onSuccess: (response, id) => {
			if (!response.success) {
				return;
			}

			const queries = queryClient.getQueriesData<{ products: Product[] }>({
				queryKey: [INVENTORY_QUERY_KEY],
			});

			queries.forEach(([queryKey, oldData]) => {
				if (!oldData) {
					return;
				}

				const search = typeof queryKey[1] === "string" ? queryKey[1] : "";
				const matches = productMatchesSearch({ id } as Product, search);

				if (matches) {
					queryClient.setQueryData<{ products: Product[] }>(queryKey, {
						products: oldData.products.filter((item) => item.id !== id),
					});
				}
			});
		},
	});
};

export const useBreakDownProductMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (childId: number) => breakDownProductApi({ childId }),
		onSuccess: async (response) => {
			if (response.data == null) {
				return;
			}

			await queryClient.invalidateQueries({
				queryKey: [INVENTORY_QUERY_KEY],
			});
		},
	});
};
