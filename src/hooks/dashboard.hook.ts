import type { DateRangeFilter } from "@/interfaces/base.interface";
import { getDashboardApi } from "@/services/dashboard.service";
import { useQuery } from "@tanstack/react-query";

export const useDashboardSummaryQuery = (filter: DateRangeFilter) => {
	return useQuery({
		queryKey: ["dashboard-summary", filter],
		queryFn: async () => getDashboardApi(filter),
		enabled: Boolean(filter.startDate && filter.endDate),
	});
};
