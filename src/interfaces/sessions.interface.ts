import type { DateRangeFilter } from "./base.interface";

export interface SessionFilter extends DateRangeFilter {
    cashDrawerId: number;
    status: EventType;
    shiftId?: number;
}

export interface SessionGroupFilter {
    date: Date | string;
    shiftId?: number;
}
export interface SessionGroupFilterRange {
    startDate: string;
    endDate: string;
    shiftId?: number;
}

export interface SessionsContent {
    sessions: Session[];
}

export interface Session {
    id: string;
    sessionId: number;
    eventType: EventType;
    eventAt: Date;
    status: EventType;
    openingBalance: string;
    openingBalanceUsd: string;
    closingBalance: null | string;
    closingBalanceUsd: null | string;
    totalSales: string;
    totalInBs: string;
    totalInUsd: string;
    cashDrawer: CashDrawer;
    user: User;
}

export type EventType = 'OPEN' | 'CLOSE' | 'CLOSED' | '';

export interface User {
    id: number;
    name: string;
}

export interface CashDrawer {
    id: number;
    name: string;
}

export interface CashDrawerContent {
    cashDrawers: CashDrawer[];
}

export interface CreateUpdateCashDrawer {
    cashDrawer: CashDrawer;
}

export interface SessionsGroupContent {
    sessions: SessionsGroup[];
}

export interface SessionsGroup {
    id:                number;
    userId:            number;
    cashDrawerId:      number;
    shiftId:           number;
    openedAt:          Date;
    closedAt:          Date;
    openingBalance:    string;
    openingBalanceUsd: string;
    closingBalance:    null;
    closingBalanceUsd: null;
    totalSales:        string;
    totalInUsd:        string;
    totalInBs:         string;
    status:            string;
    cashDrawer:        CashDrawer;
    user:              CashDrawer;
    shift:             Shift;
}

export interface CashDrawer {
    id:   number;
    name: string;
}

export interface Shift {
    id:        number;
    name:      string;
    startTime: string;
    endTime:   string;
}


//Body
export interface OpenSession {
    openingBalance: number;
    openingBalanceUsd: number;
    cashDrawerId: number;
}
export interface CloseSession {
    closingBalance: number;
    closingBalanceUsd: number;
}
