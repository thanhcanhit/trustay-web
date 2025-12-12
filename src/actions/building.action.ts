'use server';

import { createServerApiCall } from '../lib/api-client';
import {
	Building,
	BuildingsListResponse,
	CreateBuildingRequest,
	UpdateBuildingRequest,
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

// Create API call function for server actions
// No token function - token will be passed directly from client
const apiCall = createServerApiCall();

// Get list of buildings with pagination
export const getBuildings = async (
	params?: {
		page?: number;
		limit?: number;
		search?: string;
		isActive?: boolean;
	},
	token?: string,
): Promise<ApiResult<BuildingsListResponse>> => {
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
		}>(
			endpoint,
			{
				method: 'GET',
			},
			token,
		);

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
export const getMyBuildings = async (
	params?: {
		page?: number;
		limit?: number;
	},
	token?: string,
): Promise<ApiResult<BuildingsListResponse>> => {
	try {
		const searchParams = new URLSearchParams();
		if (params?.page) searchParams.append('page', params.page.toString());
		if (params?.limit) searchParams.append('limit', params.limit.toString());

		const endpoint = `/api/buildings/me${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
		const response = await apiCall<{
			success: boolean;
			message: string;
			data: BuildingsListResponse;
		}>(
			endpoint,
			{
				method: 'GET',
			},
			token,
		);

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
export const getBuildingById = async (
	id: string,
	token?: string,
): Promise<ApiResult<{ data: Building }>> => {
	try {
		const response = await apiCall<{
			success: boolean;
			message: string;
			data: Building;
		}>(
			`/api/buildings/${id}`,
			{
				method: 'GET',
			},
			token,
		);

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
	token?: string,
): Promise<ApiResult<{ data: Building }>> => {
	try {
		const response = await apiCall<{ data: Building }>(
			'/api/buildings',
			{
				method: 'POST',
				data,
			},
			token,
		);

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
	token?: string,
): Promise<ApiResult<{ data: Building }>> => {
	try {
		const response = await apiCall<{ data: Building }>(
			`/api/buildings/${id}`,
			{
				method: 'PUT',
				data,
			},
			token,
		);

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
export const deleteBuilding = async (
	id: string,
	token?: string,
): Promise<ApiResult<{ message: string }>> => {
	try {
		const response = await apiCall<{ message: string }>(
			`/api/buildings/${id}`,
			{
				method: 'DELETE',
			},
			token,
		);

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
