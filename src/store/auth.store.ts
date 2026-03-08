import type { Cashier, User } from "@/interfaces/auth.interface";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthStore {
	token: string | null;
	user: User | null;
	cashier: Cashier | null;
	isAdmin: boolean;
	setSession: (token: string, user: User) => void;
	setCashier: (cashier: Cashier) => void;
	clearSession: () => void;
	isTokenExpired: () => boolean;
}

const parseJwtPayload = (token: string): { exp?: number } | null => {
	try {
		const payloadBase64 = token.split(".")[1];
		if (!payloadBase64) {
			return null;
		}

		const normalized = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
		const decoded = atob(normalized);
		return JSON.parse(decoded) as { exp?: number };
	} catch {
		return null;
	}
};

export const useAuthStore = create<AuthStore>()(
	persist(
		(set, get) => ({
			token: null,
			user: null,
			cashier: null,
			isAdmin: false,
			setCashier: (cashier) => {
				set({ cashier });
			},
			setSession: (token, user) => {
				localStorage.setItem("token", token);
				set({ token, user, isAdmin: user.role === 'ADMIN' });
			},
			clearSession: () => {
				localStorage.removeItem("token");
				set({ token: null, user: null, cashier: null, isAdmin: false });
			},
			isTokenExpired: () => {
				const token = get().token;
				if (!token) {
					return true;
				}

				const payload = parseJwtPayload(token);
				if (!payload?.exp) {
					return false;
				}

				return Date.now() >= payload.exp * 1000;
			},
		}),
		{
			name: "auth-storage",
			partialize: (state) => ({
				token: state.token,
				user: state.user,
				cashier: state.cashier,
				isAdmin: state.isAdmin,
			}),
		},
	),
);
