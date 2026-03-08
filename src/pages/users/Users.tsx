
import { Button } from "@/components/ui/button";
import { FilterComponent } from "@/components/table/FilterComponent";
import { SelectColumnsComponent, TableComponent } from "@/components/table/TableComponent";
import PageTransitionComponent from "@/components/PageTransition";
import { useUsersStore } from "@/store/users.store";
import { useDeleteUserMutation, useUsersQuery } from "@/hooks/users.hook";
import { FaArrowLeft } from "react-icons/fa";
import { IoMdAdd } from "react-icons/io";
import { useState } from "react";
import type { User } from "@/interfaces/users.interface";
import { UsersForm, type UsersFormMode } from "./UsersForm";
import { AlertDialogComponent } from "@/components/dialog/AlertDialogComponent";
import { BsBox } from "react-icons/bs";
import { CashDrawers } from "../sessions/CashDrawers";

export const Users = () => {
    const {
        filter,
        columns,
        toggle,
        setFilter,
        setColumns,
        openForm,
        closeForm,
    } = useUsersStore((state) => state);

    const { data, isLoading } = useUsersQuery(filter);
    const users = data?.users ?? [];

    const [userSelected, setUserSelected] = useState<User | null>(null);

    const [formMode, setFormMode] = useState<UsersFormMode>("create");
    const [openDialog, setOpenDialog] = useState(false);
    const [openCashDrawer, setOpenCashDrawer] = useState(false);

    const deleteUserMutation = useDeleteUserMutation();

    const getActionTable = (action: string, data: User) => {
        if (action === "edit") {
            setFormMode("edit");
            setUserSelected(data);
            openForm();
            return;
        }

        if (action === "delete") {
            setUserSelected(data);
            setOpenDialog(true);
        }
    };

    const deleteUser = () => {
        if (userSelected) {
            deleteUserMutation.mutate(userSelected.id);
        }
        setOpenDialog(false);
    };

    const openCreateForm = () => {
        setFormMode("create");
        setUserSelected(null);
        openForm();
    };

    const handleOpenCashDrawers = () => {
        setOpenCashDrawer(true)
        openForm();
    }

    const handleCloseCashDrawer = () => {
        closeForm();
        setTimeout(() => {
            setOpenCashDrawer(false)
        }, 500);
    }

    const handleCloseForm = () => {
        setFormMode("create");
        setUserSelected(null);
        closeForm();
    };

    return (
        <div className="w-full">
            <PageTransitionComponent toggle={toggle}>
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-2xl font-semibold mb-2 ml-2">Cajeros/Usuarios</p>
                        <Button variant="primary" onClick={handleOpenCashDrawers}><BsBox /> Ver Cajas</Button>
                    </div>

                    <div className="rounded-xl bg-white p-4">
                        <div className="w-full flex items-center justify-between mb-4">
                            <div className="w-96">
                            <FilterComponent placeholder="Buscar cajero..." onChange={setFilter} />
                            </div>

                            <div className="flex items-center gap-2">
                                <SelectColumnsComponent columns={columns} onChange={setColumns} />
                                <Button variant="primary" onClick={openCreateForm}><IoMdAdd /> Agregar Cajero</Button>
                            </div>
                        </div>

                        <TableComponent
                            onChange={getActionTable}
                            columns={columns.filter((column) => column.visible)}
                            data={isLoading ? [] : users}
                        />
                    </div>
                </div>

                <div>
                    {!openCashDrawer ? (
                        <>
                            <p className="text-2xl font-semibold mb-2 ml-2">
                                <Button variant="ghost" onClick={handleCloseForm}><FaArrowLeft /></Button>
                                {formMode === "edit" ? "Editar Cajero" : "Agregar Cajero"}
                            </p>

                            <UsersForm mode={formMode} user={userSelected} closeForm={handleCloseForm} />
                        </>
                    ) : (
                        <CashDrawers close={handleCloseCashDrawer}/>
                    )}
                </div>
            </PageTransitionComponent>

            <AlertDialogComponent
                title="Eliminar Cajero"
                description="¿Estás seguro de que deseas eliminar este cajero? Esta acción no se puede deshacer."
                open={openDialog}
                close={() => setOpenDialog(false)}
                onConfirm={deleteUser}
                onCancel={() => setOpenDialog(false)}
            />
        </div>
    );
};
