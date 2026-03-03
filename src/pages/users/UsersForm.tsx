import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateUserMutation, useUpdateUserMutation, useUsersRolesQuery } from "@/hooks/users.hook";
import type { User, UserBody } from "@/interfaces/users.interface";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";

export type UsersFormMode = "create" | "edit";

interface UsersFormProps {
	mode: UsersFormMode;
	user: User | null;
	closeForm: () => void;
}

export const UsersForm = ({ mode, user, closeForm }: UsersFormProps) => {
	const createUserMutation = useCreateUserMutation();
	const updateUserMutation = useUpdateUserMutation();
	const { data: rolesData } = useUsersRolesQuery();
	const roles = rolesData?.roles ?? [];

	const { register, handleSubmit, control, reset } = useForm<UserBody>({
		defaultValues: {
			name: "",
			username: "",
			password: "",
			role: "",
			email: "",
		},
	});

	const isEdit = mode === "edit" && user != null;

	const onSubmit = async (data: UserBody) => {
		if (isEdit && user) {
			const response = await updateUserMutation.mutateAsync({
				id: user.id,
				data,
			});

			if (response.data != null && response.success) {
				closeForm();
			}
			return;
		}

		const response = await createUserMutation.mutateAsync(data);

		if (response.data != null && response.success) {
			closeForm();
			reset({
				name: "",
				username: "",
				password: "",
				role: "",
				email: "",
			});
		}
	};

	useEffect(() => {
		if (isEdit && user) {
			reset({
				name: user.name,
				username: user.username,
				password: "",
				role: user.role,
				email: user.email,
			});
			return;
		}

		reset({
			name: "",
			username: "",
			password: "",
			role: "",
			email: "",
		});
	}, [isEdit, user, reset]);

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="w-1/2 mx-auto mt-8 h-full grid grid-cols-2 gap-4 px-8 py-4 bg-white rounded-xl shadow-md">
			<Field className="col-span-1">
				<FieldLabel>Nombre</FieldLabel>
				<Input {...register("name")} />
			</Field>

			<Field className="col-span-1">
				<FieldLabel>Usuario</FieldLabel>
				<Input {...register("username")} />
			</Field>

			<Field className="col-span-1">
				<FieldLabel>Correo</FieldLabel>
				<Input type="email" {...register("email")} />
			</Field>

			<Controller
				name="role"
				control={control}
				render={({ field }) => (
					<Field className="col-span-1">
						<FieldLabel>Rol</FieldLabel>
						<Select
							name={field.name}
							value={field.value}
							onValueChange={field.onChange}
						>
							<SelectTrigger>
								<SelectValue placeholder="Seleccione un rol" />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									{roles.map((role) => (
										<SelectItem key={role.role} value={role.role}>{role.name}</SelectItem>
									))}
								</SelectGroup>
							</SelectContent>
						</Select>
					</Field>
				)}
			/>

			<Field className="col-span-2">
				<FieldLabel>
					Contraseña {isEdit && <span className="text-gray-500 text-sm font-normal">(Requerida por API)</span>}
				</FieldLabel>
				<Input type="password" {...register("password")} />
			</Field>

			<Button
				variant="primary"
				type="submit"
				className="col-span-2"
				disabled={createUserMutation.isPending || updateUserMutation.isPending}
			>
				Guardar Usuario
			</Button>
		</form>
	);
};
