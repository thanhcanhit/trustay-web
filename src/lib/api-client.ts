import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// API Configuration
export const API_CONFIG = {
	BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
	TIMEOUT: 60000,
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
// Only store accessToken in localStorage for persistence
// refreshToken should be stored in-memory (via Zustand store) for security
export const TokenManager = {
	getAccessToken: (): string | undefined => {
		if (typeof window === 'undefined') return undefined;
		return localStorage.getItem('accessToken') ?? undefined;
	},

	setAccessToken: (token: string): void => {
		if (typeof window === 'undefined') return;
		localStorage.setItem('accessToken', token);
	},

	clearAccessToken: (): void => {
		if (typeof window === 'undefined') return;
		localStorage.removeItem('accessToken');
	},
};

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL,
	timeout: API_CONFIG.TIMEOUT,
	headers: API_CONFIG.HEADERS,
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
	(config) => {
		// For client-side requests, get token from localStorage
		if (typeof window !== 'undefined') {
			const token = TokenManager.getAccessToken();

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
// This will be called by the response interceptor when a 401 error occurs
const handleTokenRefresh = async (originalRequest: AxiosRequestConfig) => {
	// Import userStore dynamically to avoid circular dependency
	const { useUserStore } = await import('@/stores/userStore');
	const refreshToken = useUserStore.getState().getRefreshToken();

	if (!refreshToken) {
		return null;
	}

	try {
		const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`, {
			refreshToken,
		});

		const { access_token, refresh_token } = response.data;

		// Save new accessToken to localStorage
		TokenManager.setAccessToken(access_token);

		// Update refreshToken in store if provided
		if (refresh_token) {
			useUserStore.setState({ refreshToken: refresh_token });
		}

		// Retry original request with new token
		if (!originalRequest.headers) {
			originalRequest.headers = {};
		}
		originalRequest.headers.Authorization = `Bearer ${access_token}`;
		return axiosInstance(originalRequest);
	} catch (refreshError) {
		// Refresh failed, clear tokens and redirect to login
		TokenManager.clearAccessToken();

		// Clear store tokens
		const { useUserStore } = await import('@/stores/userStore');
		useUserStore.setState({ refreshToken: null, user: null, isAuthenticated: false });

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

		// Handle nested message object (e.g., { message: { message: "...", error: "..." } })
		if (errorData.message && typeof errorData.message === 'object') {
			const nestedMessage = errorData.message as Record<string, unknown>;
			if (nestedMessage.message && typeof nestedMessage.message === 'string') {
				return nestedMessage.message;
			}
		}

		const message = errorData.message || errorData.error || errorData.msg || 'Server error';
		return typeof message === 'string' ? message : JSON.stringify(data);
	}

	return 'An error occurred';
};

// Helper function to log API error details
const logApiError = (error: AxiosError): void => {
	console.error('API Error Details:', {
		message: error.message,
		status: error.response?.status,
		statusText: error.response?.statusText,
		data: error.response?.data,
		config: {
			url: error.config?.url,
			method: error.config?.method,
			baseURL: error.config?.baseURL,
		},
		hasResponse: !!error.response,
		hasRequest: !!error.request,
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
export const createServerApiCall = (getToken?: () => Promise<string | null> | string | null) => {
	return async function apiCall<T>(
		endpoint: string,
		options: AxiosRequestConfig = {},
		token?: string,
	): Promise<T> {
		// Use provided token first, then fall back to getToken function
		const authToken = token || (getToken ? await getToken() : null);
		// Default to production API if env not set
		const serverBaseURL = process.env.NEXT_PUBLIC_API_URL || 'http://trustay.life:3000';

		const config: AxiosRequestConfig = {
			...options,
			url: endpoint,
			headers: {
				...options.headers,
				...(authToken && { Authorization: `Bearer ${authToken}` }),
			},
		};

		console.log('Server API Call:', {
			baseURL: serverBaseURL,
			endpoint,
			hasToken: !!authToken,
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

// Simple server API call function that accepts token as parameter
export const serverApiCall = createServerApiCall();
