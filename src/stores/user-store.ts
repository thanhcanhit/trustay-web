import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
	id: string;
	name: string;
	email: string;
	avatar?: string;
}

interface UserState {
	user: User | null;
	isAuthenticated: boolean;
	login: (user: User) => void;
	logout: () => void;
}

export const useUserStore = create<UserState>()(
	persist(
		(set) => ({
			user: null,
			isAuthenticated: false,
			login: (user: User) => set({ user, isAuthenticated: true }),
			logout: () => set({ user: null, isAuthenticated: false }),
		}),
		{
			name: 'user-storage',
		},
	),
);
