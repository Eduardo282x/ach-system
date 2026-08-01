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
