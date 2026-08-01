export interface ShiftsInterface {
    shifts: Shift[];
}

export interface Shift {
    id: number;
    name: string;
    startTime: string;
    endTime: string;
    active: boolean;
    createdAt: Date;
}

export interface ShiftBody {
    name: string;
    startTime: string;
    endTime: string;
}