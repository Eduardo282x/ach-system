import type { DateRangeFilter } from "@/interfaces/base.interface";
import { formatOnlyDateStringFilter } from "@/helpers/formatters";
import { getDataApi } from "./api.service";
import type { DashboardSummary } from "@/interfaces/dashboard.interface";

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