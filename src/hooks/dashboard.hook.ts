import type { DateRangeFilter } from "@/interfaces/base.interface";
import { getDashboardApi, getDashboardTrendApi, type DashboardTrendFilter } from "@/services/dashboard.service";
import { useQuery } from "@tanstack/react-query";

export const useDashboardSummaryQuery = (filter: DateRangeFilter) => {
	return useQuery({
		queryKey: ["dashboard-summary", filter],
		queryFn: async () => getDashboardApi(filter),
		enabled: Boolean(filter.startDate && filter.endDate),
	});
};

export const useDashboardTrendQuery = (filter: DashboardTrendFilter) => {
	return useQuery({
		queryKey: ["dashboard-trend", filter],
		queryFn: async () => getDashboardTrendApi(filter),
		enabled: Boolean(filter.groupBy && filter.startDate && filter.endDate),
	});
};
