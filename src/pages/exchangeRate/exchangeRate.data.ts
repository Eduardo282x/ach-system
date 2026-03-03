import type { ColumnDef } from "@/components/table/TableComponent";
import { formatNumberWithDecimal } from "@/helpers/formatters";
import type { ExchangeRate } from "@/interfaces/inventory.interface";

export const exchangeRateColumns: ColumnDef<ExchangeRate>[] = [
    {
        header: "Moneda",
        key: "currency",
        element: (row) => row.currency,
        visible: true,
    },
    {
        header: "Valor",
        key: "rate",
        element: (row) => `${formatNumberWithDecimal(row.rate)} Bs`,
        visible: true,
    }
];
