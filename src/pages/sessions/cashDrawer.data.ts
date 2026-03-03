import type { ColumnDef } from "@/components/table/TableComponent";
import type { CashDrawer } from "@/interfaces/sessions.interface";
import { GoPencil } from "react-icons/go";

export const cashDrawerColumns: ColumnDef<CashDrawer>[] = [
    {
        header: "Caja",
        key: "name",
        width: "90%",
        element: (row) => row.name,
        visible: true,
    },
    {
        header: "Acciones",
        key: "id",
        element: () => "",
        visible: true,
        icons: () =>  [
            {
                label: "Editar",
                icon: GoPencil,
                action: "edit",
                variant: "primary",
            }
        ],
    },
];