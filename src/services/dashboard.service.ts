import type { DateRangeFilter } from "@/interfaces/base.interface";
import { formatOnlyDateStringFilter } from "@/helpers/formatters";
import { getDataApi } from "./api.service";
import type { DashboardSummary, DashboardTrend, TrendGroupBy } from "@/interfaces/dashboard.interface";

export interface DashboardTrendFilter {
    startDate?: string | Date;
    endDate?: string | Date;
    groupBy: TrendGroupBy;
}

const toDateParam = (date: string | Date) =>
    typeof date === 'string' ? date : formatOnlyDateStringFilter(date);

export const getDashboardApi = async (filter: DateRangeFilter): Promise<DashboardSummary | null> => {
    let params = '';
    if (filter && filter.startDate && filter.endDate) {
        const startDate = typeof filter.startDate === 'string' ? filter.startDate : formatOnlyDateStringFilter(filter.startDate);
        const endDate = typeof filter.endDate === 'string' ? filter.endDate : formatOnlyDateStringFilter(filter.endDate);
        params = `?startDate=${startDate}&endDate=${endDate}`;
    }
    const result = await getDataApi<DashboardSummary>(`/dashboard/summary${params}`);
    return result.data;
}

export const getDashboardTrendApi = async (filter: DashboardTrendFilter): Promise<DashboardTrend | null> => {
    const params = new URLSearchParams();
    params.set('groupBy', filter.groupBy);

    if (filter.startDate && filter.endDate) {
        params.set('startDate', toDateParam(filter.startDate));
        params.set('endDate', toDateParam(filter.endDate));
    }

    const result = await getDataApi<DashboardTrend>(`/dashboard/sales-trend?${params.toString()}`);
    return result.data;
}
