'use server';

import { AxiosError } from 'axios';
import { cookies } from 'next/headers';
import { createServerApiCall } from '../lib/api-client';
import type {
	CreateRoomSeekingPostRequest,
	RoomSeekingPost,
	RoomSeekingPostListResponse,
	UpdateRoomSeekingPostRequest,
} from '../types/room-seeking';

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
	console.error('Room Seeking API Error Debug:', error);

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
				if (data?.message) {
					// Handle array of validation errors
					if (Array.isArray(data.message)) {
						return `Dữ liệu không hợp lệ:\n${data.message.join('\n')}`;
					}
					return data.message;
				}
				return 'Dữ liệu không hợp lệ';
			case 401:
				return 'Bạn cần đăng nhập để thực hiện thao tác này';
			case 403:
				return 'Bạn không có quyền thực hiện thao tác này';
			case 404:
				return 'Không tìm thấy bài đăng tìm trọ';
			case 409:
				return 'Bài đăng tìm trọ đã tồn tại';
			case 422:
				if (data?.message) {
					if (Array.isArray(data.message)) {
						return `Dữ liệu không hợp lệ:\n${data.message.join('\n')}`;
					}
					return data.message;
				}
				return 'Dữ liệu không hợp lệ';
			case 500:
				return 'Lỗi hệ thống, vui lòng thử lại sau';
			default:
				if (data?.message) {
					if (Array.isArray(data.message)) {
						return `Lỗi:\n${data.message.join('\n')}`;
					}
					return data.message;
				}
				if (data?.error) return data.error;
				return defaultMessage;
		}
	}

	if (error instanceof Error) {
		return error.message;
	}

	return defaultMessage;
};

// Helper function to get token from cookies
const getTokenFromCookies = async (): Promise<string | null> => {
	const cookieStore = await cookies();
	return cookieStore.get('accessToken')?.value || null;
};

const apiCall = createServerApiCall(getTokenFromCookies);

// Create new room seeking post
export const createRoomSeekingPost = async (
	data: CreateRoomSeekingPostRequest,
): Promise<ApiResult<{ data: RoomSeekingPost }>> => {
	try {
		// Debug: Log the data being sent to API
		console.log('Room Seeking Action - Data being sent:', JSON.stringify(data, null, 2));

		// Validate data before sending
		if (!data.title || !data.description) {
			throw new Error('Title and description are required');
		}

		if (
			isNaN(data.preferredProvinceId) ||
			isNaN(data.preferredDistrictId) ||
			isNaN(data.preferredWardId)
		) {
			throw new Error('Invalid address data');
		}

		if (isNaN(data.minBudget) || isNaN(data.maxBudget) || isNaN(data.occupancy)) {
			throw new Error('Invalid numeric data');
		}

		const response = await apiCall<{ data: RoomSeekingPost }>('/api/room-seeking-posts', {
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
			error: extractErrorMessage(error, 'Không thể tạo bài đăng tìm trọ'),
		};
	}
};

// Get room seeking post by ID
export const getRoomSeekingPostById = async (
	id: string,
): Promise<ApiResult<{ data: RoomSeekingPost }>> => {
	try {
		const response = await apiCall<{ data: RoomSeekingPost }>(`/api/room-seeking-posts/${id}`, {
			method: 'GET',
		});

		return {
			success: true,
			data: response,
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
): Promise<ApiResult<{ data: RoomSeekingPost }>> => {
	try {
		const response = await apiCall<{ data: RoomSeekingPost }>(`/api/room-seeking-posts/${id}`, {
			method: 'PATCH',
			data,
		});

		return {
			success: true,
			data: response,
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
): Promise<ApiResult<{ data: RoomSeekingPost }>> => {
	try {
		const response = await apiCall<{ data: RoomSeekingPost }>(
			`/api/room-seeking-posts/${id}/status`,
			{
				method: 'PATCH',
			},
		);

		return {
			success: true,
			data: response,
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
): Promise<ApiResult<{ message: string }>> => {
	try {
		const response = await apiCall<{ message: string }>(`/api/room-seeking-posts/${id}`, {
			method: 'DELETE',
		});

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
): Promise<ApiResult<{ message: string }>> => {
	try {
		const response = await apiCall<{ message: string }>(`/api/room-seeking-posts/${id}/contact`, {
			method: 'POST',
			data: '',
		});

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
export const getRoomSeekingPosts = async (params?: {
	page?: number;
	limit?: number;
	status?: string;
	userId?: string;
}): Promise<ApiResult<RoomSeekingPostListResponse>> => {
	try {
		const searchParams = new URLSearchParams();
		if (params?.page) searchParams.append('page', params.page.toString());
		if (params?.limit) searchParams.append('limit', params.limit.toString());
		if (params?.status) searchParams.append('status', params.status);
		if (params?.userId) searchParams.append('userId', params.userId);

		const endpoint = `/api/room-seeking-posts${
			searchParams.toString() ? `?${searchParams.toString()}` : ''
		}`;
		const response = await apiCall<RoomSeekingPostListResponse>(endpoint, {
			method: 'GET',
		});

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
