'use server';

import { AxiosError } from 'axios';
import { cookies } from 'next/headers';
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
				return 'Không tìm thấy thanh toán';
			case 409:
				return 'Trạng thái thanh toán không hợp lệ';
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

// Create payment
export const createPayment = async (
	data: CreatePaymentRequest,
): Promise<ApiResult<{ data: Payment }>> => {
	try {
		const response = await apiCall<{ data: Payment }>('/api/payments', {
			method: 'POST',
			data,
		});
		return { success: true, data: normalizeEntityResponse<Payment>(response) };
	} catch (error) {
		return { success: false, error: extractErrorMessage(error, 'Không thể tạo thanh toán') };
	}
};

// Get payments list with pagination and filtering
export const getPayments = async (params?: {
	page?: number;
	limit?: number;
	status?: string;
	paymentType?: string;
	contractId?: string;
	rentalId?: string;
}): Promise<ApiResult<PaymentListResponse>> => {
	try {
		const q = new URLSearchParams();
		if (params?.page) q.append('page', String(params.page));
		if (params?.limit) q.append('limit', String(params.limit));
		if (params?.status) q.append('status', params.status);
		if (params?.paymentType) q.append('paymentType', params.paymentType);
		if (params?.contractId) q.append('contractId', params.contractId);
		if (params?.rentalId) q.append('rentalId', params.rentalId);

		const endpoint = `/api/payments${q.toString() ? `?${q.toString()}` : ''}`;
		const response = await apiCall<PaymentListResponse>(endpoint, { method: 'GET' });
		return { success: true, data: response };
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể tải danh sách thanh toán'),
		};
	}
};

// Get payment history with date filtering
export const getPaymentHistory = async (params?: {
	contractId?: string;
	rentalId?: string;
	startDate?: string;
	endDate?: string;
	page?: number;
	limit?: number;
}): Promise<ApiResult<PaymentListResponse>> => {
	try {
		const q = new URLSearchParams();
		if (params?.contractId) q.append('contractId', params.contractId);
		if (params?.rentalId) q.append('rentalId', params.rentalId);
		if (params?.startDate) q.append('startDate', params.startDate);
		if (params?.endDate) q.append('endDate', params.endDate);
		if (params?.page) q.append('page', String(params.page));
		if (params?.limit) q.append('limit', String(params.limit));

		const endpoint = `/api/payments/history${q.toString() ? `?${q.toString()}` : ''}`;
		const response = await apiCall<PaymentListResponse>(endpoint, { method: 'GET' });
		return { success: true, data: response };
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể tải lịch sử thanh toán'),
		};
	}
};

// Get payment details by ID
export const getPaymentById = async (id: string): Promise<ApiResult<{ data: Payment }>> => {
	try {
		const response = await apiCall<{ data: Payment }>(`/api/payments/${id}`, {
			method: 'GET',
		});
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
): Promise<ApiResult<{ data: Payment }>> => {
	try {
		const response = await apiCall<{ data: Payment }>(`/api/payments/${id}`, {
			method: 'PATCH',
			data,
		});
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
): Promise<ApiResult<{ message: string }>> => {
	try {
		const response = await apiCall<{ message: string }>(`/api/payments/${paymentId}/receipt`, {
			method: 'POST',
			data: { ...data, paymentId },
		});
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
): Promise<ApiResult<{ data: Payment }>> => {
	try {
		const response = await apiCall<{ data: Payment }>('/api/payments/refund', {
			method: 'POST',
			data,
		});
		return { success: true, data: normalizeEntityResponse<Payment>(response) };
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể xử lý hoàn tiền'),
		};
	}
};

// Get payment statistics
export const getPaymentStatistics = async (params?: {
	contractId?: string;
	rentalId?: string;
	year?: number;
	month?: number;
}): Promise<ApiResult<PaymentStatistics>> => {
	try {
		const q = new URLSearchParams();
		if (params?.contractId) q.append('contractId', params.contractId);
		if (params?.rentalId) q.append('rentalId', params.rentalId);
		if (params?.year) q.append('year', String(params.year));
		if (params?.month) q.append('month', String(params.month));

		const endpoint = `/api/payments/stats${q.toString() ? `?${q.toString()}` : ''}`;
		const response = await apiCall<PaymentStatistics>(endpoint, { method: 'GET' });
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
): Promise<ApiResult<{ qrCodeUrl: string }>> => {
	try {
		const response = await apiCall<{ qrCodeUrl: string }>(`/api/payments/${id}/qr-code`, {
			method: 'GET',
		});
		return { success: true, data: response };
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể tạo mã QR thanh toán'),
		};
	}
};
