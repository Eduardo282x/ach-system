
import { Button } from "@/components/ui/button";
import { FilterComponent } from "@/components/table/FilterComponent";
import { SelectColumnsComponent, TableComponent } from "@/components/table/TableComponent";
import PageTransitionComponent from "@/components/PageTransition";
import { useUsersStore } from "@/store/users.store";
import { useDeleteUserMutation, useUsersQuery } from "@/hooks/users.hook";
import { useCashDrawersQuery } from "@/hooks/sessions.hook";
import { FaArrowLeft } from "react-icons/fa";
import { IoMdAdd } from "react-icons/io";
import { useState } from "react";
import type { User } from "@/interfaces/users.interface";
import type { CashDrawer } from "@/interfaces/sessions.interface";
import { UsersForm, type UsersFormMode } from "./UsersForm";
import { CashDrawerForm, type CashDrawerFormMode } from "./CashDrawerForm";
import { AlertDialogComponent } from "@/components/dialog/AlertDialogComponent";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cashDrawerColumns } from "../sessions/cashDrawer.data";

export const Users = () => {
    const {
        filter,
        columns,
        toggle,
        activeTab,
        formType,
        setFilter,
        setColumns,
        openForm,
        closeForm,
        setActiveTab,
        setFormType,
    } = useUsersStore((state) => state);

    const { data, isLoading } = useUsersQuery(filter);
    const users = data?.users ?? [];

    const { data: cashDrawersData, isLoading: isLoadingCashDrawers } = useCashDrawersQuery();
    const cashDrawers = cashDrawersData?.cashDrawers ?? [];

    const [cashDrawerFilter, setCashDrawerFilter] = useState("");

    const filteredCashDrawers = cashDrawers.filter((cd) =>
        cd.name.toLowerCase().includes(cashDrawerFilter.toLowerCase())
    );

    const [userSelected, setUserSelected] = useState<User | null>(null);
    const [cashDrawerSelected, setCashDrawerSelected] = useState<CashDrawer | null>(null);

    const [formMode, setFormMode] = useState<UsersFormMode>("create");
    const [cashDrawerFormMode, setCashDrawerFormMode] = useState<CashDrawerFormMode>("create");
    const [openDialog, setOpenDialog] = useState(false);

    const deleteUserMutation = useDeleteUserMutation();

    const handleUserAction = (action: string, data: User) => {
        if (action === "edit") {
            setFormType("user");
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

    const handleCashDrawerAction = (action: string, data: CashDrawer) => {
        if (action === "edit") {
            setFormType("cashDrawer");
            setCashDrawerFormMode("edit");
            setCashDrawerSelected(data);
            openForm();
        }
    };

    const deleteUser = () => {
        if (userSelected) {
            deleteUserMutation.mutate(userSelected.id);
        }
        setOpenDialog(false);
    };

    const openCreateUserForm = () => {
        setFormType("user");
        setFormMode("create");
        setUserSelected(null);
        openForm();
    };

    const openCreateCashDrawerForm = () => {
        setFormType("cashDrawer");
        setCashDrawerFormMode("create");
        setCashDrawerSelected(null);
        openForm();
    };

    const handleCloseForm = () => {
        setFormType("user");
        setFormMode("create");
        setUserSelected(null);
        setCashDrawerFormMode("create");
        setCashDrawerSelected(null);
        closeForm();
    };

    const handleTabChange = (value: string) => {
        setActiveTab(value as "usuarios" | "cajas");
    };

    return (
        <div className="w-full">
            <PageTransitionComponent toggle={toggle}>
                <div>
                    <div className="flex items-center gap-4 mb-2 ml-2">
                        <Tabs value={activeTab} onValueChange={handleTabChange}>
                            <TabsList>
                                <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
                                <TabsTrigger value="cajas">Cajas</TabsTrigger>
                            </TabsList>
                        </Tabs>
                        <p className="text-2xl font-semibold">
                            {activeTab === "usuarios" ? "Cajeros/Usuarios" : "Cajas"}
                        </p>
                    </div>

                    {activeTab === "usuarios" ? (
                        <div className="rounded-xl bg-white p-4">
                            <div className="w-full flex items-center justify-between mb-4">
                                <div className="w-96">
                                    <FilterComponent placeholder="Buscar cajero..." onChange={setFilter} />
                                </div>

                                <div className="flex items-center gap-2">
                                    <SelectColumnsComponent columns={columns} onChange={setColumns} />
                                    <Button variant="primary" onClick={openCreateUserForm}><IoMdAdd /> Agregar Cajero</Button>
                                </div>
                            </div>

                            <TableComponent
                                onChange={handleUserAction}
                                columns={columns.filter((column) => column.visible)}
                                data={isLoading ? [] : users}
                            />
                        </div>
                    ) : (
                        <div className="rounded-xl bg-white p-4">
                            <div className="w-full flex items-center justify-between mb-4">
                                <div className="w-96">
                                    <FilterComponent placeholder="Buscar caja..." onChange={setCashDrawerFilter} />
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button variant="primary" onClick={openCreateCashDrawerForm}><IoMdAdd /> Agregar Caja</Button>
                                </div>
                            </div>

                            <TableComponent
                                onChange={handleCashDrawerAction}
                                columns={cashDrawerColumns}
                                data={isLoadingCashDrawers ? [] : filteredCashDrawers}
                            />
                        </div>
                    )}
                </div>

                <div>
                    {formType === "user" ? (
                        <>
                            <p className="text-2xl font-semibold mb-2 ml-2">
                                <Button variant="ghost" onClick={handleCloseForm}><FaArrowLeft /></Button>
                                {formMode === "edit" ? "Editar Cajero" : "Agregar Cajero"}
                            </p>

                            <UsersForm mode={formMode} user={userSelected} closeForm={handleCloseForm} />
                        </>
                    ) : (
                        <>
                            <p className="text-2xl font-semibold mb-2 ml-2">
                                <Button variant="ghost" onClick={handleCloseForm}><FaArrowLeft /></Button>
                                {cashDrawerFormMode === "edit" ? "Editar Caja" : "Agregar Caja"}
                            </p>

                            <CashDrawerForm mode={cashDrawerFormMode} cashDrawer={cashDrawerSelected} closeForm={handleCloseForm} />
                        </>
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
