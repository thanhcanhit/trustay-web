'use server';

import { AxiosError } from 'axios';
import { cookies } from 'next/headers';
import { createServerApiCall } from '@/lib/api-client';
import type {
	BookingRequest,
	BookingRequestListResponse,
	CancelBookingRequestRequest,
	CreateBookingRequestRequest,
	UpdateBookingRequestRequest,
} from '@/types/types';

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

const extractErrorMessage = (error: unknown, defaultMessage: string): string => {
	if (error instanceof AxiosError) {
		const status = error.response?.status;
		const data = error.response?.data as { message?: unknown; error?: string } | undefined;
		switch (status) {
			case 400:
			case 422:
				if (!data) return 'Dữ liệu không hợp lệ';
				if (Array.isArray(data.message)) return `Dữ liệu không hợp lệ:\n${data.message.join('\n')}`;
				if (typeof data.message === 'string') return data.message;
				return 'Dữ liệu không hợp lệ';
			case 401:
				return 'Bạn cần đăng nhập để thực hiện thao tác này';
			case 403:
				return 'Bạn không có quyền thực hiện thao tác này';
			case 404:
				return 'Không tìm thấy yêu cầu đặt phòng';
			case 409:
				return 'Trạng thái yêu cầu không hợp lệ';
			default:
				if (data?.message && typeof data.message === 'string') return data.message;
				if (data?.error) return data.error;
				return defaultMessage;
		}
	}
	if (error instanceof Error) return error.message;
	return defaultMessage;
};

const getTokenFromCookies = async (): Promise<string | null> => {
	const cookieStore = await cookies();
	return cookieStore.get('accessToken')?.value || null;
};

const apiCall = createServerApiCall(getTokenFromCookies);

const normalizeEntityResponse = <T extends object>(response: unknown): { data: T } => {
	if (response && typeof response === 'object' && 'data' in (response as Record<string, unknown>)) {
		return response as { data: T };
	}
	return { data: response as T };
};

export const createBookingRequest = async (
	data: CreateBookingRequestRequest,
): Promise<ApiResult<{ data: BookingRequest }>> => {
	try {
		const roomId =
			(data as unknown as { roomId?: string; roomInstanceId?: string }).roomId ||
			(data as unknown as { roomInstanceId?: string }).roomInstanceId;

		if (!roomId) {
			return { success: false, error: 'ID phòng không hợp lệ' };
		}

		// Check if user is trying to book their own room by fetching room details
		try {
			const roomResponse = await apiCall<{ data: { owner: { id: string } } }>(
				`/api/rooms/${roomId}`,
				{
					method: 'GET',
				},
			);

			// Get current user to check if they're the owner
			const currentUserResponse = await apiCall<{ id: string }>('/api/auth/me', {
				method: 'GET',
			});

			if (roomResponse.data?.owner?.id === currentUserResponse.id) {
				return { success: false, error: 'Bạn không thể gửi yêu cầu thuê phòng của chính mình' };
			}
		} catch (error) {
			// If we can't verify ownership, continue with the request (the API will handle other validations)
			console.warn('Could not verify room ownership:', error);
		}

		// API expects `roomId` (see Postman collection). Backward-compat: map roomInstanceId -> roomId.
		const apiPayload = {
			roomId,
			moveInDate: data.moveInDate,
			...(data.moveOutDate ? { moveOutDate: data.moveOutDate } : {}),
			...(data.messageToOwner ? { messageToOwner: data.messageToOwner } : {}),
		};

		const response = await apiCall<{ data: BookingRequest }>(`/api/booking-requests`, {
			method: 'POST',
			data: apiPayload,
		});
		return { success: true, data: normalizeEntityResponse<BookingRequest>(response) };
	} catch (error) {
		return { success: false, error: extractErrorMessage(error, 'Không thể tạo yêu cầu đặt phòng') };
	}
};

export const getReceivedBookingRequests = async (params?: {
	page?: number;
	limit?: number;
	status?: string;
	buildingId?: string;
	roomId?: string;
}): Promise<ApiResult<BookingRequestListResponse>> => {
	try {
		const q = new URLSearchParams();
		if (params?.page) q.append('page', String(params.page));
		if (params?.limit) q.append('limit', String(params.limit));
		if (params?.status) q.append('status', params.status);
		if (params?.buildingId) q.append('buildingId', params.buildingId);
		if (params?.roomId) q.append('roomId', params.roomId);

		const endpoint = `/api/booking-requests/received${q.toString() ? `?${q.toString()}` : ''}`;
		const response = await apiCall<BookingRequestListResponse>(endpoint, { method: 'GET' });
		return { success: true, data: response };
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể tải yêu cầu đặt phòng đã nhận'),
		};
	}
};

export const getMyBookingRequests = async (params?: {
	page?: number;
	limit?: number;
	status?: string;
}): Promise<ApiResult<BookingRequestListResponse>> => {
	try {
		const q = new URLSearchParams();
		if (params?.page) q.append('page', String(params.page));
		if (params?.limit) q.append('limit', String(params.limit));
		if (params?.status) q.append('status', params.status);

		const endpoint = `/api/booking-requests/my-requests${q.toString() ? `?${q.toString()}` : ''}`;
		const response = await apiCall<BookingRequestListResponse>(endpoint, { method: 'GET' });
		return { success: true, data: response };
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể tải yêu cầu đặt phòng của tôi'),
		};
	}
};

export const getBookingRequestById = async (
	id: string,
): Promise<ApiResult<{ data: BookingRequest }>> => {
	try {
		const response = await apiCall<{ data: BookingRequest }>(`/api/booking-requests/${id}`, {
			method: 'GET',
		});
		return { success: true, data: normalizeEntityResponse<BookingRequest>(response) };
	} catch (error) {
		return { success: false, error: extractErrorMessage(error, 'Không thể tải yêu cầu đặt phòng') };
	}
};

export const updateBookingRequestAsOwner = async (
	id: string,
	data: UpdateBookingRequestRequest,
): Promise<ApiResult<{ message: string }>> => {
	try {
		const response = await apiCall<{ message: string }>(`/api/booking-requests/${id}`, {
			method: 'PATCH',
			data,
		});
		return { success: true, data: response };
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể cập nhật yêu cầu đặt phòng'),
		};
	}
};

export const cancelMyBookingRequest = async (
	id: string,
	data: CancelBookingRequestRequest,
): Promise<ApiResult<{ message: string }>> => {
	try {
		const response = await apiCall<{ message: string }>(`/api/booking-requests/${id}/cancel`, {
			method: 'PATCH',
			data,
		});
		return { success: true, data: response };
	} catch (error) {
		return { success: false, error: extractErrorMessage(error, 'Không thể hủy yêu cầu đặt phòng') };
	}
};

export const getMyBookingRequestsMe = async (params?: {
	page?: number;
	limit?: number;
	status?: string;
	buildingId?: string;
	roomId?: string;
}): Promise<ApiResult<BookingRequestListResponse>> => {
	try {
		const q = new URLSearchParams();
		if (params?.page) q.append('page', String(params.page));
		if (params?.limit) q.append('limit', String(params.limit));
		if (params?.status) q.append('status', params.status);
		if (params?.buildingId) q.append('buildingId', params.buildingId);
		if (params?.roomId) q.append('roomId', params.roomId);

		const endpoint = `/api/booking-requests/me${q.toString() ? `?${q.toString()}` : ''}`;
		const response = await apiCall<BookingRequestListResponse>(endpoint, { method: 'GET' });
		return { success: true, data: response };
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể tải danh sách yêu cầu đặt phòng của tôi'),
		};
	}
};
