import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

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

			console.log('Auth Debug:', {
				cookieToken: cookieToken ? 'Found' : 'Not found',
				localToken: localToken ? 'Found' : 'Not found',
				finalToken: token ? 'Using token' : 'No token',
				url: config.url,
			});

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

// Response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
	(response: AxiosResponse) => {
		return response;
	},
	async (error) => {
		const originalRequest = error.config;

		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;

			// Try to refresh token (only on client-side)
			if (typeof window !== 'undefined') {
				const refreshToken = TokenManager.getRefreshToken();
				if (refreshToken) {
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

// Helper function for server-side API calls (for use in server actions)
export const createServerApiCall = (getToken: () => Promise<string | null> | string | null) => {
	return async function apiCall<T>(endpoint: string, options: AxiosRequestConfig = {}): Promise<T> {
		const token = await getToken();

		// Use server-appropriate URL
		const serverBaseURL =
			process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://trustay.life:3000';

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
			if (axios.isAxiosError(error)) {
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

				let message = 'An error occurred';
				if (error.response?.data) {
					const data = error.response.data;
					if (typeof data === 'string') {
						message = data;
					} else if (typeof data === 'object') {
						message = data.message || data.error || data.msg || 'Server error';
						if (typeof message !== 'string') {
							message = JSON.stringify(data);
						}
					}
				} else if (error.message) {
					message = error.message;
				}

				throw new ApiError(message, error.response?.status || 0);
			}
			throw error;
		}
	};
};
