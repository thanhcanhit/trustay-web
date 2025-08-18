'use server';

// User management actions for Trustay API
import { cookies } from 'next/headers';
import { createServerApiCall } from '../lib/api-client';
import { ChangePasswordRequest, UpdateProfileRequest, UserProfile } from '../types/types';

// Helper function to get token from cookies
const getTokenFromCookies = async (): Promise<string | null> => {
	const cookieStore = await cookies();
	const token = cookieStore.get('accessToken')?.value || null;
	console.log('Token from cookies:', token ? 'Found' : 'Not found');
	return token;
};

// Create server API call function
const apiCall = createServerApiCall(getTokenFromCookies);

// Get user profile
export const getUserProfile = async (): Promise<UserProfile> => {
	const result = await apiCall<UserProfile>('/api/users/profile', {
		method: 'GET',
	});
	console.log('getUserProfile raw result:', result);
	return result;
};

// Update user profile
export const updateUserProfile = async (
	profileData: UpdateProfileRequest,
): Promise<UserProfile> => {
	return await apiCall<UserProfile>('/api/users/profile', {
		method: 'PUT',
		data: profileData,
	});
};

// Change user password
export const changePassword = async (
	passwordData: ChangePasswordRequest,
): Promise<{ message: string }> => {
	return await apiCall<{ message: string }>('/api/users/change-password', {
		method: 'PUT',
		data: passwordData,
	});
};

// Upload user avatar
export const uploadAvatar = async (file: File): Promise<{ avatarUrl: string }> => {
	const formData = new FormData();
	formData.append('file', file);

	return await apiCall<{ avatarUrl: string }>('/api/users/avatar', {
		method: 'PUT',
		data: formData,
	});
};
