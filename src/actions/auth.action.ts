'use server';

import { AxiosError } from 'axios';
// Authentication actions for Trustay API
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { apiClient } from '../lib/api-client';
import {
	AuthResponse,
	LoginRequest,
	RegisterDirectRequest,
	RegisterRequest,
	UserProfile,
	VerificationResponse,
} from '../types/types';

// Helper function to get token from cookies
// const getTokenFromCookies = async (): Promise<string | null> => {
//   const cookieStore = await cookies();
//   return cookieStore.get('accessToken')?.value || null;
// };

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

// Helper function to extract error message from API response
const extractErrorMessage = (error: unknown, defaultMessage: string): string => {
	console.error('API Error Debug:', error);

	if (error instanceof AxiosError) {
		const status = error.response?.status;
		const data = error.response?.data;

		console.error('AxiosError Details:', {
			status,
			data,
			message: error.message,
			config: {
				url: error.config?.url,
				method: error.config?.method,
				baseURL: error.config?.baseURL,
			},
		});

		// Handle specific error response formats
		if (data) {
			// If data is a string, use it directly
			if (typeof data === 'string') {
				return data;
			}

			// If data is an object, try different message fields
			if (typeof data === 'object') {
				const errorMessage = data.message || data.error || data.msg;

				if (typeof errorMessage === 'string') {
					return errorMessage;
				}

				if (typeof errorMessage === 'object' && errorMessage.message) {
					return errorMessage.message;
				}
			}
		}

		// Handle by status code if no specific message
		switch (status) {
			case 400:
				return 'Dữ liệu gửi lên không hợp lệ';
			case 409:
				return 'Dữ liệu đã tồn tại';
			case 422:
				return 'Dữ liệu không hợp lệ';
			case 500:
				return 'Lỗi máy chủ. Vui lòng thử lại sau';
			default:
				return error.message || defaultMessage;
		}
	}

	if (error instanceof Error) {
		return error.message;
	}

	return defaultMessage;
};

// Helper function to handle API errors and return error result instead of throwing
const handleApiError = (error: unknown, defaultMessage: string): never => {
	const errorMessage = extractErrorMessage(error, defaultMessage);
	throw new Error(errorMessage);
};

// Helper function to set auth cookies
async function setAuthCookies(accessToken: string, refreshToken: string) {
	const cookieStore = await cookies();

	cookieStore.set('accessToken', accessToken, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'strict',
		maxAge: 60 * 60 * 24 * 7, // 7 days
	});

	cookieStore.set('refreshToken', refreshToken, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'strict',
		maxAge: 60 * 60 * 24 * 30, // 30 days
	});
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

		// Store tokens in cookies
		await setAuthCookies(response.data.access_token, response.data.refresh_token);

		return { success: true, data: response.data };
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

		// Store tokens in cookies
		await setAuthCookies(response.data.access_token, response.data.refresh_token);

		return { success: true, data: response.data };
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

		// Store tokens in cookies
		await setAuthCookies(response.data.access_token, response.data.refresh_token);

		return response.data;
	} catch (error: unknown) {
		return handleApiError(error, 'Failed to register directly');
	}
};

// Login
export const login = async (credentials: LoginRequest): Promise<ApiResult<AuthResponse>> => {
	try {
		const response = await apiClient.post<AuthResponse>('/api/auth/login', credentials);

		// Store tokens in cookies
		await setAuthCookies(response.data.access_token, response.data.refresh_token);

		return { success: true, data: response.data };
	} catch (error: unknown) {
		const errorMessage = extractErrorMessage(error, 'Failed to login');
		return {
			success: false,
			error: errorMessage,
			status: error instanceof AxiosError ? error.response?.status : undefined,
		};
	}
};

// Get current user
export const getCurrentUser = async (): Promise<UserProfile> => {
	try {
		const cookieStore = await cookies();
		const accessToken = cookieStore.get('accessToken')?.value;

		if (!accessToken) {
			throw new Error('No access token found');
		}

		const response = await apiClient.get<UserProfile>('/api/auth/me', {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});
		console.log('getCurrentUser raw response:', response.data);
		return response.data;
	} catch (error: unknown) {
		return handleApiError(error, 'Failed to get current user');
	}
};

// Refresh token
export const refreshToken = async (): Promise<AuthResponse> => {
	try {
		const cookieStore = await cookies();
		const refreshTokenValue = cookieStore.get('refreshToken')?.value;

		if (!refreshTokenValue) {
			throw new Error('No refresh token available');
		}

		const response = await apiClient.post<AuthResponse>('/api/auth/refresh', {
			refreshToken: refreshTokenValue,
		});

		// Update stored tokens
		await setAuthCookies(response.data.access_token, response.data.refresh_token);

		return response.data;
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

// Logout
export const logout = async (): Promise<void> => {
	const cookieStore = await cookies();
	cookieStore.delete('accessToken');
	cookieStore.delete('refreshToken');
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
