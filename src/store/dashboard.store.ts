import { formatOnlyDateStringFilter, parseDateOnlyString } from "@/helpers/formatters";
import type { TrendGroupBy } from "@/interfaces/dashboard.interface";
import type { DateRange } from "react-day-picker";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const buildDefaultRange = () => {
	const today = new Date();
	return {
		from: formatOnlyDateStringFilter(new Date(today.getFullYear(), 0, 1)),
		to: formatOnlyDateStringFilter(new Date(today.getFullYear(), 5, 30)),
	};
};

const initialRange = buildDefaultRange();

interface DashboardStore {
	dateFrom: string;
	dateTo: string;
	fullFrom: string;
	fullTo: string;
	trendGroupBy: TrendGroupBy;
	activePeriod: { key: string; label: string } | null;
	setDateRange: (range: DateRange | undefined) => void;
	setFullRange: (range: DateRange | undefined) => void;
	setTrendGroupBy: (groupBy: TrendGroupBy) => void;
	setActivePeriod: (period: { key: string; label: string } | null) => void;
	resetToFullRange: () => void;
	resetFilters: () => void;
}

export const useDashboardStore = create<DashboardStore>()(
	persist(
		(set) => ({
			dateFrom: initialRange.from,
			dateTo: initialRange.to,
			fullFrom: initialRange.from,
			fullTo: initialRange.to,
			trendGroupBy: "month",
			activePeriod: null,
			setDateRange: (range) => set({
				dateFrom: formatOnlyDateStringFilter(range?.from),
				dateTo: formatOnlyDateStringFilter(range?.to),
			}),
			setFullRange: (range) => set({
				fullFrom: formatOnlyDateStringFilter(range?.from),
				fullTo: formatOnlyDateStringFilter(range?.to),
			}),
			setTrendGroupBy: (trendGroupBy) => set({ trendGroupBy }),
			setActivePeriod: (activePeriod) => set({ activePeriod }),
			resetToFullRange: () => set((state) => ({
				dateFrom: state.fullFrom,
				dateTo: state.fullTo,
				activePeriod: null,
			})),
			resetFilters: () => {
				const range = buildDefaultRange();
				set({
					dateFrom: range.from,
					dateTo: range.to,
					fullFrom: range.from,
					fullTo: range.to,
					trendGroupBy: "month",
					activePeriod: null,
				});
			},
		}),
		{
			name: "dashboard-filters",
			version: 1,
			partialize: (state) => ({
				dateFrom: state.dateFrom,
				dateTo: state.dateTo,
				fullFrom: state.fullFrom,
				fullTo: state.fullTo,
				trendGroupBy: state.trendGroupBy,
				activePeriod: state.activePeriod,
			}),
		},
	),
);

export const storedRangeToDateRange = (from: string, to: string): DateRange | undefined => {
	const fromDate = parseDateOnlyString(from);
	const toDate = parseDateOnlyString(to);

	if (!fromDate && !toDate) return undefined;

	return { from: fromDate, to: toDate };
};
