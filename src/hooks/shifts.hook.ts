import type { Shift, ShiftBody } from "@/interfaces/shift.interface";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createShiftApi, deleteShiftApi, getShiftsApi, updateShiftApi } from "@/services/shifts.service";

export const SHIFTS_QUERY_KEY = "shifts";

export const useShiftsQuery = () => {
	return useQuery({
		queryKey: [SHIFTS_QUERY_KEY],
		queryFn: () => getShiftsApi(),
	});
};

export const useCreateShiftMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: ShiftBody) => createShiftApi(data),
		onSuccess: (response) => {
			if (response.data == null) {
				return;
			}

			const shift = response.data.shift;
			const queries = queryClient.getQueriesData<{ shifts: Shift[] }>({
				queryKey: [SHIFTS_QUERY_KEY],
			});

			queries.forEach(([queryKey, oldData]) => {
				if (!oldData) {
					return;
				}

				queryClient.setQueryData<{ shifts: Shift[] }>(queryKey, {
					shifts: [shift, ...oldData.shifts],
				});
			});
		},
	});
};

export const useUpdateShiftMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ id, data }: { id: number; data: ShiftBody }) => updateShiftApi(id, data),
		onMutate: async ({ id, data }) => {
			const queries = queryClient.getQueriesData<{ shifts: Shift[] }>({
				queryKey: [SHIFTS_QUERY_KEY],
			});

			const previousQueries: Array<[{ queryKey: unknown[] }, { shifts: Shift[] } | undefined]> = [];

			queries.forEach(([queryKey, oldData]) => {
				previousQueries.push([queryKey as { queryKey: unknown[] }, oldData]);

				if (!oldData) return;

				const exists = oldData.shifts.some((item) => item.id === id);
				if (exists) {
					queryClient.setQueryData<{ shifts: Shift[] }>(queryKey, {
						shifts: oldData.shifts.map((item) => (item.id === id ? { ...item, ...data } : item)),
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

			const updated = response.data.shift;
			const queries = queryClient.getQueriesData<{ shifts: Shift[] }>({
				queryKey: [SHIFTS_QUERY_KEY],
			});

			queries.forEach(([queryKey, oldData]) => {
				if (!oldData) {
					return;
				}

				queryClient.setQueryData<{ shifts: Shift[] }>(queryKey, {
					shifts: oldData.shifts.map((item) => (item.id === updated.id ? updated : item)),
				});
			});
		},
	});
};

export const useDeleteShiftMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: number) => deleteShiftApi(id),
		onMutate: async (id) => {
			const queries = queryClient.getQueriesData<{ shifts: Shift[] }>({
				queryKey: [SHIFTS_QUERY_KEY],
			});

			const previousQueries: Array<[{ queryKey: unknown[] }, { shifts: Shift[] } | undefined]> = [];

			queries.forEach(([queryKey, oldData]) => {
				previousQueries.push([queryKey as { queryKey: unknown[] }, oldData]);

				if (!oldData) return;

				queryClient.setQueryData<{ shifts: Shift[] }>(queryKey, {
					shifts: oldData.shifts.filter((item) => item.id !== id),
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
			const queries = queryClient.getQueriesData<{ shifts: Shift[] }>({
				queryKey: [SHIFTS_QUERY_KEY],
			});

			queries.forEach(([queryKey, oldData]) => {
				if (!oldData) {
					return;
				}

				queryClient.setQueryData<{ shifts: Shift[] }>(queryKey, {
					shifts: oldData.shifts.filter((item) => item.id !== id),
				});
			});
		},
	});
};
