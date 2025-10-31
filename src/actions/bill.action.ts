'use server';

import { createServerApiCall } from '@/lib/api-client';
import type {
	Bill,
	BillQueryParams,
	CreateBillRequest,
	PaginatedBillResponse,
	PreviewBillForBuildingRequest,
	UpdateBillRequest,
	UpdateMeterDataRequest,
} from '@/types/bill.types';
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

// Create bill for room (Landlord only)
export const createBillForRoom = async (
	data: CreateBillRequest,
	token?: string,
): Promise<ApiResult<{ data: Bill }>> => {
	try {
		const response = await apiCall<{ data: Bill }>(
			'/api/bills/create-for-room',
			{
				method: 'POST',
				data,
			},
			token,
		);
		return { success: true, data: normalizeEntityResponse<Bill>(response) };
	} catch (error) {
		return { success: false, error: extractErrorMessage(error, 'Không thể tạo hóa đơn') };
	}
};

// Preview bills for building (Landlord only)
export const previewBillsForBuilding = async (
	data: PreviewBillForBuildingRequest,
	token?: string,
): Promise<ApiResult<unknown>> => {
	try {
		const response = await apiCall<unknown>(
			'/api/bills/preview-for-building',
			{
				method: 'POST',
				data,
			},
			token,
		);
		return { success: true, data: response };
	} catch (error) {
		return { success: false, error: extractErrorMessage(error, 'Không thể xem trước hóa đơn') };
	}
};

// Get bills list
export const getBills = async (
	params?: BillQueryParams,
	token?: string,
): Promise<ApiResult<PaginatedBillResponse>> => {
	try {
		const q = new URLSearchParams();
		if (params?.page) q.append('page', String(params.page));
		if (params?.limit) q.append('limit', String(params.limit));
		if (params?.status) q.append('status', params.status);
		if (params?.search) q.append('search', params.search);
		if (params?.billingMonth) q.append('billingMonth', String(params.billingMonth));
		if (params?.billingYear) q.append('billingYear', String(params.billingYear));

		const endpoint = `/api/bills${q.toString() ? `?${q.toString()}` : ''}`;
		const response = await apiCall<PaginatedBillResponse>(endpoint, { method: 'GET' }, token);

		return { success: true, data: response };
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể tải danh sách hóa đơn'),
		};
	}
};

// Get bill details by ID
export const getBillById = async (
	id: string,
	token?: string,
): Promise<ApiResult<{ data: Bill }>> => {
	try {
		const response = await apiCall<{ data: Bill }>(`/api/bills/${id}`, { method: 'GET' }, token);
		return { success: true, data: normalizeEntityResponse<Bill>(response) };
	} catch (error) {
		return { success: false, error: extractErrorMessage(error, 'Không thể tải chi tiết hóa đơn') };
	}
};

// Update bill (Landlord only)
export const updateBill = async (
	id: string,
	data: UpdateBillRequest,
	token?: string,
): Promise<ApiResult<{ data: Bill }>> => {
	try {
		const response = await apiCall<{ data: Bill }>(
			`/api/bills/${id}`,
			{
				method: 'PATCH',
				data,
			},
			token,
		);
		return { success: true, data: normalizeEntityResponse<Bill>(response) };
	} catch (error) {
		return { success: false, error: extractErrorMessage(error, 'Không thể cập nhật hóa đơn') };
	}
};

// Delete bill (Landlord only)
export const deleteBill = async (
	id: string,
	token?: string,
): Promise<ApiResult<{ message: string }>> => {
	try {
		const response = await apiCall<{ message: string }>(
			`/api/bills/${id}`,
			{
				method: 'DELETE',
			},
			token,
		);
		return { success: true, data: response };
	} catch (error) {
		return { success: false, error: extractErrorMessage(error, 'Không thể xóa hóa đơn') };
	}
};

// Mark bill as paid (Landlord only)
export const markBillAsPaid = async (
	id: string,
	token?: string,
): Promise<ApiResult<{ data: Bill }>> => {
	try {
		const response = await apiCall<{ data: Bill }>(
			`/api/bills/${id}/mark-paid`,
			{
				method: 'POST',
			},
			token,
		);
		return { success: true, data: normalizeEntityResponse<Bill>(response) };
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể đánh dấu đã thanh toán'),
		};
	}
};

// Update meter data (Landlord only)
export const updateMeterData = async (
	id: string,
	data: UpdateMeterDataRequest,
	token?: string,
): Promise<ApiResult<{ data: Bill }>> => {
	try {
		const response = await apiCall<{ data: Bill }>(
			`/api/bills/${id}/meter-data`,
			{
				method: 'POST',
				data,
			},
			token,
		);
		return { success: true, data: normalizeEntityResponse<Bill>(response) };
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể cập nhật dữ liệu đồng hồ'),
		};
	}
};
