import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LoginRequest, UserProfile } from '@/actions';
import { login as apiLogin, logout as apiLogout, getCurrentUser } from '@/actions';
import { TokenUtils } from '@/lib/token-utils';

// Updated User interface to match API response
export interface User {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	gender: 'male' | 'female' | 'other';
	role: 'tenant' | 'landlord';
	bio?: string;
	dateOfBirth?: string;
	avatar?: string;
	idCardNumber?: string;
	bankAccount?: string;
	bankName?: string;
	idCardFront?: string;
	idCardBack?: string;
	createdAt?: string;
	updatedAt?: string;
}

interface UserState {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	error: string | null;
	hasHydrated: boolean;

	// Actions
	login: (credentials: LoginRequest) => Promise<void>;
	logout: () => Promise<void>;
	loadUser: () => Promise<void>;
	fetchUser: () => Promise<void>;
	clearError: () => void;
	switchRole: (newRole: 'tenant' | 'landlord') => void;
	setHasHydrated: (state: boolean) => void;
}

// Helper function to convert API UserProfile to User
const convertUserProfile = (profile: UserProfile): User => ({
	id: profile.id,
	firstName: profile.firstName,
	lastName: profile.lastName,
	email: profile.email,
	phone: profile.phone,
	gender: profile.gender,
	role: profile.role,
	bio: profile.bio,
	dateOfBirth: profile.dateOfBirth,
	avatar: profile.avatar,
	idCardNumber: profile.idCardNumber,
	bankAccount: profile.bankAccount,
	bankName: profile.bankName,
	createdAt: profile.createdAt,
	updatedAt: profile.updatedAt,
});

export const useUserStore = create<UserState>()(
	persist(
		(set) => ({
			user: null,
			isAuthenticated: false,
			isLoading: false,
			error: null,
			hasHydrated: false,

			login: async (credentials: LoginRequest) => {
				set({ isLoading: true, error: null });

				try {
					const authResponse = await apiLogin(credentials);
					const user = convertUserProfile(authResponse.user);

					set({
						user,
						isAuthenticated: true,
						isLoading: false,
						error: null,
					});
				} catch (error: unknown) {
					// Clear tokens if login fails
					TokenUtils.clearTokens();

					const errorMessage = error instanceof Error ? error.message : 'Login failed';
					set({
						isLoading: false,
						error: errorMessage,
						isAuthenticated: false,
						user: null,
					});
					throw error;
				}
			},

			logout: async () => {
				set({ isLoading: true });

				try {
					await apiLogout();
				} catch (error) {
					console.warn('Logout API call failed:', error);
				} finally {
					set({
						user: null,
						isAuthenticated: false,
						isLoading: false,
						error: null,
					});
				}
			},

			loadUser: async () => {
				const token = TokenUtils.getAccessToken();
				if (!token) {
					set({ isAuthenticated: false, user: null, isLoading: false });
					return;
				}

				set({ isLoading: true, error: null });

				try {
					const userProfile = await getCurrentUser();
					const user = convertUserProfile(userProfile);

					set({
						user,
						isAuthenticated: true,
						isLoading: false,
						error: null,
					});
				} catch (error: unknown) {
					// If token is invalid, clear it
					TokenUtils.clearTokens();

					// Don't show error for token expiration during auto-load
					const errorObj = error as { status?: number; message?: string };
					const isTokenExpired =
						errorObj.status === 401 || errorObj.message?.includes('Session expired');

					set({
						user: null,
						isAuthenticated: false,
						isLoading: false,
						error: isTokenExpired ? null : errorObj.message || 'Failed to load user',
					});
				}
			},

			fetchUser: async () => {
				try {
					const userProfile = await getCurrentUser();
					const user = convertUserProfile(userProfile);

					set((state) => ({
						...state,
						user,
					}));
				} catch (error: unknown) {
					console.error('Failed to fetch user:', error);
				}
			},

			clearError: () => set({ error: null }),

			switchRole: (newRole: 'tenant' | 'landlord') =>
				set((state) => ({
					user: state.user ? { ...state.user, role: newRole } : null,
				})),

			setHasHydrated: (state: boolean) => set({ hasHydrated: state }),
		}),
		{
			name: 'user-storage',
			// Only persist user data, not loading states
			partialize: (state) => ({
				user: state.user,
				isAuthenticated: state.isAuthenticated,
			}),
			onRehydrateStorage: () => (state) => {
				state?.setHasHydrated(true);
			},
		},
	),
);
