import type { DateRangeFilter } from "./base.interface";

export interface SessionFilter extends DateRangeFilter {
    cashDrawerId: number;
}

export interface SessionsContent {
    sessions: Session[];
}

export interface Session {
    id: string;
    sessionId: number;
    eventType: string;
    eventAt: Date;
    status: string;
    openingBalance: string;
    closingBalance: null | string;
    totalSales: string;
    totalInBs: string;
    totalInUsd: string;
    cashDrawer: CashDrawer;
    user: User;
}

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


//Body
export interface OpenSession {
    openingBalance: number;
    cashDrawerId: number;
}
export interface CloseSession {
    closingBalance: number;
}
