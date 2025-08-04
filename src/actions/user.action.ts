'use server';

// User management actions for Trustay API
import { cookies } from 'next/headers';
import { createServerApiCall } from '../lib/api-client';
import { UpdateProfileRequest, UserProfile } from '../types/types';

// Helper function to get token from cookies
const getTokenFromCookies = async (): Promise<string | null> => {
	const cookieStore = await cookies();
	return cookieStore.get('accessToken')?.value || null;
};

// Create API call function for server actions
const apiCall = createServerApiCall(getTokenFromCookies);

// Get user profile
export const getUserProfile = async (): Promise<UserProfile> => {
	return await apiCall<UserProfile>('/api/users/profile', {
		method: 'GET',
	});
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
