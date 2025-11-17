import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { LoginRequest, UserProfile } from '@/actions';
import { login as apiLogin, logout as apiLogout, getCurrentUser } from '@/actions';
import {
	changePassword as apiChangePassword,
	confirmChangeEmail as apiConfirmChangeEmail,
	requestChangeEmail as apiRequestChangeEmail,
	updateUserProfile as apiUpdateProfile,
	uploadAvatar as apiUploadAvatar,
} from '@/actions/user.action';
import { TokenManager } from '@/lib/api-client';
import type {
	ChangePasswordRequest,
	ConfirmChangeEmailRequest,
	RequestChangeEmailRequest,
	UpdateProfileRequest,
} from '@/types/types';
import { UserProfile as User } from '@/types/types';
import { useBuildingStore } from './buildingStore';

export type { User };

interface UserState {
	user: User | null;
	refreshToken: string | null; // Store refreshToken in-memory for security
	isAuthenticated: boolean;
	isLoading: boolean;
	error: string | null;
	hasHydrated: boolean;

	// Actions
	login: (credentials: LoginRequest) => Promise<void>;
	setAuthFromResponse: (authResponse: {
		user: UserProfile;
		access_token: string;
		refresh_token: string;
	}) => void;
	logout: () => Promise<void>;
	loadUser: () => Promise<void>;
	fetchUser: () => Promise<void>;
	validateSession: () => Promise<boolean>;
	updateProfile: (profileData: UpdateProfileRequest) => Promise<void>;
	uploadAvatar: (file: File) => Promise<string>;
	changePassword: (passwordData: ChangePasswordRequest) => Promise<void>;
	requestChangeEmail: (emailData: RequestChangeEmailRequest) => Promise<void>;
	confirmChangeEmail: (emailData: ConfirmChangeEmailRequest) => Promise<void>;
	clearError: () => void;
	switchRole: (newRole: 'tenant' | 'landlord') => void;
	setHasHydrated: (state: boolean) => void;
	getRefreshToken: () => string | null;
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
	isVerifiedPhone: profile.isVerifiedPhone,
	isVerifiedEmail: profile.isVerifiedEmail,
	isVerifiedIdentity: profile.isVerifiedIdentity,
	createdAt: profile.createdAt,
	updatedAt: profile.updatedAt,
});

export const useUserStore = create<UserState>()(
	persist(
		(set, get) => ({
			user: null,
			refreshToken: null,
			isAuthenticated: false,
			isLoading: false,
			error: null,
			hasHydrated: false,

			getRefreshToken: () => get().refreshToken,

			login: async (credentials: LoginRequest) => {
				set({ isLoading: true, error: null });

				try {
					const result = await apiLogin(credentials);

					if (result.success) {
						const user = convertUserProfile(result.data.user);

						// Save accessToken to localStorage only
						if (result.data.access_token) {
							TokenManager.setAccessToken(result.data.access_token);
						}

						// Save refreshToken in-memory store for security
						set({
							user,
							refreshToken: result.data.refresh_token || null,
							isAuthenticated: true,
							isLoading: false,
							error: null,
						});
					} else {
						// Clear tokens if login fails
						TokenManager.clearAccessToken();

						set({
							isLoading: false,
							error: result.error,
							isAuthenticated: false,
							user: null,
							refreshToken: null,
						});
						throw new Error(result.error);
					}
				} catch (error: unknown) {
					// Clear tokens if login fails
					TokenManager.clearAccessToken();

					const errorMessage = error instanceof Error ? error.message : 'Login failed';
					set({
						isLoading: false,
						error: errorMessage,
						isAuthenticated: false,
						user: null,
						refreshToken: null,
					});
					throw error;
				}
			},

			// Set authentication state from AuthResponse (used after registration)
			setAuthFromResponse: (authResponse) => {
				const user = convertUserProfile(authResponse.user);

				// Save accessToken to localStorage
				if (authResponse.access_token) {
					TokenManager.setAccessToken(authResponse.access_token);
				}

				// Update user store with user data and refreshToken
				set({
					user,
					refreshToken: authResponse.refresh_token || null,
					isAuthenticated: true,
					isLoading: false,
					error: null,
				});
			},

			logout: async () => {
				set({ isLoading: true });

				try {
					await apiLogout();
				} catch (error) {
					console.warn('Logout API call failed:', error);
				} finally {
					// Clear accessToken from localStorage
					TokenManager.clearAccessToken();

					// Reset building store when logging out
					useBuildingStore.getState().reset();

					set({
						user: null,
						refreshToken: null,
						isAuthenticated: false,
						isLoading: false,
						error: null,
					});
				}
			},

			loadUser: async () => {
				const token = TokenManager.getAccessToken();
				if (!token) {
					set({ isAuthenticated: false, user: null, refreshToken: null, isLoading: false });
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
					TokenManager.clearAccessToken();

					// Don't show error for token expiration during auto-load
					const errorObj = error as { status?: number; message?: string };
					const isTokenExpired =
						errorObj.status === 401 || errorObj.message?.includes('Session expired');

					set({
						user: null,
						refreshToken: null,
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

			validateSession: async () => {
				const token = TokenManager.getAccessToken();
				const state = get();

				if (!token || !state.isAuthenticated) {
					return false;
				}

				try {
					// Try to fetch current user without clearing state on failure
					const userProfile = await getCurrentUser(token);
					const user = convertUserProfile(userProfile);

					set({
						user,
						isAuthenticated: true,
					});

					return true;
				} catch {
					// Token is invalid/expired - let refresh token handle it
					// Don't clear state immediately, give refresh token interceptor a chance
					console.warn(
						'Session validation failed, refresh token will be attempted on next API call',
					);
					return false;
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
				// Don't update store loading state to prevent unwanted re-renders
				const token = TokenManager.getAccessToken();
				if (!token) {
					const errorMessage = 'No access token found';
					throw new Error(errorMessage);
				}

				const result = await apiChangePassword(passwordData, token);

				if (!result.success) {
					const errorMessage = result.error || 'Failed to change password';
					throw new Error(errorMessage);
				}

				// Successfully changed password - no state update needed
			},

			requestChangeEmail: async (emailData: RequestChangeEmailRequest) => {
				try {
					const token = TokenManager.getAccessToken();
					if (!token) {
						throw new Error('No access token found');
					}

					await apiRequestChangeEmail(emailData, token);
				} catch (error: unknown) {
					const errorMessage =
						error instanceof Error ? error.message : 'Failed to request email change';
					set({
						error: errorMessage,
					});
					throw error;
				}
			},

			confirmChangeEmail: async (emailData: ConfirmChangeEmailRequest) => {
				try {
					const token = TokenManager.getAccessToken();
					if (!token) {
						throw new Error('No access token found');
					}

					await apiConfirmChangeEmail(emailData, token);

					// Fetch updated user profile after email change
					const userProfile = await getCurrentUser(token);
					const user = convertUserProfile(userProfile);

					set({
						user,
						error: null,
					});
				} catch (error: unknown) {
					const errorMessage =
						error instanceof Error ? error.message : 'Failed to confirm email change';
					set({
						error: errorMessage,
					});
					throw error;
				}
			},
		}),
		{
			name: 'user-storage',
			version: 1, // Increment version to force migration
			// Use localStorage explicitly for persistence
			storage: createJSONStorage(() => localStorage),
			// Only persist user data and refreshToken, not loading states
			// refreshToken is persisted here (in-memory via Zustand) for better security than localStorage
			partialize: (state) => ({
				user: state.user,
				isAuthenticated: state.isAuthenticated,
				refreshToken: state.refreshToken,
			}),
			migrate: (persistedState: unknown, version: number) => {
				// Handle migration from older versions
				if (version === 0) {
					// Migration from v0 to v1 - return clean state if needed
					return persistedState;
				}
				return persistedState;
			},
			onRehydrateStorage: () => (state) => {
				state?.setHasHydrated(true);
				// Don't call loadUser() on rehydrate - it will fail and clear tokens
				// Instead, rely on the persisted state to restore authentication
				// Individual pages can call fetchUser() if they need fresh data
			},
		},
	),
);
