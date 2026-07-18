import type { User, UserBody } from "@/interfaces/users.interface";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createUserApi, deleteUserApi, getUsersApi, getUsersRolesApi, updateUserApi } from "@/services/users.service";

export const USERS_QUERY_KEY = "users";
export const USERS_ROLES_QUERY_KEY = "users-roles";

const userMatchesSearch = (user: User, search: string) => {
	if (!search) {
		return true;
	}

	const normalized = search.toLowerCase();
	return (
		user.name.toLowerCase().includes(normalized) ||
		user.username.toLowerCase().includes(normalized) ||
		user.email.toLowerCase().includes(normalized)
	);
};

const upsertUsersCache = (
	queryClient: ReturnType<typeof useQueryClient>,
	user: User,
) => {
	const queries = queryClient.getQueriesData<{ users: User[] }>({
		queryKey: [USERS_QUERY_KEY],
	});

	queries.forEach(([queryKey, oldData]) => {
		if (!oldData) {
			return;
		}

		const search = typeof queryKey[1] === "string" ? queryKey[1] : "";
		const exists = oldData.users.some((item) => item.id === user.id);
		const matches = userMatchesSearch(user, search);

		if (exists) {
			queryClient.setQueryData<{ users: User[] }>(queryKey, {
				users: matches
					? oldData.users.map((item) => (item.id === user.id ? user : item))
					: oldData.users.filter((item) => item.id !== user.id),
			});
			return;
		}

		if (matches) {
			queryClient.setQueryData<{ users: User[] }>(queryKey, {
				users: [user, ...oldData.users],
			});
		}
	});
};

export const useUsersQuery = (search: string) => {
	const normalizedSearch = search.trim();

	return useQuery({
		queryKey: [USERS_QUERY_KEY, normalizedSearch],
		queryFn: async () => {
			const response = await getUsersApi();
			if (!normalizedSearch) {
				return response;
			}

			return {
				users: response.users.filter((user) => userMatchesSearch(user, normalizedSearch)),
			};
		},
	});
};

export const useUsersRolesQuery = () => {
	return useQuery({
		queryKey: [USERS_ROLES_QUERY_KEY],
		queryFn: () => getUsersRolesApi(),
	});
};

export const useCreateUserMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: UserBody) => createUserApi(data),
		onSuccess: (response) => {
			if (response.data == null) {
				return;
			}

			upsertUsersCache(queryClient, response.data);
		},
	});
};

export const useUpdateUserMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ id, data }: { id: number; data: UserBody }) => updateUserApi(id, data),
		onMutate: async ({ id, data }) => {
			const queries = queryClient.getQueriesData<{ users: User[] }>({
				queryKey: [USERS_QUERY_KEY],
			});

			const previousQueries: Array<[{ queryKey: unknown[] }, { users: User[] } | undefined]> = [];

			queries.forEach(([queryKey, oldData]) => {
				previousQueries.push([queryKey as { queryKey: unknown[] }, oldData]);

				if (!oldData) return;

				const exists = oldData.users.some((item) => item.id === id);
				if (exists) {
					queryClient.setQueryData<{ users: User[] }>(queryKey, {
						users: oldData.users.map((item) => (item.id === id ? { ...item, ...data } : item)),
					});
				}
			});

			return { previousQueries };
		},
		onError: (_err, _variables, context) => {
			if (context?.previousQueries) {
				context.previousQueries.forEach(([queryKey, data]) => {
					queryClient.setQueryData(queryKey, data);
				});
			}
		},
		onSuccess: (response) => {
			if (response.data == null) {
				return;
			}

			upsertUsersCache(queryClient, response.data);
		},
	});
};

export const useDeleteUserMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: number) => deleteUserApi(id),
		onMutate: async (id) => {
			const queries = queryClient.getQueriesData<{ users: User[] }>({
				queryKey: [USERS_QUERY_KEY],
			});

			const previousQueries: Array<[{ queryKey: unknown[] }, { users: User[] } | undefined]> = [];

			queries.forEach(([queryKey, oldData]) => {
				previousQueries.push([queryKey as { queryKey: unknown[] }, oldData]);

				if (!oldData) return;

				queryClient.setQueryData<{ users: User[] }>(queryKey, {
					users: oldData.users.filter((item) => item.id !== id),
				});
			});

			return { previousQueries };
		},
		onError: (_err, _id, context) => {
			if (context?.previousQueries) {
				context.previousQueries.forEach(([queryKey, data]) => {
					queryClient.setQueryData(queryKey, data);
				});
			}
		},
		onSuccess: (_, id) => {
			const queries = queryClient.getQueriesData<{ users: User[] }>({
				queryKey: [USERS_QUERY_KEY],
			});

			queries.forEach(([queryKey, oldData]) => {
				if (!oldData) {
					return;
				}

				queryClient.setQueryData<{ users: User[] }>(queryKey, {
					users: oldData.users.filter((item) => item.id !== id),
				});
			});
		},
	});
};
