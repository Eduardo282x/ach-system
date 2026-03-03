import type { Client } from "@/interfaces/customer.interface";
import { useQuery } from "@tanstack/react-query";
import { getCustomersApi } from "@/services/customers.service";
import { useMemo } from "react";

export const CUSTOMERS_QUERY_KEY = "customers";

const customerMatchesSearch = (customer: Client, search: string) => {
	if (!search) {
		return true;
	}

	const normalized = search.toLowerCase();
	return (
		customer.fullName.toLowerCase().includes(normalized) ||
		customer.identify.toLowerCase().includes(normalized) ||
		customer.phone.toLowerCase().includes(normalized)
	);
};

export const useCustomersQuery = (search: string) => {
	const normalizedSearch = search.trim().toLowerCase();

	const query = useQuery({
		queryKey: [CUSTOMERS_QUERY_KEY],
		queryFn: () => getCustomersApi(),
		// queryKey: [CUSTOMERS_QUERY_KEY, normalizedSearch],
		// queryFn: () => getCustomersApi(normalizedSearch),
	});

	const clients = useMemo(() => {
		const source = query.data?.clients ?? [];

		if (!normalizedSearch) {
			return source;
		}

		return source.filter((client) => customerMatchesSearch(client, normalizedSearch));
	}, [query.data?.clients, normalizedSearch]);

	return {
		...query,
		data: {
			clients,
		},
	};
};
