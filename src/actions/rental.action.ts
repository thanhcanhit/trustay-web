//'use server';

import { createServerApiCall } from '@/lib/api-client';
import type {
	CreateRentalRequest,
	PaginatedRentalResponse,
	RenewRentalRequest,
	Rental,
	TerminateRentalRequest,
	UpdateRentalRequest,
} from '@/types/rental.types';
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

// Helper to convert Decimal-like objects {s, e, d} to string
const decimalToString = (val: unknown): string => {
	if (val && typeof val === 'object' && 'd' in val) {
		const decimal = val as { s: number; e: number; d: number[] };
		const sign = decimal.s < 0 ? '-' : '';
		const digits = decimal.d.join('');
		const exp = decimal.e;
		if (exp >= 0) {
			const intPart = digits.slice(0, exp + 1) || '0';
			const decPart = digits.slice(exp + 1);
			return sign + intPart + (decPart ? '.' + decPart : '');
		}
		return sign + '0.' + '0'.repeat(-exp - 1) + digits;
	}
	return String(val);
};

const normalizeRental = (rental: Rental): Rental => ({
	...rental,
	monthlyRent: decimalToString(rental.monthlyRent),
	depositPaid: decimalToString(rental.depositPaid),
	roomInstance: rental.roomInstance
		? {
				...rental.roomInstance,
				room: rental.roomInstance.room
					? {
							...rental.roomInstance.room,
							areaSqm: decimalToString(rental.roomInstance.room.areaSqm),
						}
					: rental.roomInstance.room,
			}
		: rental.roomInstance,
});

// Create rental (Landlord only)
export const createRental = async (
	data: CreateRentalRequest,
	token?: string,
): Promise<ApiResult<{ data: Rental }>> => {
	try {
		const response = await apiCall<{ data: Rental }>(
			'api/rentals',
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
): Promise<ApiResult<PaginatedRentalResponse>> => {
	try {
		const q = new URLSearchParams();
		if (params?.page) q.append('page', String(params.page));
		if (params?.limit) q.append('limit', String(params.limit));
		if (params?.status) q.append('status', params.status);

		const endpoint = `/api/rentals${q.toString() ? `?${q.toString()}` : ''}`;
		const response = await apiCall<PaginatedRentalResponse>(endpoint, { method: 'GET' }, token);
		return {
			success: true,
			data: {
				...response,
				data: response.data.map(normalizeRental),
			},
		};
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
): Promise<ApiResult<PaginatedRentalResponse>> => {
	try {
		const q = new URLSearchParams();
		if (params?.page) q.append('page', String(params.page));
		if (params?.limit) q.append('limit', String(params.limit));
		if (params?.status) q.append('status', params.status);

		const endpoint = `/api/rentals/owner${q.toString() ? `?${q.toString()}` : ''}`;
		const response = await apiCall<PaginatedRentalResponse>(endpoint, { method: 'GET' }, token);
		return {
			success: true,
			data: {
				...response,
				data: response.data.map(normalizeRental),
			},
		};
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
): Promise<ApiResult<PaginatedRentalResponse>> => {
	try {
		const q = new URLSearchParams();
		if (params?.page) q.append('page', String(params.page));
		if (params?.limit) q.append('limit', String(params.limit));
		if (params?.status) q.append('status', params.status);

		const endpoint = `/api/rentals/my-rentals${q.toString() ? `?${q.toString()}` : ''}`;
		const response = await apiCall<PaginatedRentalResponse>(endpoint, { method: 'GET' }, token);
		return {
			success: true,
			data: {
				...response,
				data: response.data.map(normalizeRental),
			},
		};
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
		const normalized = normalizeEntityResponse<Rental>(response);
		return { success: true, data: { data: normalizeRental(normalized.data) } };
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
				method: 'PUT',
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
				method: 'PUT',
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
				method: 'PUT',
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

// Delete rental (remove member from rental)
export const deleteRental = async (
	id: string,
	token?: string,
): Promise<ApiResult<{ message: string }>> => {
	try {
		const response = await apiCall<{ message: string }>(
			`/api/rentals/${id}`,
			{
				method: 'DELETE',
			},
			token,
		);
		return { success: true, data: response };
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể xóa thành viên khỏi hợp đồng'),
		};
	}
};
