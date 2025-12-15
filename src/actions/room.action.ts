'use server';

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

// Get my rooms (landlord's rooms)
export const getMyRooms = async (
	params?: {
		page?: number;
		limit?: number;
	},
	token?: string,
): Promise<ApiResult<RoomsListResponse>> => {
	try {
		const searchParams = new URLSearchParams();
		if (params?.page) searchParams.append('page', params.page.toString());
		if (params?.limit) searchParams.append('limit', params.limit.toString());

		const endpoint = `/api/rooms/me${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
		const response = await apiCall<{
			success: boolean;
			message: string;
			data: RoomsListResponse;
		}>(
			endpoint,
			{
				method: 'GET',
			},
			token,
		);

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
	token?: string,
): Promise<ApiResult<{ data: Room }>> => {
	try {
		const response = await apiCall<{ data: Room }>(
			`/api/rooms/${buildingId}/rooms`,
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
			error: extractErrorMessage(error, 'Không thể tạo loại phòng'),
		};
	}
};

// Get room by ID
export const getRoomById = async (
	id: string,
	token?: string,
): Promise<ApiResult<{ data: Room }>> => {
	try {
		const response = await apiCall<{ data: Room }>(
			`/api/rooms/${id}`,
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
			error: extractErrorMessage(error, 'Không thể tải thông tin phòng'),
		};
	}
};

// Get room by slug
export const getRoomBySlug = async (
	slug: string,
	token?: string,
): Promise<ApiResult<{ data: Room }>> => {
	try {
		const response = await apiCall<{ data: Room }>(
			`/api/rooms/${slug}`,
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
			error: extractErrorMessage(error, 'Không thể tải thông tin phòng'),
		};
	}
};

// Update room type (OVERRIDE mode for arrays)
export const updateRoom = async (
	id: string,
	data: UpdateRoomRequest,
	token?: string,
): Promise<ApiResult<{ data: Room }>> => {
	try {
		console.log('Room update data:', data);

		const response = await apiCall<{ data: Room }>(
			`/api/rooms/${id}`,
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
	token?: string,
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
		}>(
			endpoint,
			{
				method: 'GET',
			},
			token,
		);

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
	token?: string,
): Promise<ApiResult<RoomInstancesResponse>> => {
	try {
		const searchParams = new URLSearchParams();
		if (status && status !== 'all') searchParams.append('status', status);

		const endpoint = `/api/rooms/${roomId}/instances/status${
			searchParams.toString() ? `?${searchParams.toString()}` : ''
		}`;
		const response = await apiCall<RoomInstancesResponse>(
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
			error: extractErrorMessage(error, 'Không thể tải danh sách phòng'),
		};
	}
};

// Update single room instance status
export const updateRoomInstanceStatus = async (
	instanceId: string,
	data: UpdateRoomInstanceStatusRequest,
	token?: string,
): Promise<ApiResult<{ message: string }>> => {
	try {
		const response = await apiCall<{ message: string }>(
			`/api/rooms/instance/${instanceId}/status`,
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
			error: extractErrorMessage(error, 'Không thể cập nhật trạng thái phòng'),
		};
	}
};

// Bulk update room instances status
export const bulkUpdateRoomInstancesStatus = async (
	roomId: string,
	data: BulkUpdateRoomInstancesRequest,
	token?: string,
): Promise<ApiResult<{ message: string }>> => {
	try {
		const response = await apiCall<{ message: string }>(
			`/api/rooms/${roomId}/instances/status/bulk`,
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
			error: extractErrorMessage(error, 'Không thể cập nhật trạng thái phòng'),
		};
	}
};

// Delete room type
export const deleteRoom = async (
	id: string,
	token?: string,
): Promise<ApiResult<{ message: string }>> => {
	try {
		const response = await apiCall<{ message: string }>(
			`/api/rooms/${id}`,
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
			error: extractErrorMessage(error, 'Không thể xóa loại phòng'),
		};
	}
};

// Search room instances with filters
export const searchRoomInstances = async (
	params: {
		buildingId?: string;
		search?: string;
		status?: 'available' | 'occupied' | 'maintenance' | 'reserved' | 'unavailable';
	},
	token?: string,
): Promise<
	ApiResult<{
		success: boolean;
		message: string;
		data: Array<{
			id: string;
			roomNumber: string;
			roomId: string;
			roomName: string;
			buildingId: string;
			buildingName: string;
			ownerId: string;
			ownerName: string;
			status?: string;
			floorNumber?: number;
			notes?: string;
		}>;
		timestamp: string;
	}>
> => {
	try {
		const searchParams = new URLSearchParams();
		if (params.buildingId) searchParams.append('buildingId', params.buildingId);
		if (params.search) searchParams.append('search', params.search);
		if (params.status) searchParams.append('status', params.status);

		const endpoint = `/api/rooms/instances/search${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
		const response = await apiCall<{
			success: boolean;
			message: string;
			data: Array<{
				id: string;
				roomNumber: string;
				roomId: string;
				roomName: string;
				buildingId: string;
				buildingName: string;
				ownerId: string;
				ownerName: string;
				status?: string;
				floorNumber?: number;
				notes?: string;
			}>;
			timestamp: string;
		}>(
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
			error: extractErrorMessage(error, 'Không thể tìm kiếm phòng'),
		};
	}
};
