import type { LoginForm, LoginData } from "@/interfaces/auth.interface";
import { postDataApi } from "./api.service";

export const authLoginApi = async (data: LoginForm) => {
    const result = await postDataApi<LoginForm, LoginData>("/auth/login", data);

    if (result.error || !result.data) {
        return result;
    }

    localStorage.setItem("token", result.data.token);
    return result;
};