'use server';

import { AxiosError } from 'axios';
import { cookies } from 'next/headers';
import { createServerApiCall } from '../lib/api-client';
import {
	BulkUpdateRoomInstancesRequest,
	CreateRoomRequest,
	Room,
	RoomInstancesResponse,
	RoomsListResponse,
	UpdateRoomInstanceStatusRequest,
	UpdateRoomRequest,
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
	console.error('Room API Error Debug:', error);

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
					// Handle nested message structure
					if (typeof data.message === 'object' && data.message !== null) {
						const nestedMessage = data.message as { message?: string | string[]; error?: string };
						if (nestedMessage.message) {
							if (Array.isArray(nestedMessage.message)) {
								return `Dữ liệu không hợp lệ:\n${nestedMessage.message.join('\n')}`;
							}
							return nestedMessage.message;
						}
						if (nestedMessage.error) {
							return nestedMessage.error;
						}
					}
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
				return 'Không tìm thấy phòng';
			case 409:
				return 'Phòng đã tồn tại';
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

// Create API call function for server actions
// Helper function to get token from cookies
const getTokenFromCookies = async (): Promise<string | null> => {
	const cookieStore = await cookies();
	return cookieStore.get('accessToken')?.value || null;
};

const apiCall = createServerApiCall(getTokenFromCookies);

// Get my rooms (landlord's rooms)
export const getMyRooms = async (params?: {
	page?: number;
	limit?: number;
}): Promise<ApiResult<RoomsListResponse>> => {
	try {
		const searchParams = new URLSearchParams();
		if (params?.page) searchParams.append('page', params.page.toString());
		if (params?.limit) searchParams.append('limit', params.limit.toString());

		const endpoint = `/api/rooms/me${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
		const response = await apiCall<{
			success: boolean;
			message: string;
			data: RoomsListResponse;
		}>(endpoint, {
			method: 'GET',
		});

		console.log('My Rooms API Response:', response);

		return {
			success: true,
			data: response.data,
		};
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể tải danh sách phòng của tôi'),
		};
	}
};

// Create room type in building
export const createRoom = async (
	buildingId: string,
	data: CreateRoomRequest,
): Promise<ApiResult<{ data: Room }>> => {
	try {
		const response = await apiCall<{ data: Room }>(`/api/rooms/${buildingId}/rooms`, {
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
			error: extractErrorMessage(error, 'Không thể tạo loại phòng'),
		};
	}
};

// Get room by ID
export const getRoomById = async (id: string): Promise<ApiResult<{ data: Room }>> => {
	try {
		const response = await apiCall<{ data: Room }>(`/api/rooms/${id}`, {
			method: 'GET',
		});

		return {
			success: true,
			data: response,
		};
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể tải thông tin phòng'),
		};
	}
};

// Get room by slug
export const getRoomBySlug = async (slug: string): Promise<ApiResult<{ data: Room }>> => {
	try {
		const response = await apiCall<{ data: Room }>(`/api/rooms/${slug}`, {
			method: 'GET',
		});

		return {
			success: true,
			data: response,
		};
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể tải thông tin phòng'),
		};
	}
};

// Update room type (OVERRIDE mode for arrays)
export const updateRoom = async (
	id: string,
	data: UpdateRoomRequest,
): Promise<ApiResult<{ data: Room }>> => {
	try {
		console.log('Room update data:', data);

		const response = await apiCall<{ data: Room }>(`/api/rooms/${id}`, {
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
			error: extractErrorMessage(error, 'Không thể cập nhật loại phòng'),
		};
	}
};

// Get rooms by building with pagination
export const getRoomsByBuilding = async (
	buildingId: string,
	params?: {
		page?: number;
		limit?: number;
	},
): Promise<ApiResult<RoomsListResponse>> => {
	try {
		const searchParams = new URLSearchParams();
		if (params?.page) searchParams.append('page', params.page.toString());
		if (params?.limit) searchParams.append('limit', params.limit.toString());

		const endpoint = `/api/rooms/building/${buildingId}/rooms${
			searchParams.toString() ? `?${searchParams.toString()}` : ''
		}`;
		const response = await apiCall<{
			success: boolean;
			message: string;
			data: RoomsListResponse;
		}>(endpoint, {
			method: 'GET',
		});

		return {
			success: true,
			data: response.data, // Extract the actual data object
		};
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể tải danh sách phòng'),
		};
	}
};

// Get room instances by status
export const getRoomInstancesByStatus = async (
	roomId: string,
	status?: string,
): Promise<ApiResult<RoomInstancesResponse>> => {
	try {
		const searchParams = new URLSearchParams();
		if (status && status !== 'all') searchParams.append('status', status);

		const endpoint = `/api/rooms/${roomId}/instances/status${
			searchParams.toString() ? `?${searchParams.toString()}` : ''
		}`;
		const response = await apiCall<RoomInstancesResponse>(endpoint, {
			method: 'GET',
		});

		return {
			success: true,
			data: response,
		};
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể tải danh sách phòng'),
		};
	}
};

// Update single room instance status
export const updateRoomInstanceStatus = async (
	instanceId: string,
	data: UpdateRoomInstanceStatusRequest,
): Promise<ApiResult<{ message: string }>> => {
	try {
		const response = await apiCall<{ message: string }>(
			`/api/rooms/instance/${instanceId}/status`,
			{
				method: 'PUT',
				data,
			},
		);

		return {
			success: true,
			data: response,
		};
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể cập nhật trạng thái phòng'),
		};
	}
};

// Bulk update room instances status
export const bulkUpdateRoomInstancesStatus = async (
	roomId: string,
	data: BulkUpdateRoomInstancesRequest,
): Promise<ApiResult<{ message: string }>> => {
	try {
		const response = await apiCall<{ message: string }>(
			`/api/rooms/${roomId}/instances/status/bulk`,
			{
				method: 'PUT',
				data,
			},
		);

		return {
			success: true,
			data: response,
		};
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể cập nhật trạng thái phòng'),
		};
	}
};

// Delete room type
export const deleteRoom = async (id: string): Promise<ApiResult<{ message: string }>> => {
	try {
		const response = await apiCall<{ message: string }>(`/api/rooms/${id}`, {
			method: 'DELETE',
		});

		return {
			success: true,
			data: response,
		};
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể xóa loại phòng'),
		};
	}
};
