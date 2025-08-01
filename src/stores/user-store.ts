import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
	id: string;
	name: string;
	email: string;
	avatar?: string;
	userType: 'tenant' | 'landlord';
}

interface UserState {
	user: User | null;
	isAuthenticated: boolean;
	login: (user: User) => void;
	logout: () => void;
	switchRole: (newRole: 'tenant' | 'landlord') => void;
}

export const useUserStore = create<UserState>()(
	persist(
		(set) => ({
			user: null,
			isAuthenticated: false,
			login: (user: User) => set({ user, isAuthenticated: true }),
			logout: () => set({ user: null, isAuthenticated: false }),
			switchRole: (newRole: 'tenant' | 'landlord') =>
				set((state) => ({
					user: state.user ? { ...state.user, userType: newRole } : null,
				})),
		}),
		{
			name: 'user-storage',
		},
	),
);
