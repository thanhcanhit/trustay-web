'use server';

import { createServerApiCall } from '@/lib/api-client';
import type {
	CreatePaymentReceiptRequest,
	CreatePaymentRequest,
	Payment,
	PaymentListResponse,
	PaymentStatistics,
	ProcessRefundRequest,
	UpdatePaymentRequest,
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

// Create payment
export const createPayment = async (
	data: CreatePaymentRequest,
	token?: string,
): Promise<ApiResult<{ data: Payment }>> => {
	try {
		const response = await apiCall<{ data: Payment }>(
			'/api/payments',
			{
				method: 'POST',
				data,
			},
			token,
		);
		return { success: true, data: normalizeEntityResponse<Payment>(response) };
	} catch (error) {
		return { success: false, error: extractErrorMessage(error, 'Không thể tạo thanh toán') };
	}
};

// Get payments list with pagination and filtering
export const getPayments = async (
	params?: {
		page?: number;
		limit?: number;
		status?: string;
		paymentType?: string;
		contractId?: string;
		rentalId?: string;
	},
	token?: string,
): Promise<ApiResult<PaymentListResponse>> => {
	try {
		const q = new URLSearchParams();
		if (params?.page) q.append('page', String(params.page));
		if (params?.limit) q.append('limit', String(params.limit));
		if (params?.status) q.append('status', params.status);
		if (params?.paymentType) q.append('paymentType', params.paymentType);
		if (params?.contractId) q.append('contractId', params.contractId);
		if (params?.rentalId) q.append('rentalId', params.rentalId);

		const endpoint = `/api/payments${q.toString() ? `?${q.toString()}` : ''}`;
		const response = await apiCall<PaymentListResponse>(endpoint, { method: 'GET' }, token);
		return { success: true, data: response };
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể tải danh sách thanh toán'),
		};
	}
};

// Get payment history with date filtering
export const getPaymentHistory = async (
	params?: {
		contractId?: string;
		rentalId?: string;
		startDate?: string;
		endDate?: string;
		page?: number;
		limit?: number;
	},
	token?: string,
): Promise<ApiResult<PaymentListResponse>> => {
	try {
		const q = new URLSearchParams();
		if (params?.contractId) q.append('contractId', params.contractId);
		if (params?.rentalId) q.append('rentalId', params.rentalId);
		if (params?.startDate) q.append('startDate', params.startDate);
		if (params?.endDate) q.append('endDate', params.endDate);
		if (params?.page) q.append('page', String(params.page));
		if (params?.limit) q.append('limit', String(params.limit));

		const endpoint = `/api/payments/history${q.toString() ? `?${q.toString()}` : ''}`;
		const response = await apiCall<PaymentListResponse>(endpoint, { method: 'GET' }, token);
		return { success: true, data: response };
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể tải lịch sử thanh toán'),
		};
	}
};

// Get payment details by ID
export const getPaymentById = async (
	id: string,
	token?: string,
): Promise<ApiResult<{ data: Payment }>> => {
	try {
		const response = await apiCall<{ data: Payment }>(
			`/api/payments/${id}`,
			{
				method: 'GET',
			},
			token,
		);
		return { success: true, data: normalizeEntityResponse<Payment>(response) };
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể tải chi tiết thanh toán'),
		};
	}
};

// Update payment
export const updatePayment = async (
	id: string,
	data: UpdatePaymentRequest,
	token?: string,
): Promise<ApiResult<{ data: Payment }>> => {
	try {
		const response = await apiCall<{ data: Payment }>(
			`/api/payments/${id}`,
			{
				method: 'PATCH',
				data,
			},
			token,
		);
		return { success: true, data: normalizeEntityResponse<Payment>(response) };
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể cập nhật thanh toán'),
		};
	}
};

// Record payment receipt (Landlord only)
export const createPaymentReceipt = async (
	paymentId: string,
	data: Omit<CreatePaymentReceiptRequest, 'paymentId'>,
	token?: string,
): Promise<ApiResult<{ message: string }>> => {
	try {
		const response = await apiCall<{ message: string }>(
			`/api/payments/${paymentId}/receipt`,
			{
				method: 'POST',
				data: { ...data, paymentId },
			},
			token,
		);
		return { success: true, data: response };
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể tạo biên lai thanh toán'),
		};
	}
};

// Process refund
export const processRefund = async (
	data: ProcessRefundRequest,
	token?: string,
): Promise<ApiResult<{ data: Payment }>> => {
	try {
		const response = await apiCall<{ data: Payment }>(
			'/api/payments/refund',
			{
				method: 'POST',
				data,
			},
			token,
		);
		return { success: true, data: normalizeEntityResponse<Payment>(response) };
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể xử lý hoàn tiền'),
		};
	}
};

// Get payment statistics
export const getPaymentStatistics = async (
	params?: {
		contractId?: string;
		rentalId?: string;
		year?: number;
		month?: number;
	},
	token?: string,
): Promise<ApiResult<PaymentStatistics>> => {
	try {
		const q = new URLSearchParams();
		if (params?.contractId) q.append('contractId', params.contractId);
		if (params?.rentalId) q.append('rentalId', params.rentalId);
		if (params?.year) q.append('year', String(params.year));
		if (params?.month) q.append('month', String(params.month));

		const endpoint = `/api/payments/stats${q.toString() ? `?${q.toString()}` : ''}`;
		const response = await apiCall<PaymentStatistics>(endpoint, { method: 'GET' }, token);
		return { success: true, data: response };
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể tải thống kê thanh toán'),
		};
	}
};

// Generate QR code for payment
export const generatePaymentQRCode = async (
	id: string,
	token?: string,
): Promise<ApiResult<{ qrCodeUrl: string }>> => {
	try {
		const response = await apiCall<{ qrCodeUrl: string }>(
			`/api/payments/${id}/qr-code`,
			{
				method: 'GET',
			},
			token,
		);
		return { success: true, data: response };
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể tạo mã QR thanh toán'),
		};
	}
};
