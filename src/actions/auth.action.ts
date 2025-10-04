'use server';

import { AxiosError } from 'axios';
// Authentication actions for Trustay API
import { redirect } from 'next/navigation';
import { apiClient, createServerApiCall } from '../lib/api-client';
import {
	AuthResponse,
	LoginRequest,
	RegisterDirectRequest,
	RegisterRequest,
	UserProfile,
	VerificationResponse,
} from '../types/types';
import { extractErrorMessage } from '../utils/api-error-handler';

// Types for error handling
interface ApiErrorResult {
	success: false;
	error: string;
	status?: number;
}

interface ApiSuccessResult<T> {
	success: true;
	data: T;
}

type ApiResult<T> = ApiSuccessResult<T> | ApiErrorResult;

// Helper function to handle API errors and return error result instead of throwing
const handleApiError = (error: unknown, defaultMessage: string): never => {
	const errorMessage = extractErrorMessage(error, defaultMessage);
	throw new Error(errorMessage);
};

// Helper function to return tokens for client-side storage
function getTokensForClient(accessToken: string, refreshToken: string) {
	return {
		accessToken,
		refreshToken,
	};
}

// Send email verification code
export const sendEmailVerification = async (
	email: string,
): Promise<ApiResult<VerificationResponse>> => {
	try {
		const response = await apiClient.post<VerificationResponse>('/api/verification/send', {
			type: 'email',
			email,
		});
		return { success: true, data: response.data };
	} catch (error: unknown) {
		const errorMessage = extractErrorMessage(error, 'Failed to send verification email');
		return {
			success: false,
			error: errorMessage,
			status: error instanceof AxiosError ? error.response?.status : undefined,
		};
	}
};

// Verify email code
export const verifyEmailCode = async (
	email: string,
	code: string,
): Promise<ApiResult<VerificationResponse>> => {
	try {
		const response = await apiClient.post<VerificationResponse>('/api/verification/verify', {
			type: 'email',
			email,
			code,
		});
		return { success: true, data: response.data };
	} catch (error: unknown) {
		const errorMessage = extractErrorMessage(error, 'Failed to verify email code');
		return {
			success: false,
			error: errorMessage,
			status: error instanceof AxiosError ? error.response?.status : undefined,
		};
	}
};

// Register with verification
export const registerWithVerification = async (
	userData: RegisterRequest,
	verificationToken: string,
): Promise<ApiResult<AuthResponse>> => {
	try {
		const response = await apiClient.post<AuthResponse>('/api/auth/register', userData, {
			headers: {
				'X-Verification-Token': verificationToken,
			},
		});

		// Return tokens for client-side storage
		const tokens = getTokensForClient(response.data.access_token, response.data.refresh_token);

		return { success: true, data: { ...response.data, ...tokens } };
	} catch (error: unknown) {
		const errorMessage = extractErrorMessage(error, 'Failed to register with verification');
		return {
			success: false,
			error: errorMessage,
			status: error instanceof AxiosError ? error.response?.status : undefined,
		};
	}
};

// Register with verification but without phone number
export const registerWithVerificationNoPhone = async (
	userData: Omit<RegisterRequest, 'phone'>,
	verificationToken: string,
): Promise<ApiResult<AuthResponse>> => {
	try {
		const response = await apiClient.post<AuthResponse>('/api/auth/register', userData, {
			headers: {
				'X-Verification-Token': verificationToken,
			},
		});

		// Return tokens for client-side storage
		const tokens = getTokensForClient(response.data.access_token, response.data.refresh_token);

		return { success: true, data: { ...response.data, ...tokens } };
	} catch (error: unknown) {
		const errorMessage = extractErrorMessage(error, 'Failed to register with verification');
		return {
			success: false,
			error: errorMessage,
			status: error instanceof AxiosError ? error.response?.status : undefined,
		};
	}
};

// Register direct (for development)
export const registerDirect = async (userData: RegisterDirectRequest): Promise<AuthResponse> => {
	try {
		const response = await apiClient.post<AuthResponse>('/api/auth/register-direct', userData);

		// Return tokens for client-side storage
		const tokens = getTokensForClient(response.data.access_token, response.data.refresh_token);

		return { ...response.data, ...tokens };
	} catch (error: unknown) {
		return handleApiError(error, 'Failed to register directly');
	}
};

// Login
export const login = async (credentials: LoginRequest): Promise<ApiResult<AuthResponse>> => {
	try {
		const response = await apiClient.post<AuthResponse>('/api/auth/login', credentials);

		// Return tokens for client-side storage
		const tokens = getTokensForClient(response.data.access_token, response.data.refresh_token);

		return { success: true, data: { ...response.data, ...tokens } };
	} catch (error: unknown) {
		const errorMessage = extractErrorMessage(error, 'Failed to login');
		return {
			success: false,
			error: errorMessage,
			status: error instanceof AxiosError ? error.response?.status : undefined,
		};
	}
};

// Create API call function for server actions
const apiCall = createServerApiCall();

// Get current user (accepts token parameter for server-side usage)
export const getCurrentUser = async (token?: string): Promise<UserProfile> => {
	try {
		let response: UserProfile;
		if (token) {
			// Use server API call with token for server-side calls
			response = await apiCall<UserProfile>(
				'/api/auth/me',
				{
					method: 'GET',
				},
				token,
			);
		} else {
			// This function will be called from client-side store, so we can use apiClient directly
			const clientResponse = await apiClient.get<UserProfile>('/api/auth/me');
			response = clientResponse.data;
		}
		console.log('getCurrentUser raw response:', response);
		return response;
	} catch (error: unknown) {
		return handleApiError(error, 'Failed to get current user');
	}
};

// Refresh token
export const refreshToken = async (refreshTokenValue: string): Promise<AuthResponse> => {
	try {
		if (!refreshTokenValue) {
			throw new Error('No refresh token provided');
		}

		const response = await apiClient.post<AuthResponse>('/api/auth/refresh', {
			refreshToken: refreshTokenValue,
		});

		// Return tokens for client-side storage
		const tokens = getTokensForClient(response.data.access_token, response.data.refresh_token);

		return { ...response.data, ...tokens };
	} catch (error: unknown) {
		return handleApiError(error, 'Failed to refresh token');
	}
};

//Check password strength

export const checkPasswordStrength = async (password: string): Promise<number> => {
	try {
		const response = await apiClient.post<{ score: number }>('/api/auth/check-password-strength', {
			password,
		});
		return response.data.score;
	} catch (error: unknown) {
		handleApiError(error, 'Failed to check password strength');
		return 0;
	}
};

// Logout (client-side should handle clearing localStorage)
export const logout = async (): Promise<void> => {
	// Server-side logout logic can be added here if needed
	// Client should handle clearing localStorage
};

// Complete registration and redirect
export async function completeRegistration(formData: FormData) {
	const role = formData.get('role') as string;
	const showProfileModal = formData.get('showProfileModal') as string;

	if (showProfileModal === 'true') {
		redirect('/profile?showModal=true');
	} else if (role === 'tenant') {
		redirect('/profile');
	} else if (role === 'landlord') {
		redirect('/dashboard/landlord');
	} else {
		redirect('/');
	}
}

// Skip profile update and redirect to home
export async function skipProfileUpdate() {
	redirect('/');
}
