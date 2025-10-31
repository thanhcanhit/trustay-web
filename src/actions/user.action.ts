'use server';

// User management actions for Trustay API
import { serverApiCall } from '../lib/api-client';
import {
	ChangePasswordRequest,
	CreateAddressRequest,
	PublicUserProfile,
	UpdateAddressRequest,
	UpdateProfileRequest,
	UserProfile,
	VerifyEmailRequest,
	VerifyIdentityRequest,
	VerifyPhoneRequest,
} from '../types/types';

// Get public user profile by ID (no authentication required)
export const getPublicUserProfile = async (userId: string): Promise<PublicUserProfile> => {
	return await serverApiCall<PublicUserProfile>(
		`/api/users/public/${userId}`,
		{
			method: 'GET',
		},
		undefined, // No token required for public endpoint
	);
};

// Get user profile
export const getUserProfile = async (token?: string): Promise<UserProfile> => {
	if (!token) {
		throw new Error('No access token found');
	}
	const result = await serverApiCall<UserProfile>(
		'/api/users/profile',
		{
			method: 'GET',
		},
		token,
	);
	console.log('getUserProfile raw result:', result);
	return result;
};

// Update user profile
export const updateUserProfile = async (
	profileData: UpdateProfileRequest,
	token?: string,
): Promise<UserProfile> => {
	if (!token) {
		throw new Error('No access token found');
	}
	return await serverApiCall<UserProfile>(
		'/api/users/profile',
		{
			method: 'PUT',
			data: profileData,
		},
		token,
	);
};

// Change user password
export const changePassword = async (
	passwordData: ChangePasswordRequest,
	token?: string,
): Promise<{ message: string }> => {
	if (!token) {
		throw new Error('No access token found');
	}
	return await serverApiCall<{ message: string }>(
		'/api/auth/change-password',
		{
			method: 'PUT',
			data: passwordData,
		},
		token,
	);
};

// Upload user avatar
export const uploadAvatar = async (file: File, token?: string): Promise<{ avatarUrl: string }> => {
	if (!token) {
		throw new Error('No access token found');
	}
	const formData = new FormData();
	formData.append('file', file);

	return await serverApiCall<{ avatarUrl: string }>(
		'/api/users/avatar',
		{
			method: 'PUT',
			data: formData,
		},
		token,
	);
};

// Create address
export const createAddress = async (
	addressData: CreateAddressRequest,
	token?: string,
): Promise<{ id: string; message: string }> => {
	if (!token) {
		throw new Error('No access token found');
	}
	return await serverApiCall<{ id: string; message: string }>(
		'/api/users/addresses',
		{
			method: 'POST',
			data: addressData,
		},
		token,
	);
};

// Update address
export const updateAddress = async (
	addressId: string,
	addressData: UpdateAddressRequest,
	token?: string,
): Promise<{ message: string }> => {
	if (!token) {
		throw new Error('No access token found');
	}
	return await serverApiCall<{ message: string }>(
		`/api/users/addresses/${addressId}`,
		{
			method: 'PUT',
			data: addressData,
		},
		token,
	);
};

// Delete address
export const deleteAddress = async (
	addressId: string,
	token?: string,
): Promise<{ message: string }> => {
	if (!token) {
		throw new Error('No access token found');
	}
	return await serverApiCall<{ message: string }>(
		`/api/users/addresses/${addressId}`,
		{
			method: 'DELETE',
		},
		token,
	);
};

// Verify phone number
export const verifyPhone = async (
	phoneData: VerifyPhoneRequest,
	token?: string,
): Promise<{ message: string }> => {
	if (!token) {
		throw new Error('No access token found');
	}
	return await serverApiCall<{ message: string }>(
		'/api/users/verify-phone',
		{
			method: 'POST',
			data: phoneData,
		},
		token,
	);
};

// Verify email
export const verifyEmail = async (
	emailData: VerifyEmailRequest,
	token?: string,
): Promise<{ message: string }> => {
	if (!token) {
		throw new Error('No access token found');
	}
	return await serverApiCall<{ message: string }>(
		'/api/users/verify-email',
		{
			method: 'POST',
			data: emailData,
		},
		token,
	);
};

// Verify identity (ID Card)
export const verifyIdentity = async (
	identityData: VerifyIdentityRequest,
	token?: string,
): Promise<{ message: string }> => {
	if (!token) {
		throw new Error('No access token found');
	}
	return await serverApiCall<{ message: string }>(
		'/api/users/verify-identity',
		{
			method: 'POST',
			data: identityData,
		},
		token,
	);
};
