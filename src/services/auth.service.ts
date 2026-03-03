import type { LoginForm, LoginData } from "@/interfaces/auth.interface";
import { useAuthStore } from "@/store/auth.store";
import { postDataApi } from "./api.service";

export const authLoginApi = async (data: LoginForm) => {
    const result = await postDataApi<LoginForm, LoginData>("/auth/login", data);

    if (result.data == null) {
        return result;
    }

    useAuthStore.getState().setSession(result.data.token, result.data.user);
    return result;
};