'use server';

import { AxiosError } from 'axios';
import { cookies } from 'next/headers';
import { createServerApiCall } from '../lib/api-client';
import {
	Building,
	BuildingsListResponse,
	CreateBuildingRequest,
	UpdateBuildingRequest,
} from '../types/types';

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
	console.error('Building API Error Debug:', error);

	if (error instanceof AxiosError) {
		const status = error.response?.status;
		const data = error.response?.data;

		console.error('AxiosError Details:', {
			status,
			data,
			message: error.message,
		});

		// Handle specific status codes
		switch (status) {
			case 400:
				if (typeof data === 'string') return data;
				if (data?.message) return data.message;
				return 'Dữ liệu không hợp lệ';
			case 401:
				return 'Bạn cần đăng nhập để thực hiện thao tác này';
			case 403:
				return 'Bạn không có quyền thực hiện thao tác này';
			case 404:
				return 'Không tìm thấy dãy trọ';
			case 409:
				return 'Dãy trọ đã tồn tại';
			case 422:
				if (data?.message) return data.message;
				return 'Dữ liệu không hợp lệ';
			case 500:
				return 'Lỗi hệ thống, vui lòng thử lại sau';
			default:
				if (data?.message) return data.message;
				if (data?.error) return data.error;
				return defaultMessage;
		}
	}

	if (error instanceof Error) {
		return error.message;
	}

	return defaultMessage;
};

// Create API call function for server actions
// Helper function to get token from cookies
const getTokenFromCookies = async (): Promise<string | null> => {
	const cookieStore = await cookies();
	return cookieStore.get('accessToken')?.value || null;
};

const apiCall = createServerApiCall(getTokenFromCookies);

// Get list of buildings with pagination
export const getBuildings = async (params?: {
	page?: number;
	limit?: number;
	search?: string;
	isActive?: boolean;
}): Promise<ApiResult<BuildingsListResponse>> => {
	try {
		const searchParams = new URLSearchParams();
		if (params?.page) searchParams.append('page', params.page.toString());
		if (params?.limit) searchParams.append('limit', params.limit.toString());
		if (params?.search) searchParams.append('search', params.search);
		if (params?.isActive !== undefined) searchParams.append('isActive', params.isActive.toString());

		const endpoint = `/api/buildings${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
		const response = await apiCall<{
			success: boolean;
			message: string;
			data: BuildingsListResponse;
		}>(endpoint, {
			method: 'GET',
		});

		console.log('Full API Response:', response);

		return {
			success: true,
			data: response.data, // Extract the actual data object
		};
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể tải danh sách dãy trọ'),
		};
	}
};

// Get my buildings (landlord's buildings)
export const getMyBuildings = async (params?: {
	page?: number;
	limit?: number;
}): Promise<ApiResult<BuildingsListResponse>> => {
	try {
		const searchParams = new URLSearchParams();
		if (params?.page) searchParams.append('page', params.page.toString());
		if (params?.limit) searchParams.append('limit', params.limit.toString());

		const endpoint = `/api/buildings/me${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
		const response = await apiCall<{
			success: boolean;
			message: string;
			data: BuildingsListResponse;
		}>(endpoint, {
			method: 'GET',
		});

		console.log('My Buildings API Response:', response);

		return {
			success: true,
			data: response.data,
		};
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể tải danh sách dãy trọ của tôi'),
		};
	}
};

// Get building by ID
export const getBuildingById = async (id: string): Promise<ApiResult<{ data: Building }>> => {
	try {
		const response = await apiCall<{
			success: boolean;
			message: string;
			data: Building;
		}>(`/api/buildings/${id}`, {
			method: 'GET',
		});

		console.log('Building Detail API Response:', response);

		return {
			success: true,
			data: { data: response.data }, // Wrap in data object to match interface
		};
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể tải thông tin dãy trọ'),
		};
	}
};

// Create new building
export const createBuilding = async (
	data: CreateBuildingRequest,
): Promise<ApiResult<{ data: Building }>> => {
	try {
		const response = await apiCall<{ data: Building }>('/api/buildings', {
			method: 'POST',
			data,
		});

		return {
			success: true,
			data: response,
		};
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể tạo dãy trọ'),
		};
	}
};

// Update building
export const updateBuilding = async (
	id: string,
	data: UpdateBuildingRequest,
): Promise<ApiResult<{ data: Building }>> => {
	try {
		const response = await apiCall<{ data: Building }>(`/api/buildings/${id}`, {
			method: 'PUT',
			data,
		});

		return {
			success: true,
			data: response,
		};
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể cập nhật dãy trọ'),
		};
	}
};

// Delete building
export const deleteBuilding = async (id: string): Promise<ApiResult<{ message: string }>> => {
	try {
		const response = await apiCall<{ message: string }>(`/api/buildings/${id}`, {
			method: 'DELETE',
		});

		return {
			success: true,
			data: response,
		};
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể xóa dãy trọ'),
		};
	}
};
