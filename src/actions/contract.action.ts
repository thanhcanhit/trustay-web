'use server';

import { createServerApiCall } from '@/lib/api-client';
import type { Contract, PaginatedContractResponse } from '@/types/contract.types';
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

// Helper function to normalize contract data from backend
const normalizeContract = (contract: Record<string, unknown>): Contract => {
	// Split fullName into firstName and lastName
	const splitName = (fullName: string) => {
		const parts = fullName?.trim().split(' ') || [''];
		const lastName = parts.pop() || '';
		const firstName = parts.join(' ') || lastName;
		return { firstName, lastName };
	};

	const landlord = contract.landlord as Record<string, unknown> | undefined;
	const tenant = contract.tenant as Record<string, unknown> | undefined;
	const room = contract.room as Record<string, unknown> | undefined;
	const contractData = contract.contractData as Record<string, unknown> | undefined;

	return {
		...contract,
		// Map landlord data
		landlord: landlord
			? {
					...landlord,
					...splitName(landlord.fullName as string),
					id: landlord.id as string,
					fullName: landlord.fullName as string,
					email: landlord.email as string,
					phone: landlord.phone as string | null | undefined,
				}
			: undefined,
		// Map tenant data
		tenant: tenant
			? {
					...tenant,
					...splitName(tenant.fullName as string),
					id: tenant.id as string,
					fullName: tenant.fullName as string,
					email: tenant.email as string,
					phone: tenant.phone as string | null | undefined,
				}
			: undefined,
		// Map room data
		room: room
			? {
					...room,
					name: (room.roomName as string) || (room.name as string),
					roomNumber: room.roomNumber as string,
					roomName: room.roomName as string,
					roomType: room.roomType as string,
					areaSqm: room.areaSqm as number,
					buildingName: room.buildingName as string,
				}
			: undefined,
		// Map contract financial data from contractData
		monthlyRent: (contractData?.monthlyRent as number) || (contract.monthlyRent as number),
		depositAmount: (contractData?.depositAmount as number) || (contract.depositAmount as number),
		landlordId: (landlord?.id as string) || (contract.landlordId as string),
		tenantId: (tenant?.id as string) || (contract.tenantId as string),
	} as Contract;
};

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
	additionalContractData?: string | object,
	token?: string,
): Promise<ApiResult<{ data: Contract }>> => {
	try {
		// Handle both string (legacy) and object (new structured data)
		let requestData = {};

		if (additionalContractData) {
			if (typeof additionalContractData === 'string') {
				// Try to parse as JSON first, if it fails treat as plain text terms
				try {
					requestData = JSON.parse(additionalContractData);
				} catch {
					requestData = { additionalTerms: additionalContractData };
				}
			} else {
				requestData = additionalContractData;
			}
		}

		const response = await apiCall<{ data: Contract }>(
			`/api/contracts/from-rental/${rentalId}`,
			{
				method: 'POST',
				data: requestData,
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
): Promise<ApiResult<PaginatedContractResponse>> => {
	try {
		const q = new URLSearchParams();
		if (params?.page) q.append('page', String(params.page));
		if (params?.limit) q.append('limit', String(params.limit));
		if (params?.status) q.append('status', params.status);

		const endpoint = `/api/contracts${q.toString() ? `?${q.toString()}` : ''}`;
		const response = await apiCall<Contract[] | PaginatedContractResponse>(
			endpoint,
			{ method: 'GET' },
			token,
		);

		// Backend trả về array trực tiếp, cần wrap lại
		if (Array.isArray(response)) {
			return {
				success: true,
				data: {
					data: (response as unknown as Record<string, unknown>[]).map(normalizeContract),
					meta: {
						total: response.length,
						page: params?.page || 1,
						limit: params?.limit || 10,
						totalPages: Math.ceil(response.length / (params?.limit || 10)),
					},
				},
			};
		}
		return { success: true, data: response as PaginatedContractResponse };
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
		status?: string;
	},
	token?: string,
): Promise<ApiResult<PaginatedContractResponse>> => {
	try {
		const q = new URLSearchParams();
		if (params?.page) q.append('page', String(params.page));
		if (params?.limit) q.append('limit', String(params.limit));
		if (params?.status) q.append('status', params.status);

		const endpoint = `/api/contracts${q.toString() ? `?${q.toString()}` : ''}`;
		const response = await apiCall<Contract[] | PaginatedContractResponse>(
			endpoint,
			{ method: 'GET' },
			token,
		);

		// Backend trả về array trực tiếp, cần wrap lại
		if (Array.isArray(response)) {
			return {
				success: true,
				data: {
					data: (response as unknown as Record<string, unknown>[]).map(normalizeContract),
					meta: {
						total: response.length,
						page: params?.page || 1,
						limit: params?.limit || 10,
						totalPages: Math.ceil(response.length / (params?.limit || 10)),
					},
				},
			};
		}
		return { success: true, data: response as PaginatedContractResponse };
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
		status?: string;
	},
	token?: string,
): Promise<ApiResult<PaginatedContractResponse>> => {
	try {
		const q = new URLSearchParams();
		if (params?.page) q.append('page', String(params.page));
		if (params?.limit) q.append('limit', String(params.limit));
		if (params?.status) q.append('status', params.status);

		const endpoint = `/api/contracts${q.toString() ? `?${q.toString()}` : ''}`;
		const response = await apiCall<Contract[] | PaginatedContractResponse>(
			endpoint,
			{ method: 'GET' },
			token,
		);

		// Backend trả về array trực tiếp, cần wrap lại
		if (Array.isArray(response)) {
			return {
				success: true,
				data: {
					data: (response as unknown as Record<string, unknown>[]).map(normalizeContract),
					meta: {
						total: response.length,
						page: params?.page || 1,
						limit: params?.limit || 10,
						totalPages: Math.ceil(response.length / (params?.limit || 10)),
					},
				},
			};
		}
		return { success: true, data: response as PaginatedContractResponse };
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

// Download contract as PDF (returns base64 to work with Server Actions)
export const downloadContractPDF = async (
	id: string,
	token?: string,
): Promise<ApiResult<{ base64: string; contentType: string }>> => {
	try {
		// Fetch as arraybuffer to get binary data
		const response = await apiCall<ArrayBuffer>(
			`/api/contracts/${id}/pdf`,
			{
				method: 'GET',
				responseType: 'arraybuffer',
			},
			token,
		);

		// Convert ArrayBuffer to base64
		const buffer = Buffer.from(response);
		const base64 = buffer.toString('base64');

		return {
			success: true,
			data: {
				base64,
				contentType: 'application/pdf',
			},
		};
	} catch (error: unknown) {
		// Extract status code from axios error
		const status = (error as { response?: { status?: number } })?.response?.status;
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể tải xuống hợp đồng'),
			status,
		};
	}
};

// Request OTP for contract signing
export const requestSigningOTP = async (
	contractId: string,
	token?: string,
): Promise<ApiResult<{ message: string }>> => {
	try {
		const response = await apiCall<{ message: string }>(
			`/api/contracts/${contractId}/send-otp`,
			{
				method: 'POST',
			},
			token,
		);
		return { success: true, data: response };
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể gửi mã OTP'),
		};
	}
};

// Sign contract (Landlord or Tenant)
export const signContract = async (
	contractId: string,
	signatureData: string,
	otpCode?: string,
	token?: string,
): Promise<ApiResult<{ data: Contract }>> => {
	try {
		const response = await apiCall<{ data: Contract }>(
			`/api/contracts/${contractId}/sign`,
			{
				method: 'POST',
				data: {
					signatureImage: signatureData, // Backend expects 'signatureImage' not 'signatureData'
					otpCode: otpCode || '123456', // Mã OTP giả vì backend chưa có endpoint lấy OTP
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

// Create contract manually (not from rental)
export const createContract = async (
	data: {
		landlordId: string;
		tenantId: string;
		roomInstanceId: string;
		contractType: string;
		startDate: string;
		endDate: string;
		contractData: {
			monthlyRent: number;
			depositAmount: number;
			additionalTerms?: string;
			rules?: string[];
			amenities?: string[];
		};
	},
	token?: string,
): Promise<ApiResult<{ data: Contract }>> => {
	try {
		const response = await apiCall<{ data: Contract }>(
			'/contracts',
			{
				method: 'POST',
				data,
			},
			token,
		);
		return { success: true, data: normalizeEntityResponse<Contract>(response) };
	} catch (error) {
		return { success: false, error: extractErrorMessage(error, 'Không thể tạo hợp đồng') };
	}
};

// Get contract status
export const getContractStatus = async (
	id: string,
	token?: string,
): Promise<ApiResult<{ status: string; details: Record<string, unknown> }>> => {
	try {
		const response = await apiCall<{ status: string; details: Record<string, unknown> }>(
			`/api/contracts/${id}/status`,
			{
				method: 'GET',
			},
			token,
		);
		return { success: true, data: response };
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể lấy trạng thái hợp đồng'),
		};
	}
};

// Generate contract PDF
export const generateContractPDF = async (
	contractId: string,
	options?: {
		includeSignatures?: boolean;
		format?: string;
		printBackground?: boolean;
	},
	token?: string,
): Promise<
	ApiResult<{ pdfUrl?: string; downloadUrl?: string; hash?: string; message: string }>
> => {
	try {
		const response = await apiCall<{
			pdfUrl?: string;
			downloadUrl?: string;
			hash?: string;
			message: string;
		}>(
			`/api/contracts/${contractId}/pdf`,
			{
				method: 'POST',
				data: {
					includeSignatures: options?.includeSignatures ?? true,
					options: {
						format: options?.format || 'A4',
						printBackground: options?.printBackground ?? true,
					},
				},
			},
			token,
		);
		return { success: true, data: response };
	} catch (error) {
		return { success: false, error: extractErrorMessage(error, 'Không thể tạo PDF hợp đồng') };
	}
};

// Get contract preview (PNG image as base64 string)
export const getContractPreview = async (
	contractId: string,
	token?: string,
): Promise<ApiResult<{ base64: string; contentType: string }>> => {
	try {
		// Fetch as arraybuffer to get binary data
		const response = await apiCall<ArrayBuffer>(
			`/api/contracts/${contractId}/pdf/preview`,
			{
				method: 'GET',
				responseType: 'arraybuffer',
			},
			token,
		);

		// Convert ArrayBuffer to base64
		const buffer = Buffer.from(response);
		const base64 = buffer.toString('base64');

		return {
			success: true,
			data: {
				base64,
				contentType: 'image/png',
			},
		};
	} catch (error: unknown) {
		// Extract status code from axios error
		const status = (error as { response?: { status?: number } })?.response?.status;
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể lấy bản xem trước hợp đồng'),
			status,
		};
	}
};

// Verify PDF integrity
export const verifyPDFIntegrity = async (
	contractId: string,
	token?: string,
): Promise<ApiResult<{ isValid: boolean; hash: string; details: string }>> => {
	try {
		const response = await apiCall<{ isValid: boolean; hash: string; details: string }>(
			`/api/contracts/${contractId}/pdf/verify`,
			{
				method: 'GET',
			},
			token,
		);
		return { success: true, data: response };
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể xác thực tính toàn vẹn PDF'),
		};
	}
};

// Activate contract
export const activateContract = async (
	contractId: string,
	token?: string,
): Promise<ApiResult<{ data: Contract }>> => {
	try {
		const response = await apiCall<{ data: Contract }>(
			`/api/contracts/${contractId}/activate`,
			{
				method: 'POST',
			},
			token,
		);
		return { success: true, data: normalizeEntityResponse<Contract>(response) };
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể kích hoạt hợp đồng'),
		};
	}
};
