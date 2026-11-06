import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { RotateCcw } from "lucide-react";
import { DatePickerRange } from "@/components/datePickerRange/DatePickerRange";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDashboardTrendQuery } from "@/hooks/dashboard.hook";
import { formatNumberWithDecimal, formatOnlyDateStringFilter, translateCurrency } from "@/helpers/formatters";
import type { TrendGroupBy, TrendPeriod } from "@/interfaces/dashboard.interface";
import { cn } from "@/lib/utils";

interface SalesTrendPanelProps {
    groupBy: TrendGroupBy;
    onChangeGroupBy: (groupBy: TrendGroupBy) => void;
    overviewRange: DateRange | undefined;
    onChangeOverviewRange: (range: DateRange | undefined) => void;
    activePeriodKey?: string | null;
    onSelectPeriod: (period: TrendPeriod) => void;
    onResetPeriod: () => void;
}

type PresetKey = "3m" | "6m" | "12m" | "all" | "custom";

const PRESETS: Array<{ key: PresetKey; label: string; months?: number }> = [
    { key: "3m", label: "3 meses", months: 3 },
    { key: "6m", label: "6 meses", months: 6 },
    { key: "12m", label: "12 meses", months: 12 },
    { key: "all", label: "Historial completo" },
];

const buildMonthRange = (months: number): DateRange => {
    const today = new Date();
    return {
        from: new Date(today.getFullYear(), today.getMonth() - (months - 1), 1),
        to: new Date(today.getFullYear(), today.getMonth() + 1, 0),
    };
};

const parseDateOnly = (value: string) => new Date(`${value}T00:00:00`);

const formatCompact = (value: number) => {
    const absolute = Math.abs(value);
    if (absolute >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (absolute >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
    return Math.round(value).toString();
};

interface TrendTooltipProps {
    active?: boolean;
    payload?: Array<{ payload: TrendPeriod }>;
}

const TrendTooltip = ({ active, payload }: TrendTooltipProps) => {
    if (!active || !payload?.length) return null;

    const period = payload[0].payload;

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-md p-3 text-xs space-y-1">
            <p className="font-semibold text-blue-800">{period.label}</p>
            <p className="text-gray-600">Recibos: <span className="font-medium text-gray-900">{period.totalInvoices}</span></p>
            <p className="text-gray-600">Unidades: <span className="font-medium text-gray-900">{formatNumberWithDecimal(period.totalItems)}</span></p>
            <p className="text-gray-600">Facturado: <span className="font-medium text-gray-900">{formatNumberWithDecimal(period.totalSalesBs)} {translateCurrency("BS")}</span></p>
            <p className="text-gray-600">Ingreso neto: <span className="font-semibold text-blue-800">{formatNumberWithDecimal(period.netIncomeBs)} {translateCurrency("BS")}</span></p>
            <p className="text-gray-500">≈ {formatNumberWithDecimal(period.netIncomeUsd)} {translateCurrency("USD")}</p>
        </div>
    );
};

export const SalesTrendPanel = ({
    groupBy,
    onChangeGroupBy,
    overviewRange,
    onChangeOverviewRange,
    activePeriodKey,
    onSelectPeriod,
    onResetPeriod,
}: SalesTrendPanelProps) => {
    const [preset, setPreset] = useState<PresetKey>("12m");

    const filter = useMemo(
        () => ({
            startDate: overviewRange?.from ? formatOnlyDateStringFilter(overviewRange.from) : undefined,
            endDate: overviewRange?.to ? formatOnlyDateStringFilter(overviewRange.to) : undefined,
            groupBy,
        }),
        [overviewRange, groupBy],
    );

    const { data: trend, isLoading, isError } = useDashboardTrendQuery(filter);

    const periods = trend?.periods ?? [];
    const totals = trend?.totals;
    const hasSales = periods.some((period) => period.totalInvoices > 0);
    const isSelectable = (period: TrendPeriod) => Boolean(period.startDate && period.endDate);

    const handlePreset = (nextPreset: PresetKey, months?: number) => {
        setPreset(nextPreset);

        if (months) {
            onChangeOverviewRange(buildMonthRange(months));
            return;
        }

        if (nextPreset === "all" && trend?.bounds.firstInvoice && trend.bounds.lastInvoice) {
            onChangeOverviewRange({
                from: parseDateOnly(trend.bounds.firstInvoice),
                to: parseDateOnly(trend.bounds.lastInvoice),
            });
        }
    };

    const handleCustomRange = (range: DateRange | undefined) => {
        setPreset("custom");
        onChangeOverviewRange(range);
    };

    const handleSelectPeriod = (period: TrendPeriod) => {
        if (!isSelectable(period)) return;
        onSelectPeriod(period);
    };

    const handleReset = () => {
        onResetPeriod();
    };

    const chartInterval = periods.length > 12 ? Math.ceil(periods.length / 12) - 1 : 0;

    return (
        <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                <div>
                    <h3 className="text-lg font-bold text-blue-800">Resumen de ventas por periodo</h3>
                    <p className="text-sm text-gray-600">
                        {overviewRange?.from && overviewRange?.to
                            ? `Desde ${formatOnlyDateStringFilter(overviewRange.from)} hasta ${formatOnlyDateStringFilter(overviewRange.to)}`
                            : "Selecciona un rango para ver el resumen"}
                        {trend?.bounds.firstInvoice && (
                            <span className="text-gray-400"> · Registros desde {trend.bounds.firstInvoice}</span>
                        )}
                    </p>
                </div>

                <Tabs value={groupBy} onValueChange={(value) => onChangeGroupBy(value as TrendGroupBy)}>
                    <TabsList className="w-full justify-start xl:w-auto">
                        <TabsTrigger value="month">Mes</TabsTrigger>
                        <TabsTrigger value="week">Semana</TabsTrigger>
                        <TabsTrigger value="day">Día</TabsTrigger>
                        <TabsTrigger value="weekday">Día de semana</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-gray-600">Ver:</span>
                    {PRESETS.map((item) => (
                        <Button
                            key={item.key}
                            type="button"
                            size="sm"
                            variant={preset === item.key ? "primary" : "outline"}
                            disabled={item.key === "all" && (!trend?.bounds.firstInvoice || !trend?.bounds.lastInvoice)}
                            onClick={() => handlePreset(item.key, item.months)}
                        >
                            {item.label}
                        </Button>
                    ))}
                </div>

                <div className="flex flex-wrap items-end gap-2">
                    <DatePickerRange display="flex" value={overviewRange} onChange={handleCustomRange} />
                    {activePeriodKey && (
                        <Button type="button" size="sm" variant="outline" onClick={handleReset}>
                            <RotateCcw /> Ver rango completo
                        </Button>
                    )}
                </div>
            </div>

            {totals && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                    <div className="rounded-lg bg-gray-50 border border-gray-200 p-3">
                        <p className="text-xs text-gray-600">Total de recibos</p>
                        <p className="text-xl font-bold text-blue-800">{totals.totalInvoices}</p>
                    </div>
                    <div className="rounded-lg bg-gray-50 border border-gray-200 p-3">
                        <p className="text-xs text-gray-600">Unidades vendidas</p>
                        <p className="text-xl font-bold text-blue-800">{formatNumberWithDecimal(totals.totalItems)}</p>
                    </div>
                    <div className="rounded-lg bg-gray-50 border border-gray-200 p-3">
                        <p className="text-xs text-gray-600">Total facturado</p>
                        <p className="text-xl font-bold text-blue-800">
                            {formatNumberWithDecimal(totals.totalSalesBs)} {translateCurrency("BS")}
                        </p>
                        <p className="text-xs text-gray-500">≈ {formatNumberWithDecimal(totals.totalSalesUsd)} {translateCurrency("USD")}</p>
                    </div>
                    <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
                        <p className="text-xs text-gray-600">Ingresos netos</p>
                        <p className="text-xl font-bold text-blue-900">
                            {formatNumberWithDecimal(totals.netIncomeBs)} {translateCurrency("BS")}
                        </p>
                        <p className="text-xs text-gray-500">≈ {formatNumberWithDecimal(totals.netIncomeUsd)} {translateCurrency("USD")}</p>
                    </div>
                </div>
            )}

            {isLoading && <p className="text-sm text-gray-600">Cargando resumen por periodo...</p>}
            {isError && <p className="text-sm text-red-700">No se pudo cargar el resumen por periodo.</p>}
            {!isLoading && !isError && !hasSales && (
                <p className="text-sm text-gray-600">No hay ventas registradas para el rango seleccionado.</p>
            )}

            {!isError && periods.length > 0 && (
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={periods} margin={{ top: 8, right: 8, left: 0, bottom: 24 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                            <XAxis
                                dataKey="label"
                                tick={{ fontSize: 11, fill: "#4b5563" }}
                                interval={chartInterval}
                                angle={-25}
                                textAnchor="end"
                                height={60}
                            />
                            <YAxis
                                tick={{ fontSize: 11, fill: "#4b5563" }}
                                tickFormatter={formatCompact}
                                width={56}
                            />
                            <Tooltip content={<TrendTooltip />} cursor={{ fill: "#f3f4f6" }} />
                            <Bar
                                dataKey="netIncomeBs"
                                name="Ingreso neto"
                                radius={[6, 6, 0, 0]}
                                onClick={(_, index) => {
                                    const period = periods[index];
                                    if (period) handleSelectPeriod(period);
                                }}
                            >
                                {periods.map((period) => (
                                    <Cell
                                        key={period.key}
                                        cursor={isSelectable(period) ? "pointer" : "default"}
                                        fill={
                                            activePeriodKey === period.key
                                                ? "#f59e0b"
                                                : isSelectable(period)
                                                    ? "#1d4ed8"
                                                    : "#94a3b8"
                                        }
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {!isError && periods.length > 0 && (
                <div>
                    <p className="mb-2 text-xs text-gray-500">
                        Haz clic en un periodo para ver su detalle en el dashboard.
                        {groupBy === "weekday" && " En la agrupación por día de semana las filas son solo informativas."}
                    </p>
                    <div className="rounded-md overflow-hidden border border-gray-200 max-h-80 overflow-y-auto">
                        <div className="grid grid-cols-12 gap-1 bg-gray-100 p-2 text-xs font-semibold sticky top-0 z-10">
                            <p className="col-span-4">Periodo</p>
                            <p className="col-span-2 text-right">Recibos</p>
                            <p className="col-span-2 text-right">Unidades</p>
                            <p className="col-span-2 text-right">Facturado</p>
                            <p className="col-span-2 text-right">Ingreso neto</p>
                        </div>
                        {periods.map((period) => {
                            const selectable = isSelectable(period);
                            return (
                                <button
                                    key={period.key}
                                    type="button"
                                    disabled={!selectable}
                                    onClick={() => handleSelectPeriod(period)}
                                    className={cn(
                                        "grid w-full grid-cols-12 gap-1 border-t border-gray-100 p-2 text-left text-sm transition-colors",
                                        selectable ? "cursor-pointer hover:bg-gray-50" : "cursor-default",
                                        activePeriodKey === period.key && "bg-amber-50 hover:bg-amber-100",
                                    )}
                                >
                                    <span className={cn("col-span-4 font-medium", activePeriodKey === period.key && "text-amber-800")}>
                                        {period.label}
                                    </span>
                                    <span className="col-span-2 text-right">{period.totalInvoices}</span>
                                    <span className="col-span-2 text-right">{formatNumberWithDecimal(period.totalItems)}</span>
                                    <span className="col-span-2 text-right">
                                        {formatNumberWithDecimal(period.totalSalesBs)} {translateCurrency("BS")}
                                        <span className="block text-xs text-gray-500">≈ {formatNumberWithDecimal(period.totalSalesUsd)} {translateCurrency("USD")}</span>
                                    </span>
                                    <span className="col-span-2 text-right font-semibold text-blue-800">
                                        {formatNumberWithDecimal(period.netIncomeBs)} {translateCurrency("BS")}
                                        <span className="block text-xs font-normal text-gray-500">≈ {formatNumberWithDecimal(period.netIncomeUsd)} {translateCurrency("USD")}</span>
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
