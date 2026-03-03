import type { ColumnDef } from "@/components/table/TableComponent";
import { formatDate } from "@/helpers/formatters";
import type { User } from "@/interfaces/users.interface";
import { GoPencil } from "react-icons/go";
import { FaRegTrashCan } from "react-icons/fa6";

export const usersColumns: ColumnDef<User>[] = [
    {
        header: "Nombre",
        key: "name",
        width: "18rem",
        element: (row) => row.name,
        visible: true,
    },
    {
        header: "Usuario",
        key: "username",
        width: "14rem",
        element: (row) => row.username,
        visible: true,
    },
    {
        header: "Correo",
        key: "email",
        width: "18rem",
        element: (row) => row.email.trim() === "" ? "-" : row.email,
        visible: true,
    },
    {
        header: "Rol",
        key: "role",
        width: "10rem",
        element: (row) => translateRole(row.role),
        visible: true,
    },
    {
        header: "Creación",
        key: "createdAt",
        width: "10rem",
        element: (row) => formatDate(row.createdAt),
        visible: false,
    },
    {
        header: "Acciones",
        key: "id",
        width: "8rem",
        element: () => "",
        visible: true,
        icons: () =>  [
            {
                label: "Editar",
                icon: GoPencil,
                action: "edit",
                variant: "primary",
            },
            {
                label: "Eliminar",
                icon: FaRegTrashCan,
                action: "delete",
                variant: "error",
            },
        ],
    },
];

const translateRole = (role: string) => {
    const rol = role.toLowerCase();
    switch (rol) {
        case 'admin':
            return 'Administrador';
        case 'cajero':
            return 'Cajero';
        case 'supervisor':
            return 'Supervisor';
        default:
            return role;
    }
};
