import type { Shift, ShiftBody, ShiftsInterface } from "@/interfaces/shift.interface";
import { deleteDataApi, getDataApi, postDataApi, putDataApi } from "./api.service";

const shiftUrl = '/shifts';

export const getShiftsApi = async (): Promise<ShiftsInterface> => {
    const response = await getDataApi<ShiftsInterface>(`${shiftUrl}`);
    if (response.data == null) {
        return { shifts: [] };
    }
    return response.data;
}

export const createShiftApi = async (data: ShiftBody) => {
    const response = await postDataApi<ShiftBody, { shift: Shift }>(`${shiftUrl}`, data);
    return response;
}

export const updateShiftApi = async (id: number, data: ShiftBody) => {
    const response = await putDataApi<ShiftBody, { shift: Shift }>(`${shiftUrl}/${id}`, data);
    return response;
}

export const deleteShiftApi = async (id: number) => {
    const response = await deleteDataApi<Shift>(`${shiftUrl}`, id);
    return response;
}