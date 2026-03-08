import type { LoginForm, LoginData } from "@/interfaces/auth.interface";
import { useAuthStore } from "@/store/auth.store";
import { postDataApi } from "./api.service";

export const authLoginApi = async (data: LoginForm) => {
    const result = await postDataApi<LoginForm, LoginData>("/auth/login", data);

    if (result.data == null) {
        return result;
    }

    useAuthStore.getState().setSession(result.data.token, result.data.user);
    if(result.data.user.role === "CAJERO") {
        useAuthStore.getState().setCashier({
            id: result.data.user.id,
            name: result.data.user.name,
            cashDrawer: result.data.user.id.toString(),
        });
    }
    return result;
};