import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LoginRequest, UserProfile } from '@/actions';
import { login as apiLogin, logout as apiLogout, getCurrentUser } from '@/actions';
import {
	changePassword as apiChangePassword,
	updateUserProfile as apiUpdateProfile,
	uploadAvatar as apiUploadAvatar,
} from '@/actions/user.action';
import { TokenManager } from '@/lib/api-client';
import { TokenUtils } from '@/lib/token-utils';
import type { ChangePasswordRequest, UpdateProfileRequest } from '@/types/types';
import { UserProfile as User } from '@/types/types';
import { useBuildingStore } from './buildingStore';

export type { User };

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
	updateProfile: (profileData: UpdateProfileRequest) => Promise<void>;
	uploadAvatar: (file: File) => Promise<string>;
	changePassword: (passwordData: ChangePasswordRequest) => Promise<void>;
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
	avatarUrl: profile.avatarUrl, // Fix: API returns avatarUrl, not avatar
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
					const result = await apiLogin(credentials);

					if (result.success) {
						const user = convertUserProfile(result.data.user);

						// Save tokens to localStorage
						if (result.data.access_token) {
							TokenManager.setAccessToken(result.data.access_token);
						}
						if (result.data.refresh_token) {
							TokenManager.setRefreshToken(result.data.refresh_token);
						}

						set({
							user,
							isAuthenticated: true,
							isLoading: false,
							error: null,
						});
					} else {
						// Clear tokens if login fails
						TokenUtils.clearTokens();

						set({
							isLoading: false,
							error: result.error,
							isAuthenticated: false,
							user: null,
						});
						throw new Error(result.error);
					}
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
					// Reset building store when logging out
					useBuildingStore.getState().reset();

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
					const token = TokenManager.getAccessToken();
					if (!token) {
						console.error('No access token found');
						return;
					}

					const userProfile = await getCurrentUser(token);
					console.log('Raw user profile from API:', userProfile);
					const user = convertUserProfile(userProfile);
					console.log('Converted user data:', user);

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

			updateProfile: async (profileData: UpdateProfileRequest) => {
				set({ isLoading: true, error: null });

				try {
					const token = TokenManager.getAccessToken();
					if (!token) {
						throw new Error('No access token found');
					}

					const updatedProfile = await apiUpdateProfile(profileData, token);
					const user = convertUserProfile(updatedProfile);

					set({
						user,
						isLoading: false,
						error: null,
					});
				} catch (error: unknown) {
					const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
					set({
						isLoading: false,
						error: errorMessage,
					});
					throw error;
				}
			},

			uploadAvatar: async (file: File): Promise<string> => {
				set({ isLoading: true, error: null });

				try {
					const token = TokenManager.getAccessToken();
					if (!token) {
						throw new Error('No access token found');
					}

					const response = await apiUploadAvatar(file, token);

					// Update user with new avatar URL
					set((state) => ({
						user: state.user ? { ...state.user, avatarUrl: response.avatarUrl } : null,
						isLoading: false,
						error: null,
					}));

					return response.avatarUrl;
				} catch (error: unknown) {
					const errorMessage = error instanceof Error ? error.message : 'Failed to upload avatar';
					set({
						isLoading: false,
						error: errorMessage,
					});
					throw error;
				}
			},

			changePassword: async (passwordData: ChangePasswordRequest) => {
				set({ isLoading: true, error: null });

				try {
					const token = TokenManager.getAccessToken();
					if (!token) {
						throw new Error('No access token found');
					}

					await apiChangePassword(passwordData, token);

					set({
						isLoading: false,
						error: null,
					});
				} catch (error: unknown) {
					const errorMessage = error instanceof Error ? error.message : 'Failed to change password';
					set({
						isLoading: false,
						error: errorMessage,
					});
					throw error;
				}
			},
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
