import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// API Configuration
export const API_CONFIG = {
	BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
	TIMEOUT: 10000,
	HEADERS: {
		'Content-Type': 'application/json',
		'User-Agent': 'Trustay-Frontend/1.0',
	},
};

// API Response types
export interface ApiResponse<T = unknown> {
	success: boolean;
	data?: T;
	message?: string;
	error?: string;
}

// Token management for client-side
export const TokenManager = {
	getAccessToken: (): string | null => {
		if (typeof window === 'undefined') return null;
		return localStorage.getItem('accessToken');
	},

	setAccessToken: (token: string): void => {
		if (typeof window === 'undefined') return;
		localStorage.setItem('accessToken', token);
	},

	getRefreshToken: (): string | null => {
		if (typeof window === 'undefined') return null;
		return localStorage.getItem('refreshToken');
	},

	setRefreshToken: (token: string): void => {
		if (typeof window === 'undefined') return;
		localStorage.setItem('refreshToken', token);
	},

	clearTokens: (): void => {
		if (typeof window === 'undefined') return;
		localStorage.removeItem('accessToken');
		localStorage.removeItem('refreshToken');
	},
};

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL,
	timeout: API_CONFIG.TIMEOUT,
	headers: API_CONFIG.HEADERS,
});

// Helper function to get token from cookies (client-side)
const getTokenFromClientCookies = (): string | null => {
	if (typeof window === 'undefined') return null;
	const cookies = document.cookie.split(';');
	const tokenCookie = cookies.find((cookie) => cookie.trim().startsWith('accessToken='));
	return tokenCookie ? tokenCookie.split('=')[1] : null;
};

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
	(config) => {
		// For client-side requests, get token from cookies first, then localStorage
		if (typeof window !== 'undefined') {
			const cookieToken = getTokenFromClientCookies();
			const localToken = TokenManager.getAccessToken();
			const token = cookieToken || localToken;

			if (token) {
				config.headers.Authorization = `Bearer ${token}`;
			}
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	},
);

// Helper function to handle token refresh
const handleTokenRefresh = async (originalRequest: AxiosRequestConfig) => {
	const refreshToken = TokenManager.getRefreshToken();
	if (!refreshToken) {
		return null;
	}

	try {
		const response = await axios.post(`${API_CONFIG.BASE_URL}/api/auth/refresh`, {
			refreshToken,
		});

		const { access_token, refresh_token } = response.data;
		TokenManager.setAccessToken(access_token);
		if (refresh_token) {
			TokenManager.setRefreshToken(refresh_token);
		}

		// Retry original request with new token
		if (!originalRequest.headers) {
			originalRequest.headers = {};
		}
		originalRequest.headers.Authorization = `Bearer ${access_token}`;
		return axiosInstance(originalRequest);
	} catch (refreshError) {
		// Refresh failed, clear tokens and redirect to login
		TokenManager.clearTokens();
		if (typeof window !== 'undefined') {
			window.location.href = '/login';
		}
		return Promise.reject(refreshError);
	}
};

// Response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
	(response: AxiosResponse) => {
		return response;
	},
	async (error) => {
		const originalRequest = error.config;
		const shouldRetry = error.response?.status === 401 && !originalRequest._retry;

		if (shouldRetry) {
			originalRequest._retry = true;

			if (typeof window !== 'undefined') {
				const refreshResult = await handleTokenRefresh(originalRequest);
				if (refreshResult) {
					return refreshResult;
				}
			}
		}

		return Promise.reject(error);
	},
);

// Export the axios instance
export const apiClient = axiosInstance;

// Client-side upload avatar function
export const uploadAvatarClient = async (file: File): Promise<{ avatarUrl: string }> => {
	const formData = new FormData();
	formData.append('file', file);

	const response = await apiClient.put('/api/users/avatar', formData);
	return response.data;
};

// Custom ApiError class
export class ApiError extends Error {
	constructor(
		message: string,
		public status: number,
		public code?: string,
	) {
		super(message);
		this.name = 'ApiError';
	}
}

// Helper function to extract error message from API response
const extractErrorMessage = (error: AxiosError): string => {
	if (!error.response?.data) {
		return error.message || 'An error occurred';
	}

	const data = error.response.data;
	if (typeof data === 'string') {
		return data;
	}

	if (typeof data === 'object') {
		const errorData = data as Record<string, unknown>;
		const message = errorData.message || errorData.error || errorData.msg || 'Server error';
		return typeof message === 'string' ? message : JSON.stringify(data);
	}

	return 'An error occurred';
};

// Helper function to log API error details
const logApiError = (error: AxiosError): void => {
	console.error('API Error Details:', {
		status: error.response?.status,
		statusText: error.response?.statusText,
		data: error.response?.data,
		config: {
			url: error.config?.url,
			method: error.config?.method,
			headers: error.config?.headers,
		},
	});
};

// Helper function to handle server API errors
const handleServerApiError = (error: unknown): never => {
	if (axios.isAxiosError(error)) {
		logApiError(error);
		const message = extractErrorMessage(error);
		throw new ApiError(message, error.response?.status || 0);
	}
	throw error;
};

// Helper function for server-side API calls (for use in server actions)
export const createServerApiCall = (getToken: () => Promise<string | null> | string | null) => {
	return async function apiCall<T>(endpoint: string, options: AxiosRequestConfig = {}): Promise<T> {
		const token = await getToken();
		const serverBaseURL = process.env.NEXT_PUBLIC_API_URL || 'http://trustay.life:3000';

		const config: AxiosRequestConfig = {
			...options,
			url: endpoint,
			headers: {
				...options.headers,
				...(token && { Authorization: `Bearer ${token}` }),
			},
		};

		console.log('Server API Call:', {
			baseURL: serverBaseURL,
			endpoint,
			hasToken: !!token,
		});

		try {
			const response = await axios({
				baseURL: serverBaseURL,
				timeout: API_CONFIG.TIMEOUT,
				...config,
			});

			return response.data;
		} catch (error) {
			return handleServerApiError(error);
		}
	};
};
