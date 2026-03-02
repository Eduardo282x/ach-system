import type { ApiError, ApiResult, BaseResponse } from "@/interfaces/base.interface";
import axios from "axios";

export const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api`,
});

const getApiError = (error: unknown): ApiError => {
    if (axios.isAxiosError(error)) {
        return {
            message: error.response?.data?.message || error.message || "Error de servidor",
            statusCode: error.response?.status || 500,
            details: error.response?.data,
        };
    }

    return {
        message: "Error inesperado",
        statusCode: 500,
        details: error,
    };
};

export const getDataApi = async <R>(url: string): Promise<ApiResult<R>> => {
    try {
        const res = await api.get<BaseResponse<R>>(url);
        return {
            data: res.data.data,
            error: null,
        };
    } catch (error) {
        return {
            data: null,
            error: getApiError(error),
        };
    }
};

export const postDataApi = async <T, R>(url: string, data: T): Promise<ApiResult<R>> => {
    try {
        const res = await api.post<BaseResponse<R>>(url, data);
        return {
            data: res.data.data,
            error: null,
        };
    } catch (error: unknown) {
        return {
            data: null,
            error: getApiError(error),
        };
    }
};

export const putDataApi = async <T, R>(endpoint: string, data: T): Promise<ApiResult<R>> => {
    try {
        const response = await api.put<BaseResponse<R>>(endpoint, data);
        return {
            data: response.data.data,
            error: null,
        };
    } catch (error: unknown) {
        return {
            data: null,
            error: getApiError(error),
        };
    }
};

export const deleteDataApi = async <R>(endpoint: string, data: number | string): Promise<ApiResult<R>> => {
    try {
        const response = await api.delete<BaseResponse<R>>(`${endpoint}/${data}`);
        return {
            data: response.data.data,
            error: null,
        };
    } catch (error: unknown) {
        return {
            data: null,
            error: getApiError(error),
        };
    }
};

// Interceptors
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

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
//             localStorage.removeItem("token");
//             window.location.href = "/login";
//         }
//         return Promise.reject(error);
//     },
// );