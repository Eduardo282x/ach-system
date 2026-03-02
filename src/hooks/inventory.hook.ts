import type { Product, ProductBody } from "@/interfaces/inventory.interface";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createProductApi, deleteProductApi, getInventoryApi, updateProductApi } from "@/services/inventory.service";

export const INVENTORY_QUERY_KEY = "inventory";

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
        onSuccess: (_, id) => {
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
