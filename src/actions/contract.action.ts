'use server';

import { AxiosError } from 'axios';
import { cookies } from 'next/headers';
import { createServerApiCall } from '@/lib/api-client';
import type {
	Contract,
	ContractListResponse,
	CreateContractAmendmentRequest,
	UpdateContractRequest,
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
				return 'Không tìm thấy hợp đồng';
			case 409:
				return 'Trạng thái hợp đồng không hợp lệ';
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

// Auto-generate contract from rental (Landlord only)
export const autoGenerateContract = async (
	rentalId: string,
): Promise<ApiResult<{ data: Contract }>> => {
	try {
		const response = await apiCall<{ data: Contract }>(`/api/contracts/auto-generate/${rentalId}`, {
			method: 'POST',
		});
		return { success: true, data: normalizeEntityResponse<Contract>(response) };
	} catch (error) {
		return { success: false, error: extractErrorMessage(error, 'Không thể tạo hợp đồng tự động') };
	}
};

// Get contracts based on user role
export const getMyContracts = async (params?: {
	page?: number;
	limit?: number;
	status?: string;
}): Promise<ApiResult<ContractListResponse>> => {
	try {
		const q = new URLSearchParams();
		if (params?.page) q.append('page', String(params.page));
		if (params?.limit) q.append('limit', String(params.limit));
		if (params?.status) q.append('status', params.status);

		const endpoint = `/api/contracts${q.toString() ? `?${q.toString()}` : ''}`;
		const response = await apiCall<ContractListResponse>(endpoint, { method: 'GET' });
		return { success: true, data: response };
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể tải danh sách hợp đồng'),
		};
	}
};

// Get landlord contracts
export const getLandlordContracts = async (params?: {
	page?: number;
	limit?: number;
}): Promise<ApiResult<ContractListResponse>> => {
	try {
		const q = new URLSearchParams();
		if (params?.page) q.append('page', String(params.page));
		if (params?.limit) q.append('limit', String(params.limit));

		const endpoint = `/api/contracts/my-contracts${q.toString() ? `?${q.toString()}` : ''}`;
		const response = await apiCall<ContractListResponse>(endpoint, { method: 'GET' });
		return { success: true, data: response };
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể tải hợp đồng cho thuê'),
		};
	}
};

// Get tenant contracts
export const getTenantContracts = async (params?: {
	page?: number;
	limit?: number;
}): Promise<ApiResult<ContractListResponse>> => {
	try {
		const q = new URLSearchParams();
		if (params?.page) q.append('page', String(params.page));
		if (params?.limit) q.append('limit', String(params.limit));

		const endpoint = `/api/contracts/as-tenant${q.toString() ? `?${q.toString()}` : ''}`;
		const response = await apiCall<ContractListResponse>(endpoint, { method: 'GET' });
		return { success: true, data: response };
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể tải hợp đồng thuê'),
		};
	}
};

// Get contract details by ID
export const getContractById = async (id: string): Promise<ApiResult<{ data: Contract }>> => {
	try {
		const response = await apiCall<{ data: Contract }>(`/api/contracts/${id}`, {
			method: 'GET',
		});
		return { success: true, data: normalizeEntityResponse<Contract>(response) };
	} catch (error) {
		return { success: false, error: extractErrorMessage(error, 'Không thể tải chi tiết hợp đồng') };
	}
};

// Update contract (Landlord only)
export const updateContract = async (
	id: string,
	data: UpdateContractRequest,
): Promise<ApiResult<{ data: Contract }>> => {
	try {
		const response = await apiCall<{ data: Contract }>(`/api/contracts/${id}`, {
			method: 'PUT',
			data,
		});
		return { success: true, data: normalizeEntityResponse<Contract>(response) };
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể cập nhật hợp đồng'),
		};
	}
};

// Create contract amendment
export const createContractAmendment = async (
	contractId: string,
	data: CreateContractAmendmentRequest,
): Promise<ApiResult<{ message: string }>> => {
	try {
		const response = await apiCall<{ message: string }>(`/api/contracts/${contractId}/amendments`, {
			method: 'POST',
			data,
		});
		return { success: true, data: response };
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể tạo phụ lục hợp đồng'),
		};
	}
};

// Download contract as PDF
export const downloadContractPDF = async (id: string): Promise<ApiResult<Blob>> => {
	try {
		const response = await apiCall<Blob>(`/api/contracts/${id}/download`, {
			method: 'GET',
			responseType: 'blob',
		});
		return { success: true, data: response };
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể tải xuống hợp đồng'),
		};
	}
};
