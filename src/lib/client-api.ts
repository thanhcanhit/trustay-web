'use client';

import type { AxiosRequestConfig } from 'axios';
// Client-side API utilities using the axios instance
import { ApiError, apiClient } from './api-client';

// Client-side API helper functions
export const clientApi = {
	// GET request
	async get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
		try {
			const response = await apiClient.get(endpoint, config);
			return response.data;
		} catch (error) {
			throw this.handleError(error);
		}
	},

	// POST request
	async post<T>(endpoint: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
		try {
			const response = await apiClient.post(endpoint, data, config);
			return response.data;
		} catch (error) {
			throw this.handleError(error);
		}
	},

	// PUT request
	async put<T>(endpoint: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
		try {
			const response = await apiClient.put(endpoint, data, config);
			return response.data;
		} catch (error) {
			throw this.handleError(error);
		}
	},

	// DELETE request
	async delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
		try {
			const response = await apiClient.delete(endpoint, config);
			return response.data;
		} catch (error) {
			throw this.handleError(error);
		}
	},

	// PATCH request
	async patch<T>(endpoint: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
		try {
			const response = await apiClient.patch(endpoint, data, config);
			return response.data;
		} catch (error) {
			throw this.handleError(error);
		}
	},

	// Error handler
	handleError(error: unknown): ApiError {
		// Check if it's an axios error
		if (error && typeof error === 'object' && 'response' in error) {
			const axiosError = error as {
				response: {
					status: number;
					statusText: string;
					data?: { message?: string; error?: string; code?: string };
				};
			};
			// Server responded with error status
			const message =
				axiosError.response.data?.message ||
				axiosError.response.data?.error ||
				`HTTP ${axiosError.response.status}: ${axiosError.response.statusText}`;
			return new ApiError(message, axiosError.response.status, axiosError.response.data?.code);
		} else if (error && typeof error === 'object' && 'request' in error) {
			// Request was made but no response received
			return new ApiError('Network error. Please check your connection.', 0);
		} else {
			// Something else happened
			const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
			return new ApiError(message, 0);
		}
	},
};

// Export for convenience
export default clientApi;
