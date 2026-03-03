import type { User } from "@/interfaces/auth.interface";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthStore {
	token: string | null;
	user: User | null;
	setSession: (token: string, user: User) => void;
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
			setSession: (token, user) => {
				localStorage.setItem("token", token);
				set({ token, user });
			},
			clearSession: () => {
				localStorage.removeItem("token");
				set({ token: null, user: null });
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
			}),
		},
	),
);
