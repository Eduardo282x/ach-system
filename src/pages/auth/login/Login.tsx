import { ScreenLoader } from "@/components/loader/ScreenLoader";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { LoginForm } from "@/interfaces/auth.interface";
import { authLoginApi } from "@/services/auth.service";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaRegEye } from "react-icons/fa";
import { FaRegEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router";

export const Login = () => {
    const [show, setShow] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const navigate = useNavigate();
    const { register, handleSubmit } = useForm<LoginForm>({
        defaultValues: {
            username: '',
            password: ''
        }
    });

    const onSubmit = async (data: LoginForm) => {
        setLoading(true);
        const result = await authLoginApi(data);

        if (result.data == null) {
            console.log(result.message);
            setLoading(false);
            return;
        }
        setLoading(false);

        if (result.data.user.role === "CAJERO") {
            setTimeout(() => {
                navigate("/despacho");
            }, 1500);
            return;
        } else {
            setTimeout(() => {
                navigate("/inventory");
            }, 1500);
        }
    }

    return (
        <div className="w-full h-full flex items-center justify-center bg-gray-200">
            {loading && (<ScreenLoader />)}
            <form onSubmit={handleSubmit(onSubmit)} className="shadow-xl p-8 rounded-lg bg-white w-120 h-96 text-center flex flex-col justify-between">
                <div>
                    <h1 className="text-3xl font-semibold">Sistema POS</h1>
                    <span className="text-sm text-gray-600">Facturación y Gestión</span>
                </div>

                <Field>
                    <FieldLabel>Usuario</FieldLabel>
                    <Input {...register('username')} />
                </Field>

                <Field>
                    <FieldLabel>Contraseña</FieldLabel>
                    <div className="w-full relative">
                        <Input type={show ? "text" : "password"} {...register('password')} />
                        <button type="button" className="absolute flex items-center h-full top-0 right-4 cursor-pointer" onClick={() => setShow(!show)}>
                            {show ? <FaRegEye /> : <FaRegEyeSlash />}
                        </button>
                    </div>
                </Field>

                <Button className="w-full py-6 text-lg" variant="primary" type="submit">Iniciar Sesión</Button>
                <span className="text-xs text-gray-600">Sistema de Gestión Local v2.0</span>
            </form>
        </div>
    );
};