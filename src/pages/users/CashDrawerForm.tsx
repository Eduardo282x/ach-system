import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useCreateCashDrawerMutation, useUpdateCashDrawerMutation } from "@/hooks/sessions.hook";
import type { CashDrawer } from "@/interfaces/sessions.interface";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

export type CashDrawerFormMode = "create" | "edit";

interface CashDrawerFormProps {
	mode: CashDrawerFormMode;
	cashDrawer: CashDrawer | null;
	closeForm: () => void;
}

export const CashDrawerForm = ({ mode, cashDrawer, closeForm }: CashDrawerFormProps) => {
	const createCashDrawerMutation = useCreateCashDrawerMutation();
	const updateCashDrawerMutation = useUpdateCashDrawerMutation();

	const { register, handleSubmit, reset } = useForm<{ name: string }>({
		defaultValues: {
			name: "",
		},
	});

	const isEdit = mode === "edit" && cashDrawer != null;

	const onSubmit = async (data: { name: string }) => {
		if (isEdit && cashDrawer) {
			const response = await updateCashDrawerMutation.mutateAsync({
				id: cashDrawer.id,
				name: data.name,
			});

			if (response.cashDrawer) {
				closeForm();
			}
			return;
		}

		const response = await createCashDrawerMutation.mutateAsync(data.name);

		if (response.cashDrawer) {
			closeForm();
			reset({ name: "" });
		}
	};

	useEffect(() => {
		if (isEdit && cashDrawer) {
			reset({ name: cashDrawer.name });
			return;
		}

		reset({ name: "" });
	}, [isEdit, cashDrawer, reset]);

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="w-1/2 mx-auto mt-8 grid grid-cols-2 gap-4 px-8 py-4 bg-white rounded-xl shadow-md">
			<Field className="col-span-2">
				<FieldLabel>Nombre de la Caja</FieldLabel>
				<Input {...register("name")} placeholder="Ingrese el nombre de la caja" />
			</Field>

			<Button
				variant="primary"
				type="submit"
				className="col-span-2"
				disabled={createCashDrawerMutation.isPending || updateCashDrawerMutation.isPending}
			>
				{isEdit ? "Editar Caja" : "Crear Caja"}
			</Button>
		</form>
	);
};
