import type { DateRangeFilter } from "./base.interface";

export interface SessionFilter extends DateRangeFilter {
    cashDrawerId: number;
    status: EventType;
}

export interface SessionGroupFilter {
    date: Date | string;
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
}

export interface CashDrawer {
    id:   number;
    name: string;
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
