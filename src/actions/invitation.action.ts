'use server';

import { createServerApiCall } from '@/lib/api-client';
import type {
	CreateRoomInvitationRequest,
	InvitationListResponse,
	RespondInvitationRequest,
	RoomInvitation,
} from '@/types/types';
import { extractErrorMessage } from '@/utils/api-error-handler';

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

const normalizeEntityResponse = <T extends object>(response: unknown): { data: T } => {
	if (response && typeof response === 'object' && 'data' in (response as Record<string, unknown>)) {
		return response as { data: T };
	}
	return { data: response as T };
};

export const createRoomInvitation = async (
	data: CreateRoomInvitationRequest,
	token?: string,
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

		const response = await apiCall<{ data: RoomInvitation }>(
			`/api/room-invitations`,
			{
				method: 'POST',
				data: apiPayload,
			},
			token,
		);
		return { success: true, data: normalizeEntityResponse<RoomInvitation>(response) };
	} catch (error) {
		return { success: false, error: extractErrorMessage(error, 'Không thể tạo lời mời') };
	}
};

export const getSentInvitations = async (
	params?: {
		page?: number;
		limit?: number;
		status?: string;
		buildingId?: string;
		roomId?: string;
	},
	token?: string,
): Promise<ApiResult<InvitationListResponse>> => {
	try {
		const searchParams = new URLSearchParams();
		if (params?.page) searchParams.append('page', String(params.page));
		if (params?.limit) searchParams.append('limit', String(params.limit));
		if (params?.status) searchParams.append('status', params.status);
		if (params?.buildingId) searchParams.append('buildingId', params.buildingId);
		if (params?.roomId) searchParams.append('roomId', params.roomId);

		const endpoint = `/api/room-invitations/sent${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
		const response = await apiCall<InvitationListResponse>(endpoint, { method: 'GET' }, token);
		return { success: true, data: response };
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể tải danh sách lời mời đã gửi'),
		};
	}
};

export const getReceivedInvitations = async (
	params?: {
		page?: number;
		limit?: number;
		status?: string;
	},
	token?: string,
): Promise<ApiResult<InvitationListResponse>> => {
	try {
		const searchParams = new URLSearchParams();
		if (params?.page) searchParams.append('page', String(params.page));
		if (params?.limit) searchParams.append('limit', String(params.limit));
		if (params?.status) searchParams.append('status', params.status);

		const endpoint = `/api/room-invitations/received${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
		const response = await apiCall<InvitationListResponse>(endpoint, { method: 'GET' }, token);
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
	token?: string,
): Promise<ApiResult<{ data: RoomInvitation }>> => {
	try {
		const response = await apiCall<{ data: RoomInvitation }>(
			`/api/room-invitations/${id}`,
			{
				method: 'GET',
			},
			token,
		);
		return { success: true, data: normalizeEntityResponse<RoomInvitation>(response) };
	} catch (error) {
		return { success: false, error: extractErrorMessage(error, 'Không thể tải thông tin lời mời') };
	}
};

export const respondToInvitation = async (
	id: string,
	data: RespondInvitationRequest,
	token?: string,
): Promise<ApiResult<{ message: string }>> => {
	try {
		const response = await apiCall<{ message: string }>(
			`/api/room-invitations/${id}/respond`,
			{
				method: 'PATCH',
				data,
			},
			token,
		);
		return { success: true, data: response };
	} catch (error) {
		return { success: false, error: extractErrorMessage(error, 'Không thể phản hồi lời mời') };
	}
};

export const withdrawInvitation = async (
	id: string,
	token?: string,
): Promise<ApiResult<{ message: string }>> => {
	try {
		const response = await apiCall<{ message: string }>(
			`/api/room-invitations/${id}/withdraw`,
			{
				method: 'PATCH',
			},
			token,
		);
		return { success: true, data: response };
	} catch (error) {
		return { success: false, error: extractErrorMessage(error, 'Không thể rút lại lời mời') };
	}
};

export const getMyInvitations = async (
	params?: {
		page?: number;
		limit?: number;
		status?: string;
		buildingId?: string;
		roomId?: string;
	},
	token?: string,
): Promise<ApiResult<InvitationListResponse>> => {
	try {
		const searchParams = new URLSearchParams();
		if (params?.page) searchParams.append('page', String(params.page));
		if (params?.limit) searchParams.append('limit', String(params.limit));
		if (params?.status) searchParams.append('status', params.status);
		if (params?.buildingId) searchParams.append('buildingId', params.buildingId);
		if (params?.roomId) searchParams.append('roomId', params.roomId);

		const endpoint = `/api/room-invitations/me${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
		const response = await apiCall<InvitationListResponse>(endpoint, { method: 'GET' }, token);
		return { success: true, data: response };
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể tải danh sách lời mời của tôi'),
		};
	}
};
