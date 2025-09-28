'use server';

import { AxiosError } from 'axios';
import { cookies } from 'next/headers';
import { createServerApiCall } from '@/lib/api-client';
import type {
	CreateRentalRequest,
	RenewRentalRequest,
	Rental,
	RentalListResponse,
	TerminateRentalRequest,
	UpdateRentalRequest,
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
				return 'Không tìm thấy hợp đồng thuê';
			case 409:
				return 'Trạng thái hợp đồng thuê không hợp lệ';
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

// Create rental (Landlord only)
export const createRental = async (
	data: CreateRentalRequest,
): Promise<ApiResult<{ data: Rental }>> => {
	try {
		const response = await apiCall<{ data: Rental }>('/api/rentals', {
			method: 'POST',
			data,
		});
		return { success: true, data: normalizeEntityResponse<Rental>(response) };
	} catch (error) {
		return { success: false, error: extractErrorMessage(error, 'Không thể tạo hợp đồng thuê') };
	}
};

// Get rentals based on user role
export const getMyRentals = async (params?: {
	page?: number;
	limit?: number;
	status?: string;
}): Promise<ApiResult<RentalListResponse>> => {
	try {
		const q = new URLSearchParams();
		if (params?.page) q.append('page', String(params.page));
		if (params?.limit) q.append('limit', String(params.limit));
		if (params?.status) q.append('status', params.status);

		const endpoint = `/api/rentals${q.toString() ? `?${q.toString()}` : ''}`;
		const response = await apiCall<RentalListResponse>(endpoint, { method: 'GET' });
		return { success: true, data: response };
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể tải danh sách hợp đồng thuê'),
		};
	}
};

// Get landlord rentals
export const getLandlordRentals = async (params?: {
	page?: number;
	limit?: number;
}): Promise<ApiResult<RentalListResponse>> => {
	try {
		const q = new URLSearchParams();
		if (params?.page) q.append('page', String(params.page));
		if (params?.limit) q.append('limit', String(params.limit));

		const endpoint = `/api/rentals/as-landlord${q.toString() ? `?${q.toString()}` : ''}`;
		const response = await apiCall<RentalListResponse>(endpoint, { method: 'GET' });
		return { success: true, data: response };
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể tải hợp đồng thuê của chủ nhà'),
		};
	}
};

// Get tenant rentals
export const getTenantRentals = async (params?: {
	page?: number;
	limit?: number;
}): Promise<ApiResult<RentalListResponse>> => {
	try {
		const q = new URLSearchParams();
		if (params?.page) q.append('page', String(params.page));
		if (params?.limit) q.append('limit', String(params.limit));

		const endpoint = `/api/rentals/as-tenant${q.toString() ? `?${q.toString()}` : ''}`;
		const response = await apiCall<RentalListResponse>(endpoint, { method: 'GET' });
		return { success: true, data: response };
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể tải hợp đồng thuê của người thuê'),
		};
	}
};

// Get rental details by ID
export const getRentalById = async (id: string): Promise<ApiResult<{ data: Rental }>> => {
	try {
		const response = await apiCall<{ data: Rental }>(`/api/rentals/${id}`, {
			method: 'GET',
		});
		return { success: true, data: normalizeEntityResponse<Rental>(response) };
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể tải chi tiết hợp đồng thuê'),
		};
	}
};

// Update rental (Landlord only)
export const updateRental = async (
	id: string,
	data: UpdateRentalRequest,
): Promise<ApiResult<{ data: Rental }>> => {
	try {
		const response = await apiCall<{ data: Rental }>(`/api/rentals/${id}`, {
			method: 'PATCH',
			data,
		});
		return { success: true, data: normalizeEntityResponse<Rental>(response) };
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể cập nhật hợp đồng thuê'),
		};
	}
};

// Terminate rental
export const terminateRental = async (
	id: string,
	data: TerminateRentalRequest,
): Promise<ApiResult<{ data: Rental }>> => {
	try {
		const response = await apiCall<{ data: Rental }>(`/api/rentals/${id}/terminate`, {
			method: 'PATCH',
			data,
		});
		return { success: true, data: normalizeEntityResponse<Rental>(response) };
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể chấm dứt hợp đồng thuê'),
		};
	}
};

// Renew rental
export const renewRental = async (
	id: string,
	data: RenewRentalRequest,
): Promise<ApiResult<{ data: Rental }>> => {
	try {
		const response = await apiCall<{ data: Rental }>(`/api/rentals/${id}/renew`, {
			method: 'POST',
			data,
		});
		return { success: true, data: normalizeEntityResponse<Rental>(response) };
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể gia hạn hợp đồng thuê'),
		};
	}
};
