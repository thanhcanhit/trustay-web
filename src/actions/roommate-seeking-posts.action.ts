'use server';

import { AxiosError } from 'axios';
import { createServerApiCall } from '../lib/api-client';
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

const apiCall = createServerApiCall();

// Types for Roommate Seeking Posts
export interface RoommateSeekingPost {
	id: string;
	title: string;
	description: string;
	externalAddress: string;
	externalProvinceId: number;
	externalDistrictId: number;
	externalWardId: number;
	monthlyRent: number;
	currency: string;
	depositAmount: number;
	utilityCostPerPerson: number;
	seekingCount: number;
	maxOccupancy: number;
	currentOccupancy: number;
	preferredGender: 'any' | 'male' | 'female';
	additionalRequirements?: string;
	availableFromDate: string;
	minimumStayMonths?: number;
	maximumStayMonths?: number;
	requiresLandlordApproval: boolean;
	status: 'active' | 'inactive' | 'closed' | 'expired';
	userId: string;
	createdAt: string;
	updatedAt: string;
}

export interface CreateRoommateSeekingPostRequest {
	title: string;
	description: string;
	externalAddress: string;
	externalProvinceId: number;
	externalDistrictId: number;
	externalWardId: number;
	monthlyRent: number;
	currency?: string;
	depositAmount: number;
	utilityCostPerPerson: number;
	seekingCount: number;
	maxOccupancy: number;
	currentOccupancy: number;
	preferredGender: 'any' | 'male' | 'female';
	additionalRequirements?: string;
	availableFromDate: string;
	minimumStayMonths?: number;
	maximumStayMonths?: number;
	requiresLandlordApproval?: boolean;
}

export interface UpdateRoommateSeekingPostRequest {
	title?: string;
	description?: string;
	externalAddress?: string;
	externalProvinceId?: number;
	externalDistrictId?: number;
	externalWardId?: number;
	monthlyRent?: number;
	currency?: string;
	depositAmount?: number;
	utilityCostPerPerson?: number;
	seekingCount?: number;
	maxOccupancy?: number;
	currentOccupancy?: number;
	preferredGender?: 'any' | 'male' | 'female';
	additionalRequirements?: string;
	availableFromDate?: string;
	minimumStayMonths?: number;
	maximumStayMonths?: number;
	requiresLandlordApproval?: boolean;
}

export interface RoommateSeekingPostListResponse {
	data: RoommateSeekingPost[];
	page: number;
	limit: number;
	total: number;
	totalPages: number;
}

export interface SearchRoommateSeekingPostsParams {
	page?: number;
	limit?: number;
	provinceId?: number;
	districtId?: number;
	wardId?: number;
	minPrice?: number;
	maxPrice?: number;
	preferredGender?: 'any' | 'male' | 'female';
	status?: 'active' | 'inactive' | 'closed' | 'expired';
	sortBy?: 'createdAt' | 'monthlyRent' | 'updatedAt';
	sortOrder?: 'asc' | 'desc';
}

// Create roommate seeking post
export const createRoommateSeekingPost = async (
	data: CreateRoommateSeekingPostRequest,
	token?: string,
): Promise<ApiResult<RoommateSeekingPost>> => {
	try {
		const response = await apiCall<RoommateSeekingPost>(
			'/api/roommate-seeking-posts',
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
			error: extractErrorMessage(error, 'Không thể tạo bài đăng tìm bạn cùng phòng'),
			status: error instanceof AxiosError ? error.response?.status : undefined,
		};
	}
};

// Get roommate seeking post by ID
export const getRoommateSeekingPostById = async (
	id: string,
	token?: string,
): Promise<ApiResult<RoommateSeekingPost>> => {
	try {
		const response = await apiCall<RoommateSeekingPost>(
			`/api/roommate-seeking-posts/${id}`,
			{
				method: 'GET',
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
			error: extractErrorMessage(error, 'Không thể tải thông tin bài đăng'),
			status: error instanceof AxiosError ? error.response?.status : undefined,
		};
	}
};

// Get my roommate seeking posts
export const getMyRoommateSeekingPosts = async (
	params?: {
		page?: number;
		limit?: number;
	},
	token?: string,
): Promise<ApiResult<RoommateSeekingPostListResponse>> => {
	try {
		const searchParams = new URLSearchParams();
		if (params?.page) searchParams.append('page', params.page.toString());
		if (params?.limit) searchParams.append('limit', params.limit.toString());

		const endpoint = `/api/roommate-seeking-posts/me${
			searchParams.toString() ? `?${searchParams.toString()}` : ''
		}`;

		const response = await apiCall<RoommateSeekingPostListResponse>(
			endpoint,
			{
				method: 'GET',
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
			error: extractErrorMessage(error, 'Không thể tải danh sách bài đăng của bạn'),
			status: error instanceof AxiosError ? error.response?.status : undefined,
		};
	}
};

// Get all roommate seeking posts (public)
export const getAllRoommateSeekingPosts = async (
	params?: {
		page?: number;
		limit?: number;
		sortBy?: 'createdAt' | 'monthlyRent' | 'updatedAt';
		sortOrder?: 'asc' | 'desc';
	},
	token?: string,
): Promise<ApiResult<RoommateSeekingPostListResponse>> => {
	try {
		const searchParams = new URLSearchParams();
		if (params?.page) searchParams.append('page', params.page.toString());
		if (params?.limit) searchParams.append('limit', params.limit.toString());
		if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
		if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);

		const endpoint = `/api/roommate-seeking-posts${
			searchParams.toString() ? `?${searchParams.toString()}` : ''
		}`;

		const response = await apiCall<RoommateSeekingPostListResponse>(
			endpoint,
			{
				method: 'GET',
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
			error: extractErrorMessage(error, 'Không thể tải danh sách bài đăng'),
			status: error instanceof AxiosError ? error.response?.status : undefined,
		};
	}
};

// Search/Filter roommate seeking posts
export const searchRoommateSeekingPosts = async (
	params: SearchRoommateSeekingPostsParams,
	token?: string,
): Promise<ApiResult<RoommateSeekingPostListResponse>> => {
	try {
		const searchParams = new URLSearchParams();
		if (params.page) searchParams.append('page', params.page.toString());
		if (params.limit) searchParams.append('limit', params.limit.toString());
		if (params.provinceId) searchParams.append('provinceId', params.provinceId.toString());
		if (params.districtId) searchParams.append('districtId', params.districtId.toString());
		if (params.wardId) searchParams.append('wardId', params.wardId.toString());
		if (params.minPrice) searchParams.append('minPrice', params.minPrice.toString());
		if (params.maxPrice) searchParams.append('maxPrice', params.maxPrice.toString());
		if (params.preferredGender) searchParams.append('preferredGender', params.preferredGender);
		if (params.status) searchParams.append('status', params.status);
		if (params.sortBy) searchParams.append('sortBy', params.sortBy);
		if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);

		const endpoint = `/api/roommate-seeking-posts/search${
			searchParams.toString() ? `?${searchParams.toString()}` : ''
		}`;

		const response = await apiCall<RoommateSeekingPostListResponse>(
			endpoint,
			{
				method: 'GET',
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
			error: extractErrorMessage(error, 'Không thể tìm kiếm bài đăng'),
			status: error instanceof AxiosError ? error.response?.status : undefined,
		};
	}
};

// Update roommate seeking post
export const updateRoommateSeekingPost = async (
	id: string,
	data: UpdateRoommateSeekingPostRequest,
	token?: string,
): Promise<ApiResult<RoommateSeekingPost>> => {
	try {
		const response = await apiCall<RoommateSeekingPost>(
			`/api/roommate-seeking-posts/${id}`,
			{
				method: 'PATCH',
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
			error: extractErrorMessage(error, 'Không thể cập nhật bài đăng'),
			status: error instanceof AxiosError ? error.response?.status : undefined,
		};
	}
};

// Update roommate seeking post status
export const updateRoommateSeekingPostStatus = async (
	id: string,
	status: 'active' | 'inactive' | 'closed' | 'expired',
	token?: string,
): Promise<ApiResult<RoommateSeekingPost>> => {
	try {
		const response = await apiCall<RoommateSeekingPost>(
			`/api/roommate-seeking-posts/${id}/status`,
			{
				method: 'PATCH',
				data: { status },
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
			error: extractErrorMessage(error, 'Không thể cập nhật trạng thái bài đăng'),
			status: error instanceof AxiosError ? error.response?.status : undefined,
		};
	}
};

// Delete roommate seeking post
export const deleteRoommateSeekingPost = async (
	id: string,
	token?: string,
): Promise<ApiResult<{ message: string }>> => {
	try {
		const response = await apiCall<{ message: string }>(
			`/api/roommate-seeking-posts/${id}`,
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
			error: extractErrorMessage(error, 'Không thể xóa bài đăng'),
			status: error instanceof AxiosError ? error.response?.status : undefined,
		};
	}
};
