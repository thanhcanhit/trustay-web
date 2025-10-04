'use server';

import { createServerApiCall } from '../lib/api-client';
import type {
	CreateRoomSeekingPostRequest,
	RoomSeekingPost,
	RoomSeekingPostListResponse,
	RoomSeekingSearchParams,
	UpdateRoomSeekingPostRequest,
} from '../types/room-seeking';
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

// Normalize single-entity API responses to { data: T }
const normalizeEntityResponse = <T extends object>(response: unknown): { data: T } => {
	if (response && typeof response === 'object' && 'data' in (response as Record<string, unknown>)) {
		return response as { data: T };
	}
	return { data: response as T };
};

// Create new room seeking post
export const createRoomSeekingPost = async (
	data: CreateRoomSeekingPostRequest,
	token?: string,
): Promise<ApiResult<{ data: RoomSeekingPost }>> => {
	try {
		// Debug: Log the data being sent to API
		console.log('Room Seeking Action - Data being sent:', JSON.stringify(data, null, 2));

		// Validate data before sending
		if (!data.title || !data.description) {
			throw new Error('Title and description are required');
		}

		if (
			Number.isNaN(data.preferredProvinceId) ||
			Number.isNaN(data.preferredDistrictId) ||
			Number.isNaN(data.preferredWardId)
		) {
			throw new Error('Invalid address data');
		}

		if (
			Number.isNaN(data.minBudget) ||
			Number.isNaN(data.maxBudget) ||
			Number.isNaN(data.occupancy)
		) {
			throw new Error('Invalid numeric data');
		}

		const response = await apiCall<{ data: RoomSeekingPost }>(
			'/api/room-seeking-posts',
			{
				method: 'POST',
				data,
			},
			token,
		);

		return {
			success: true,
			data: normalizeEntityResponse<RoomSeekingPost>(response),
		};
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể tạo bài đăng tìm trọ'),
		};
	}
};

// Get room seeking post by ID
export const getRoomSeekingPostById = async (
	id: string,
	token?: string,
): Promise<ApiResult<{ data: RoomSeekingPost }>> => {
	try {
		const response = await apiCall<{ data: RoomSeekingPost }>(
			`/api/room-seeking-posts/${id}`,
			{
				method: 'GET',
			},
			token,
		);

		return {
			success: true,
			data: normalizeEntityResponse<RoomSeekingPost>(response),
		};
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể tải thông tin bài đăng tìm trọ'),
		};
	}
};

// Update room seeking post
export const updateRoomSeekingPost = async (
	id: string,
	data: UpdateRoomSeekingPostRequest,
	token?: string,
): Promise<ApiResult<{ data: RoomSeekingPost }>> => {
	try {
		const response = await apiCall<{ data: RoomSeekingPost }>(
			`/api/room-seeking-posts/${id}`,
			{
				method: 'PATCH',
				data,
			},
			token,
		);

		return {
			success: true,
			data: normalizeEntityResponse<RoomSeekingPost>(response),
		};
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể cập nhật bài đăng tìm trọ'),
		};
	}
};

// Update room seeking post status
export const updateRoomSeekingPostStatus = async (
	id: string,
	status: 'active' | 'paused' | 'closed' | 'expired',
	token?: string,
): Promise<ApiResult<{ data: RoomSeekingPost }>> => {
	try {
		const response = await apiCall<{ data: RoomSeekingPost }>(
			`/api/room-seeking-posts/${id}/status`,
			{
				method: 'PATCH',
				data: { status },
			},
			token,
		);

		return {
			success: true,
			data: normalizeEntityResponse<RoomSeekingPost>(response),
		};
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể cập nhật trạng thái bài đăng tìm trọ'),
		};
	}
};

// Delete room seeking post
export const deleteRoomSeekingPost = async (
	id: string,
	token?: string,
): Promise<ApiResult<{ message: string }>> => {
	try {
		const response = await apiCall<{ message: string }>(
			`/api/room-seeking-posts/${id}`,
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
			error: extractErrorMessage(error, 'Không thể xóa bài đăng tìm trọ'),
		};
	}
};

// Increment contact count for room seeking post
export const incrementRoomSeekingPostContact = async (
	id: string,
	token?: string,
): Promise<ApiResult<{ message: string }>> => {
	try {
		const response = await apiCall<{ message: string }>(
			`/api/room-seeking-posts/${id}/contact`,
			{
				method: 'POST',
				data: '',
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
			error: extractErrorMessage(error, 'Không thể tăng số lượt liên hệ'),
		};
	}
};

// Get room seeking posts with pagination (optional - for listing)
export const getRoomSeekingPosts = async (
	params?: {
		page?: number;
		limit?: number;
		status?: string;
		userId?: string;
		search?: string;
		sortBy?: RoomSeekingSearchParams['sortBy'];
		sortOrder?: RoomSeekingSearchParams['sortOrder'];
		preferredProvinceId?: number;
		preferredDistrictId?: number;
		preferredWardId?: number;
		minBudget?: number;
		maxBudget?: number;
		preferredRoomType?: string;
		occupancy?: number;
	},
	token?: string,
): Promise<ApiResult<RoomSeekingPostListResponse>> => {
	try {
		const searchParams = new URLSearchParams();
		if (params?.page) searchParams.append('page', params.page.toString());
		if (params?.limit) searchParams.append('limit', params.limit.toString());
		if (params?.status) searchParams.append('status', params.status);
		if (params?.userId) searchParams.append('userId', params.userId);
		if (params?.search) searchParams.append('search', params.search);
		if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
		if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);
		if (params?.preferredProvinceId)
			searchParams.append('preferredProvinceId', String(params.preferredProvinceId));
		if (params?.preferredDistrictId)
			searchParams.append('preferredDistrictId', String(params.preferredDistrictId));
		if (params?.preferredWardId)
			searchParams.append('preferredWardId', String(params.preferredWardId));
		if (typeof params?.minBudget === 'number')
			searchParams.append('minBudget', String(params.minBudget));
		if (typeof params?.maxBudget === 'number')
			searchParams.append('maxBudget', String(params.maxBudget));
		if (params?.preferredRoomType)
			searchParams.append('preferredRoomType', params.preferredRoomType);
		if (typeof params?.occupancy === 'number')
			searchParams.append('occupancy', String(params.occupancy));

		const endpoint = `/api/room-seeking-posts${
			searchParams.toString() ? `?${searchParams.toString()}` : ''
		}`;
		const response = await apiCall<RoomSeekingPostListResponse>(
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
			error: extractErrorMessage(error, 'Không thể tải danh sách bài đăng tìm trọ'),
		};
	}
};

// Get current user's room seeking posts (convenience)
export const getMyRoomSeekingPosts = async (
	params?: Omit<RoomSeekingSearchParams, 'userId'>,
	token?: string,
): Promise<ApiResult<RoomSeekingPostListResponse>> => {
	try {
		const searchParams = new URLSearchParams();
		if (params?.page) searchParams.append('page', String(params.page));
		if (params?.limit) searchParams.append('limit', String(params.limit));
		if (params?.search) searchParams.append('search', params.search);
		if (params?.status) searchParams.append('status', params.status);
		if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
		if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);

		const endpoint = `/api/room-seeking-posts/me${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
		const response = await apiCall<RoomSeekingPostListResponse>(endpoint, { method: 'GET' }, token);
		return { success: true, data: response };
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể tải danh sách bài đăng của bạn'),
		};
	}
};
