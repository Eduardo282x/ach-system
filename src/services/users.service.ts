import type { RolesInterface, User, UserBody, UsersInterface } from "@/interfaces/users.interface";
import { getDataApi, postDataApi } from "./api.service";

const usersUrl = '/users';

export const getUsersApi = async (): Promise<UsersInterface> => {
    const response = await getDataApi<UsersInterface>(`${usersUrl}`);
    if(response.data == null) {
        return { users: [] };
    }
    return response.data;
}
export const getUsersRolesApi = async (): Promise<RolesInterface> => {
    const response = await getDataApi<RolesInterface>(`${usersUrl}/roles`);
    if(response.data == null) {
        return { roles: [] };
    }
    return response.data;
}

export const createUserApi = async (data: UserBody) => {
    const response = await postDataApi<UserBody, User>(`${usersUrl}`, data);
    return response;
}

export const updateUserApi = async (id: number, data: UserBody) => {
    const response = await postDataApi<UserBody, User>(`${usersUrl}/${id}`, data);
    return response;
}