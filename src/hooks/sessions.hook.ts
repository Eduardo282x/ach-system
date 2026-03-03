import type { CashDrawer, CloseSession, OpenSession, Session, SessionFilter } from "@/interfaces/sessions.interface";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createCashDrawerApi, closeSessionApi, getCashDrawersApi, getSessionsApi, openSessionApi, updateCashDrawerApi } from "@/services/sessions.service";

export const SESSIONS_QUERY_KEY = "sessions";
export const CASH_DRAWERS_QUERY_KEY = "cash-drawers";

const upsertCashDrawerCache = (
	queryClient: ReturnType<typeof useQueryClient>,
	cashDrawer: CashDrawer,
) => {
	const oldData = queryClient.getQueryData<{ cashDrawers: CashDrawer[] }>([CASH_DRAWERS_QUERY_KEY]);

	if (!oldData) {
		queryClient.setQueryData<{ cashDrawers: CashDrawer[] }>([CASH_DRAWERS_QUERY_KEY], {
			cashDrawers: [cashDrawer],
		});
		return;
	}

	const exists = oldData.cashDrawers.some((item) => item.id === cashDrawer.id);

	queryClient.setQueryData<{ cashDrawers: CashDrawer[] }>([CASH_DRAWERS_QUERY_KEY], {
		cashDrawers: exists
			? oldData.cashDrawers.map((item) => (item.id === cashDrawer.id ? cashDrawer : item))
			: [cashDrawer, ...oldData.cashDrawers],
	});
};

const upsertSessionCache = (
	queryClient: ReturnType<typeof useQueryClient>,
	sessions: Session[],
) => {
	if (!sessions.length) {
		return;
	}

	const queries = queryClient.getQueriesData<{ sessions: Session[] }>({
		queryKey: [SESSIONS_QUERY_KEY],
	});

	queries.forEach(([queryKey, oldData]) => {
		if (!oldData) {
			return;
		}

		const merged = [...sessions, ...oldData.sessions];
		const unique = merged.filter(
			(session, index, array) => array.findIndex((item) => item.id === session.id) === index,
		);

		queryClient.setQueryData<{ sessions: Session[] }>(queryKey, {
			sessions: unique,
		});
	});
};

export const useSessionsQuery = (filter?: Partial<SessionFilter>) => {
	const normalizedFilter = {
		startDate: filter?.startDate ? String(filter.startDate) : "",
		endDate: filter?.endDate ? String(filter.endDate) : "",
		cashDrawerId: filter?.cashDrawerId ?? 0,
	};

	return useQuery({
		queryKey: [SESSIONS_QUERY_KEY, normalizedFilter],
		queryFn: () => getSessionsApi(filter),
	});
};

export const useCashDrawersQuery = () => {
	return useQuery({
		queryKey: [CASH_DRAWERS_QUERY_KEY],
		queryFn: () => getCashDrawersApi(),
	});
};

export const useOpenSessionMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: OpenSession) => openSessionApi(data),
		onSuccess: (response) => {
			if (!response.success || response.data == null) {
				return;
			}

			upsertSessionCache(queryClient, response.data.sessions);

			queryClient.invalidateQueries({
				queryKey: [SESSIONS_QUERY_KEY],
			});
		},
	});
};

export const useCloseSessionMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CloseSession) => closeSessionApi(data),
		onSuccess: (response) => {
			if (!response.success || response.data == null) {
				return;
			}

			upsertSessionCache(queryClient, response.data.sessions);

			queryClient.invalidateQueries({
				queryKey: [SESSIONS_QUERY_KEY],
			});
		},
	});
};

export const useCreateCashDrawerMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (name: string) => createCashDrawerApi(name),
		onSuccess: (response) => {
			if (!response.cashDrawer) {
				return;
			}

			upsertCashDrawerCache(queryClient, response.cashDrawer);
		},
	});
};

export const useUpdateCashDrawerMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ id, name }: { id: number; name: string }) => updateCashDrawerApi(id, name),
		onSuccess: (response) => {
			if (!response.cashDrawer) {
				return;
			}

			upsertCashDrawerCache(queryClient, response.cashDrawer);
		},
	});
};
