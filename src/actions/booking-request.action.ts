'use server';

import { createServerApiCall } from '@/lib/api-client';
import type {
	BookingRequest,
	BookingRequestListResponse,
	CancelBookingRequestRequest,
	ConfirmBookingRequestRequest,
	CreateBookingRequestRequest,
	UpdateBookingRequestRequest,
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

export const createBookingRequest = async (
	data: CreateBookingRequestRequest,
	token?: string,
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
				token,
			);

			// Get current user to check if they're the owner
			const currentUserResponse = await apiCall<{ id: string }>(
				'/api/auth/me',
				{
					method: 'GET',
				},
				token,
			);

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

		const response = await apiCall<{ data: BookingRequest }>(
			`/api/booking-requests`,
			{
				method: 'POST',
				data: apiPayload,
			},
			token,
		);
		return { success: true, data: normalizeEntityResponse<BookingRequest>(response) };
	} catch (error) {
		return { success: false, error: extractErrorMessage(error, 'Không thể tạo yêu cầu đặt phòng') };
	}
};

export const getReceivedBookingRequests = async (
	params?: {
		page?: number;
		limit?: number;
		status?: string;
		buildingId?: string;
		roomId?: string;
	},
	token?: string,
): Promise<ApiResult<BookingRequestListResponse>> => {
	try {
		const q = new URLSearchParams();
		if (params?.page) q.append('page', String(params.page));
		if (params?.limit) q.append('limit', String(params.limit));
		if (params?.status) q.append('status', params.status);
		if (params?.buildingId) q.append('buildingId', params.buildingId);
		if (params?.roomId) q.append('roomId', params.roomId);

		const endpoint = `/api/booking-requests/received${q.toString() ? `?${q.toString()}` : ''}`;
		const response = await apiCall<BookingRequestListResponse>(endpoint, { method: 'GET' }, token);
		return { success: true, data: response };
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể tải yêu cầu đặt phòng đã nhận'),
		};
	}
};

export const getMyBookingRequests = async (
	params?: {
		page?: number;
		limit?: number;
		status?: string;
	},
	token?: string,
): Promise<ApiResult<BookingRequestListResponse>> => {
	try {
		const q = new URLSearchParams();
		if (params?.page) q.append('page', String(params.page));
		if (params?.limit) q.append('limit', String(params.limit));
		if (params?.status) q.append('status', params.status);

		const endpoint = `/api/booking-requests/my-requests${q.toString() ? `?${q.toString()}` : ''}`;
		const response = await apiCall<BookingRequestListResponse>(endpoint, { method: 'GET' }, token);
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
	token?: string,
): Promise<ApiResult<{ data: BookingRequest }>> => {
	try {
		const response = await apiCall<{ data: BookingRequest }>(
			`/api/booking-requests/${id}`,
			{
				method: 'GET',
			},
			token,
		);
		return { success: true, data: normalizeEntityResponse<BookingRequest>(response) };
	} catch (error) {
		return { success: false, error: extractErrorMessage(error, 'Không thể tải yêu cầu đặt phòng') };
	}
};

export const updateBookingRequestAsOwner = async (
	id: string,
	data: UpdateBookingRequestRequest,
	token?: string,
): Promise<ApiResult<{ message: string }>> => {
	try {
		const response = await apiCall<{ message: string }>(
			`/api/booking-requests/${id}`,
			{
				method: 'PATCH',
				data,
			},
			token,
		);
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
	token?: string,
): Promise<ApiResult<{ message: string }>> => {
	try {
		const response = await apiCall<{ message: string }>(
			`/api/booking-requests/${id}/cancel`,
			{
				method: 'PATCH',
				data,
			},
			token,
		);
		return { success: true, data: response };
	} catch (error) {
		return { success: false, error: extractErrorMessage(error, 'Không thể hủy yêu cầu đặt phòng') };
	}
};

export const getMyBookingRequestsMe = async (
	params?: {
		page?: number;
		limit?: number;
		status?: string;
		buildingId?: string;
		roomId?: string;
	},
	token?: string,
): Promise<ApiResult<BookingRequestListResponse>> => {
	try {
		const q = new URLSearchParams();
		if (params?.page) q.append('page', String(params.page));
		if (params?.limit) q.append('limit', String(params.limit));
		if (params?.status) q.append('status', params.status);
		if (params?.buildingId) q.append('buildingId', params.buildingId);
		if (params?.roomId) q.append('roomId', params.roomId);

		const endpoint = `/api/booking-requests/me${q.toString() ? `?${q.toString()}` : ''}`;
		const response = await apiCall<BookingRequestListResponse>(endpoint, { method: 'GET' }, token);
		return { success: true, data: response };
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể tải danh sách yêu cầu đặt phòng của tôi'),
		};
	}
};

export const confirmBookingRequest = async (
	id: string,
	data: ConfirmBookingRequestRequest,
	token?: string,
): Promise<ApiResult<{ data: BookingRequest; rental?: { id: string } }>> => {
	try {
		const response = await apiCall<{ data: BookingRequest; rental?: { id: string } }>(
			`/api/booking-requests/${id}/confirm`,
			{
				method: 'POST',
				data,
			},
			token,
		);
		return { success: true, data: response };
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể xác nhận yêu cầu đặt phòng'),
		};
	}
};

/**
 * @deprecated This function is for the old flow where landlord approve auto-creates rental + contract.
 * New flow: Landlord approve → Tenant confirm → Auto create rental (via /confirm endpoint)
 * Keep this for backward compatibility or migration period.
 */
export const approveBookingRequestAndCreateRental = async (
	bookingRequestId: string,
	ownerNotes?: string,
	token?: string,
): Promise<ApiResult<{ rentalId: string; contractId: string }>> => {
	try {
		// First, get the booking request details
		const bookingRequestResult = await getBookingRequestById(bookingRequestId, token);
		if (!bookingRequestResult.success) {
			return { success: false, error: bookingRequestResult.error };
		}

		const bookingRequest = bookingRequestResult.data.data;

		// Step 1: Approve the booking request
		const approveResult = await updateBookingRequestAsOwner(
			bookingRequestId,
			{
				status: 'approved',
				ownerNotes,
			},
			token,
		);

		if (!approveResult.success) {
			return { success: false, error: approveResult.error };
		}

		// Step 2: Create rental from booking request
		if (!bookingRequest.room) {
			return { success: false, error: 'Room information is missing from booking request' };
		}

		if (!bookingRequest.tenant) {
			return { success: false, error: 'Tenant information is missing from booking request' };
		}

		const createRentalResult = await apiCall<{ data: { id: string } }>(
			'/api/rentals',
			{
				method: 'POST',
				data: {
					roomId: bookingRequest.room.id,
					tenantId: bookingRequest.tenant.id,
					startDate: bookingRequest.moveInDate,
					endDate: bookingRequest.moveOutDate,
					monthlyRent: bookingRequest.monthlyRent ? parseFloat(bookingRequest.monthlyRent) : 0,
					depositAmount: bookingRequest.depositAmount
						? parseFloat(bookingRequest.depositAmount)
						: 0,
					notes: bookingRequest.messageToOwner,
				},
			},
			token,
		);

		if (!createRentalResult.data?.id) {
			return { success: false, error: 'Không thể tạo hợp đồng thuê' };
		}

		const rentalId = createRentalResult.data.id;

		// Step 3: Auto-generate contract from rental
		const contractResult = await apiCall<{ data: { id: string } }>(
			`/api/contracts/auto-generate/${rentalId}`,
			{
				method: 'POST',
			},
			token,
		);

		if (!contractResult.data?.id) {
			return { success: false, error: 'Không thể tạo hợp đồng' };
		}

		const contractId = contractResult.data.id;

		return {
			success: true,
			data: {
				rentalId,
				contractId,
			},
		};
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể hoàn thành quy trình chấp nhận yêu cầu'),
		};
	}
};
