'use server';

import { createServerApiCall } from '@/lib/api-client';
import type {
	CreateRentalRequest,
	RenewRentalRequest,
	Rental,
	RentalListResponse,
	TerminateRentalRequest,
	UpdateRentalRequest,
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

// Create rental (Landlord only)
export const createRental = async (
	data: CreateRentalRequest,
	token?: string,
): Promise<ApiResult<{ data: Rental }>> => {
	try {
		const response = await apiCall<{ data: Rental }>(
			'/api/rentals',
			{
				method: 'POST',
				data,
			},
			token,
		);
		return { success: true, data: normalizeEntityResponse<Rental>(response) };
	} catch (error) {
		return { success: false, error: extractErrorMessage(error, 'Không thể tạo hợp đồng thuê') };
	}
};

// Get rentals based on user role
export const getMyRentals = async (
	params?: {
		page?: number;
		limit?: number;
		status?: string;
	},
	token?: string,
): Promise<ApiResult<RentalListResponse>> => {
	try {
		const q = new URLSearchParams();
		if (params?.page) q.append('page', String(params.page));
		if (params?.limit) q.append('limit', String(params.limit));
		if (params?.status) q.append('status', params.status);

		const endpoint = `/api/rentals${q.toString() ? `?${q.toString()}` : ''}`;
		const response = await apiCall<RentalListResponse>(endpoint, { method: 'GET' }, token);
		return { success: true, data: response };
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể tải danh sách hợp đồng thuê'),
		};
	}
};

// Get landlord rentals
export const getLandlordRentals = async (
	params?: {
		page?: number;
		limit?: number;
		status?: string;
	},
	token?: string,
): Promise<ApiResult<RentalListResponse>> => {
	try {
		const q = new URLSearchParams();
		if (params?.page) q.append('page', String(params.page));
		if (params?.limit) q.append('limit', String(params.limit));
		if (params?.status) q.append('status', params.status);

		const endpoint = `/api/rentals/owner${q.toString() ? `?${q.toString()}` : ''}`;
		const response = await apiCall<RentalListResponse>(endpoint, { method: 'GET' }, token);
		return { success: true, data: response };
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể tải hợp đồng thuê của chủ nhà'),
		};
	}
};

// Get tenant rentals
export const getTenantRentals = async (
	params?: {
		page?: number;
		limit?: number;
		status?: string;
	},
	token?: string,
): Promise<ApiResult<RentalListResponse>> => {
	try {
		const q = new URLSearchParams();
		if (params?.page) q.append('page', String(params.page));
		if (params?.limit) q.append('limit', String(params.limit));
		if (params?.status) q.append('status', params.status);

		const endpoint = `/api/rentals/my-rentals${q.toString() ? `?${q.toString()}` : ''}`;
		const response = await apiCall<RentalListResponse>(endpoint, { method: 'GET' }, token);
		return { success: true, data: response };
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể tải hợp đồng thuê của người thuê'),
		};
	}
};

// Get rental details by ID
export const getRentalById = async (
	id: string,
	token?: string,
): Promise<ApiResult<{ data: Rental }>> => {
	try {
		const response = await apiCall<{ data: Rental }>(
			`/api/rentals/${id}`,
			{
				method: 'GET',
			},
			token,
		);
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
	token?: string,
): Promise<ApiResult<{ data: Rental }>> => {
	try {
		const response = await apiCall<{ data: Rental }>(
			`/api/rentals/${id}`,
			{
				method: 'PATCH',
				data,
			},
			token,
		);
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
	token?: string,
): Promise<ApiResult<{ data: Rental }>> => {
	try {
		const response = await apiCall<{ data: Rental }>(
			`/api/rentals/${id}/terminate`,
			{
				method: 'PATCH',
				data,
			},
			token,
		);
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
	token?: string,
): Promise<ApiResult<{ data: Rental }>> => {
	try {
		const response = await apiCall<{ data: Rental }>(
			`/api/rentals/${id}/renew`,
			{
				method: 'POST',
				data,
			},
			token,
		);
		return { success: true, data: normalizeEntityResponse<Rental>(response) };
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể gia hạn hợp đồng thuê'),
		};
	}
};
