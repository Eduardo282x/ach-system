import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useCreateShiftMutation, useUpdateShiftMutation } from "@/hooks/shifts.hook";
import type { Shift, ShiftBody } from "@/interfaces/shift.interface";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type ShiftFormMode = "create" | "edit";

interface ShiftFormProps {
	mode: ShiftFormMode;
	shift: Shift | null;
	closeForm: () => void;
}

export const ShiftForm = ({ mode, shift, closeForm }: ShiftFormProps) => {
	const isEdit = mode === "edit";
	const createShiftMutation = useCreateShiftMutation();
	const updateShiftMutation = useUpdateShiftMutation();

	const { register, handleSubmit, reset, formState: { errors } } = useForm<ShiftBody>({
		defaultValues: {
			name: "",
			startTime: "",
			endTime: "",
		},
	});

	useEffect(() => {
		if (isEdit && shift) {
			reset({
				name: shift.name,
				startTime: shift.startTime,
				endTime: shift.endTime,
			});
		} else {
			reset({ name: "", startTime: "", endTime: "" });
		}
	}, [isEdit, shift, reset]);

	const onSubmit = async (data: ShiftBody) => {
		if (isEdit && shift) {
			await updateShiftMutation.mutateAsync({ id: shift.id, data });
		} else {
			await createShiftMutation.mutateAsync(data);
		}
		closeForm();
	};

	const isPending = createShiftMutation.isPending || updateShiftMutation.isPending;

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="w-1/2 mx-auto mt-8 grid grid-cols-2 gap-4 px-8 py-4 bg-white rounded-xl shadow-md">
			<div className="flex flex-col gap-2">
				<Label htmlFor="name">Nombre del Turno</Label>
				<Input id="name" placeholder="Nombre del turno" {...register("name", { required: "El nombre es requerido" })} />
				{errors.name && <span className="text-red-500 text-sm">{errors.name.message}</span>}
			</div>

			<div className="flex flex-col gap-2">
				<Label htmlFor="startTime">Hora de Inicio</Label>
				<Input id="startTime" type="time" {...register("startTime", { required: "La hora de inicio es requerida" })} />
				{errors.startTime && <span className="text-red-500 text-sm">{errors.startTime.message}</span>}
			</div>

			<div className="flex flex-col gap-2">
				<Label htmlFor="endTime">Hora de Fin</Label>
				<Input id="endTime" type="time" {...register("endTime", { required: "La hora de fin es requerida" })} />
				{errors.endTime && <span className="text-red-500 text-sm">{errors.endTime.message}</span>}
			</div>

			<div className="col-span-2 flex justify-end mt-4">
				<Button type="submit" variant="primary" disabled={isPending}>
					{isPending ? "Guardando..." : isEdit ? "Editar Turno" : "Crear Turno"}
				</Button>
			</div>
		</form>
	);
};
