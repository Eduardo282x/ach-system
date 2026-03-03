import type { BaseResponse } from "@/interfaces/base.interface";
import { useAuthStore } from "@/store/auth.store";
import axios from "axios";

export const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api`,
});

const getApiError = (error: unknown): BaseResponse<null> => {
    if (axios.isAxiosError(error)) {
        return {
            message: error.response?.data?.message || error.message || "Error de servidor",
            statusCode: error.response?.status || 500,
            success: false,
            data: null,
        };
    }

    return {
        message: "Error inesperado",
        statusCode: 500,
        success: false,
        data: null,
    };
};

export const getDataApi = async <R>(url: string): Promise<BaseResponse<R | null>> => {
    try {
        const res = await api.get<BaseResponse<R>>(url);
        return res.data;
    } catch (error) {
        return getApiError(error);
    }
};

export const postDataApi = async <T, R>(url: string, data: T): Promise<BaseResponse<R | null>> => {
    try {
        const res = await api.post<BaseResponse<R>>(url, data).then((response) => response.data);
        return res;
    } catch (error: unknown) {
        return getApiError(error);
    }
};

export const putDataApi = async <T, R>(endpoint: string, data: T): Promise<BaseResponse<R | null>> => {
    try {
        const response = await api.put<BaseResponse<R>>(endpoint, data);
        return response.data;
    } catch (error: unknown) {
        return getApiError(error);
    }
};

export const deleteDataApi = async <R>(endpoint: string, data: number | string): Promise<BaseResponse<R | null>> => {
    try {
        const response = await api.delete<BaseResponse<R>>(`${endpoint}/${data}`);
        return response.data;
    } catch (error: unknown) {
        return getApiError(error);
    };
};

// Interceptors
api.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token || localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error),
);

// api.interceptors.response.use(
//     (res) => res,
//     (error) => {
//         if (error.response?.status === 401) {
//             useAuthStore.getState().clearSession();
//             window.location.href = "/login";
//         }
//         return Promise.reject(error);
//     },
// );