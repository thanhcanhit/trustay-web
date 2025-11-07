'use server';

import { createServerApiCall } from '@/lib/api-client';
import type {
	Bill,
	BillQueryParams,
	CreateBillRequest,
	GenerateMonthlyBillsRequest,
	GenerateMonthlyBillsResponse,
	LandlordBillQueryParams,
	PaginatedBillResponse,
	PreviewBillForBuildingRequest,
	UpdateBillRequest,
	UpdateBillWithMeterDataRequest,
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

// Helper to convert Decimal objects to numbers
const parseDecimalValue = (value: unknown): number => {
	if (value && typeof value === 'object' && 's' in value && 'e' in value && 'd' in value) {
		// Decimal format: {s: sign, e: exponent, d: digits array}
		const sign = value.s as number;
		const exponent = value.e as number;
		const digits = value.d as number[];

		// Reconstruct the number
		const numStr = digits.join('');
		const num = parseInt(numStr, 10);
		const result = num * 10 ** (exponent - numStr.length + 1);
		return sign === 1 ? result : -result;
	}
	return typeof value === 'number' ? value : 0;
};

// Helper to recursively parse all Decimal objects in response
const parseDecimalFields = (obj: unknown): unknown => {
	if (obj === null || obj === undefined) return obj;

	if (Array.isArray(obj)) {
		return obj.map(parseDecimalFields);
	}

	if (typeof obj === 'object' && 's' in obj && 'e' in obj && 'd' in obj) {
		return parseDecimalValue(obj);
	}

	if (typeof obj === 'object') {
		const result: Record<string, unknown> = {};
		for (const key in obj) {
			if (Object.hasOwn(obj, key)) {
				result[key] = parseDecimalFields((obj as Record<string, unknown>)[key]);
			}
		}
		return result;
	}

	return obj;
};

const normalizeEntityResponse = <T extends object>(response: unknown): { data: T } => {
	if (response && typeof response === 'object' && 'data' in (response as Record<string, unknown>)) {
		const parsed = parseDecimalFields(response);
		return parsed as { data: T };
	}
	const parsed = parseDecimalFields(response);
	return { data: parsed as T };
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

		return { success: true, data: parseDecimalFields(response) as PaginatedBillResponse };
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

// Generate monthly bills for building (Landlord only)
export const generateMonthlyBillsForBuilding = async (
	data: GenerateMonthlyBillsRequest,
	token?: string,
): Promise<ApiResult<GenerateMonthlyBillsResponse>> => {
	try {
		const response = await apiCall<GenerateMonthlyBillsResponse>(
			'/api/bills/generate-monthly-bills-for-building',
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
			error: extractErrorMessage(error, 'Không thể tạo hóa đơn hàng tháng cho toà nhà'),
		};
	}
};

// Get bills for landlord by month (Landlord only)
export const getLandlordBillsByMonth = async (
	params?: LandlordBillQueryParams,
	token?: string,
): Promise<ApiResult<PaginatedBillResponse>> => {
	try {
		const q = new URLSearchParams();
		if (params?.page) q.append('page', String(params.page));
		if (params?.limit) q.append('limit', String(params.limit));
		if (params?.buildingId) q.append('buildingId', params.buildingId);
		if (params?.roomInstanceId) q.append('roomInstanceId', params.roomInstanceId);
		if (params?.billingPeriod) q.append('billingPeriod', params.billingPeriod);
		if (params?.billingMonth) q.append('billingMonth', String(params.billingMonth));
		if (params?.billingYear) q.append('billingYear', String(params.billingYear));
		if (params?.status) q.append('status', params.status);
		if (params?.search) q.append('search', params.search);
		if (params?.sortBy) q.append('sortBy', params.sortBy);
		if (params?.sortOrder) q.append('sortOrder', params.sortOrder);

		const endpoint = `/api/bills/landlord/by-month${q.toString() ? `?${q.toString()}` : ''}`;
		const response = await apiCall<PaginatedBillResponse>(endpoint, { method: 'GET' }, token);

		return { success: true, data: parseDecimalFields(response) as PaginatedBillResponse };
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể tải danh sách hóa đơn'),
		};
	}
};

// Update bill with meter data and occupancy (Landlord only)
export const updateBillWithMeterData = async (
	data: UpdateBillWithMeterDataRequest,
	token?: string,
): Promise<ApiResult<{ data: Bill }>> => {
	try {
		const response = await apiCall<{ data: Bill }>(
			'/api/bills/update-with-meter-data',
			{
				method: 'PATCH',
				data,
			},
			token,
		);
		return { success: true, data: normalizeEntityResponse<Bill>(response) };
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể cập nhật hóa đơn với dữ liệu đồng hồ'),
		};
	}
};

// Get tenant bills (Tenant only)
export const getTenantBills = async (
	params?: BillQueryParams,
	token?: string,
): Promise<ApiResult<PaginatedBillResponse>> => {
	try {
		const q = new URLSearchParams();
		if (params?.page) q.append('page', String(params.page));
		if (params?.limit) q.append('limit', String(params.limit));
		if (params?.rentalId) q.append('rentalId', params.rentalId);
		if (params?.roomInstanceId) q.append('roomInstanceId', params.roomInstanceId);
		if (params?.status) q.append('status', params.status);
		if (params?.fromDate) q.append('fromDate', params.fromDate);
		if (params?.toDate) q.append('toDate', params.toDate);
		if (params?.billingPeriod) q.append('billingPeriod', params.billingPeriod);

		const endpoint = `/api/bills/tenant/my-bills${q.toString() ? `?${q.toString()}` : ''}`;
		const response = await apiCall<PaginatedBillResponse>(endpoint, { method: 'GET' }, token);

		return { success: true, data: parseDecimalFields(response) as PaginatedBillResponse };
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể tải danh sách hóa đơn'),
		};
	}
};
