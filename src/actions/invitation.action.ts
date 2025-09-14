'use server';

import { AxiosError } from 'axios';
import { cookies } from 'next/headers';
import { createServerApiCall } from '@/lib/api-client';
import type {
	CreateRoomInvitationRequest,
	InvitationListResponse,
	RespondInvitationRequest,
	RoomInvitation,
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
				return 'Không tìm thấy lời mời';
			case 409:
				return 'Lời mời đã tồn tại hoặc trạng thái không hợp lệ';
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

export const createRoomInvitation = async (
	data: CreateRoomInvitationRequest,
): Promise<ApiResult<{ data: RoomInvitation }>> => {
	try {
		// API expects `roomId` (see Postman collection). Backward-compat: map roomInstanceId -> roomId.
		const apiPayload = {
			roomId:
				(data as unknown as { roomId?: string; roomInstanceId?: string }).roomId ||
				(data as unknown as { roomInstanceId?: string }).roomInstanceId,
			tenantId: data.tenantId,
			...(data.availableFrom ? { availableFrom: data.availableFrom } : {}),
			...(data.availableUntil ? { availableUntil: data.availableUntil } : {}),
			...(data.invitationMessage ? { invitationMessage: data.invitationMessage } : {}),
			...(data.proposedRent ? { proposedRent: data.proposedRent } : {}),
		};

		const response = await apiCall<{ data: RoomInvitation }>(`/api/room-invitations`, {
			method: 'POST',
			data: apiPayload,
		});
		return { success: true, data: normalizeEntityResponse<RoomInvitation>(response) };
	} catch (error) {
		return { success: false, error: extractErrorMessage(error, 'Không thể tạo lời mời') };
	}
};

export const getSentInvitations = async (params?: {
	page?: number;
	limit?: number;
	status?: string;
	buildingId?: string;
	roomId?: string;
}): Promise<ApiResult<InvitationListResponse>> => {
	try {
		const searchParams = new URLSearchParams();
		if (params?.page) searchParams.append('page', String(params.page));
		if (params?.limit) searchParams.append('limit', String(params.limit));
		if (params?.status) searchParams.append('status', params.status);
		if (params?.buildingId) searchParams.append('buildingId', params.buildingId);
		if (params?.roomId) searchParams.append('roomId', params.roomId);

		const endpoint = `/api/room-invitations/sent${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
		const response = await apiCall<InvitationListResponse>(endpoint, { method: 'GET' });
		return { success: true, data: response };
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể tải danh sách lời mời đã gửi'),
		};
	}
};

export const getReceivedInvitations = async (params?: {
	page?: number;
	limit?: number;
	status?: string;
}): Promise<ApiResult<InvitationListResponse>> => {
	try {
		const searchParams = new URLSearchParams();
		if (params?.page) searchParams.append('page', String(params.page));
		if (params?.limit) searchParams.append('limit', String(params.limit));
		if (params?.status) searchParams.append('status', params.status);

		const endpoint = `/api/room-invitations/received${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
		const response = await apiCall<InvitationListResponse>(endpoint, { method: 'GET' });
		return { success: true, data: response };
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể tải danh sách lời mời nhận được'),
		};
	}
};

export const getInvitationById = async (
	id: string,
): Promise<ApiResult<{ data: RoomInvitation }>> => {
	try {
		const response = await apiCall<{ data: RoomInvitation }>(`/api/room-invitations/${id}`, {
			method: 'GET',
		});
		return { success: true, data: normalizeEntityResponse<RoomInvitation>(response) };
	} catch (error) {
		return { success: false, error: extractErrorMessage(error, 'Không thể tải thông tin lời mời') };
	}
};

export const respondToInvitation = async (
	id: string,
	data: RespondInvitationRequest,
): Promise<ApiResult<{ message: string }>> => {
	try {
		const response = await apiCall<{ message: string }>(`/api/room-invitations/${id}/respond`, {
			method: 'PATCH',
			data,
		});
		return { success: true, data: response };
	} catch (error) {
		return { success: false, error: extractErrorMessage(error, 'Không thể phản hồi lời mời') };
	}
};

export const withdrawInvitation = async (id: string): Promise<ApiResult<{ message: string }>> => {
	try {
		const response = await apiCall<{ message: string }>(`/api/room-invitations/${id}/withdraw`, {
			method: 'PATCH',
		});
		return { success: true, data: response };
	} catch (error) {
		return { success: false, error: extractErrorMessage(error, 'Không thể rút lại lời mời') };
	}
};

export const getMyInvitations = async (params?: {
	page?: number;
	limit?: number;
	status?: string;
	buildingId?: string;
	roomId?: string;
}): Promise<ApiResult<InvitationListResponse>> => {
	try {
		const searchParams = new URLSearchParams();
		if (params?.page) searchParams.append('page', String(params.page));
		if (params?.limit) searchParams.append('limit', String(params.limit));
		if (params?.status) searchParams.append('status', params.status);
		if (params?.buildingId) searchParams.append('buildingId', params.buildingId);
		if (params?.roomId) searchParams.append('roomId', params.roomId);

		const endpoint = `/api/room-invitations/me${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
		const response = await apiCall<InvitationListResponse>(endpoint, { method: 'GET' });
		return { success: true, data: response };
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể tải danh sách lời mời của tôi'),
		};
	}
};
