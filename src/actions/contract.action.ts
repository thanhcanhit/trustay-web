'use server';

import { createServerApiCall } from '@/lib/api-client';
import type {
	Contract,
	ContractListResponse,
	CreateContractAmendmentRequest,
	UpdateContractRequest,
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

// Auto-generate contract from rental (Landlord only)
export const autoGenerateContract = async (
	rentalId: string,
	token?: string,
): Promise<ApiResult<{ data: Contract }>> => {
	try {
		const response = await apiCall<{ data: Contract }>(
			`/api/contracts/auto-generate/${rentalId}`,
			{
				method: 'POST',
			},
			token,
		);
		return { success: true, data: normalizeEntityResponse<Contract>(response) };
	} catch (error) {
		return { success: false, error: extractErrorMessage(error, 'Không thể tạo hợp đồng tự động') };
	}
};

// Get contracts based on user role
export const getMyContracts = async (
	params?: {
		page?: number;
		limit?: number;
		status?: string;
	},
	token?: string,
): Promise<ApiResult<ContractListResponse>> => {
	try {
		const q = new URLSearchParams();
		if (params?.page) q.append('page', String(params.page));
		if (params?.limit) q.append('limit', String(params.limit));
		if (params?.status) q.append('status', params.status);

		const endpoint = `/api/contracts${q.toString() ? `?${q.toString()}` : ''}`;
		const response = await apiCall<ContractListResponse>(endpoint, { method: 'GET' }, token);
		return { success: true, data: response };
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể tải danh sách hợp đồng'),
		};
	}
};

// Get landlord contracts
export const getLandlordContracts = async (
	params?: {
		page?: number;
		limit?: number;
	},
	token?: string,
): Promise<ApiResult<ContractListResponse>> => {
	try {
		const q = new URLSearchParams();
		if (params?.page) q.append('page', String(params.page));
		if (params?.limit) q.append('limit', String(params.limit));

		const endpoint = `/api/contracts/my-contracts${q.toString() ? `?${q.toString()}` : ''}`;
		const response = await apiCall<ContractListResponse>(endpoint, { method: 'GET' }, token);
		return { success: true, data: response };
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể tải hợp đồng cho thuê'),
		};
	}
};

// Get tenant contracts
export const getTenantContracts = async (
	params?: {
		page?: number;
		limit?: number;
	},
	token?: string,
): Promise<ApiResult<ContractListResponse>> => {
	try {
		const q = new URLSearchParams();
		if (params?.page) q.append('page', String(params.page));
		if (params?.limit) q.append('limit', String(params.limit));

		const endpoint = `/api/contracts/as-tenant${q.toString() ? `?${q.toString()}` : ''}`;
		const response = await apiCall<ContractListResponse>(endpoint, { method: 'GET' }, token);
		return { success: true, data: response };
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể tải hợp đồng thuê'),
		};
	}
};

// Get contract details by ID
export const getContractById = async (
	id: string,
	token?: string,
): Promise<ApiResult<{ data: Contract }>> => {
	try {
		const response = await apiCall<{ data: Contract }>(
			`/api/contracts/${id}`,
			{
				method: 'GET',
			},
			token,
		);
		return { success: true, data: normalizeEntityResponse<Contract>(response) };
	} catch (error) {
		return { success: false, error: extractErrorMessage(error, 'Không thể tải chi tiết hợp đồng') };
	}
};

// Update contract (Landlord only)
export const updateContract = async (
	id: string,
	data: UpdateContractRequest,
	token?: string,
): Promise<ApiResult<{ data: Contract }>> => {
	try {
		const response = await apiCall<{ data: Contract }>(
			`/api/contracts/${id}`,
			{
				method: 'PUT',
				data,
			},
			token,
		);
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
	token?: string,
): Promise<ApiResult<{ message: string }>> => {
	try {
		const response = await apiCall<{ message: string }>(
			`/api/contracts/${contractId}/amendments`,
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
			error: extractErrorMessage(error, 'Không thể tạo phụ lục hợp đồng'),
		};
	}
};

// Download contract as PDF
export const downloadContractPDF = async (id: string, token?: string): Promise<ApiResult<Blob>> => {
	try {
		const response = await apiCall<Blob>(
			`/api/contracts/${id}/download`,
			{
				method: 'GET',
				responseType: 'blob',
			},
			token,
		);
		return { success: true, data: response };
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể tải xuống hợp đồng'),
		};
	}
};

// Sign contract (Landlord or Tenant)
export const signContract = async (
	contractId: string,
	signatureData: string,
	signatureMethod: 'canvas' | 'upload' = 'canvas',
	token?: string,
): Promise<ApiResult<{ data: Contract }>> => {
	try {
		// Get device info for signature tracking
		const deviceInfo = `${navigator.userAgent} - ${window.screen.width}x${window.screen.height}`;

		const response = await apiCall<{ data: Contract }>(
			`/api/contracts/${contractId}/sign`,
			{
				method: 'POST',
				data: {
					signatureData,
					signatureMethod,
					deviceInfo,
				},
			},
			token,
		);
		return { success: true, data: normalizeEntityResponse<Contract>(response) };
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể ký hợp đồng'),
		};
	}
};

// Request signatures (Send contract for signing)
export const requestSignatures = async (
	contractId: string,
	signatureDeadline?: string,
	token?: string,
): Promise<ApiResult<{ data: Contract }>> => {
	try {
		const response = await apiCall<{ data: Contract }>(
			`/api/contracts/${contractId}/request-signatures`,
			{
				method: 'POST',
				data: {
					signatureDeadline,
				},
			},
			token,
		);
		return { success: true, data: normalizeEntityResponse<Contract>(response) };
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể gửi yêu cầu ký hợp đồng'),
		};
	}
};

// Verify signature
export const verifySignature = async (
	contractId: string,
	signatureId: string,
	token?: string,
): Promise<ApiResult<{ isValid: boolean; details: string }>> => {
	try {
		const response = await apiCall<{ isValid: boolean; details: string }>(
			`/api/contracts/${contractId}/signatures/${signatureId}/verify`,
			{
				method: 'GET',
			},
			token,
		);
		return { success: true, data: response };
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể xác thực chữ ký'),
		};
	}
};
