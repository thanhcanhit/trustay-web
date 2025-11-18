//'use server';

import { createServerApiCall } from '@/lib/api-client';
import type {
	DashboardFinanceResponseDto,
	DashboardOperationsResponseDto,
	DashboardOverviewResponseDto,
	RoomWithOccupantsListResponse,
	TenantListResponse,
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

// List my tenants (Landlord only)
export const listMyTenants = async (
	params?: {
		page?: number;
		limit?: number;
		buildingId?: string;
		roomId?: string;
		status?: string;
		search?: string;
	},
	token?: string,
): Promise<ApiResult<TenantListResponse>> => {
	try {
		const q = new URLSearchParams();
		if (params?.page) q.append('page', String(params.page));
		if (params?.limit) q.append('limit', String(params.limit));
		if (params?.buildingId) q.append('buildingId', params.buildingId);
		if (params?.roomId) q.append('roomId', params.roomId);
		// if (params?.status) q.append('status', params.status);
		if (params?.search) q.append('search', params.search);

		const endpoint = `/api/landlord/tenants${q.toString() ? `?${q.toString()}` : ''}`;
		const response = await apiCall<TenantListResponse>(endpoint, { method: 'GET' }, token);
		return { success: true, data: response };
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể tải danh sách người thuê'),
		};
	}
};

// List my rooms with occupants (Landlord only)
export const listMyRoomsWithOccupants = async (
	params?: {
		page?: number;
		limit?: number;
		buildingId?: string;
		status?: string;
		occupancyStatus?: 'occupied' | 'vacant' | 'all';
	},
	token?: string,
): Promise<ApiResult<RoomWithOccupantsListResponse>> => {
	try {
		const q = new URLSearchParams();
		if (params?.page) q.append('page', String(params.page));
		if (params?.limit) q.append('limit', String(params.limit));
		if (params?.buildingId) q.append('buildingId', params.buildingId);
		// if (params?.status) q.append('status', params.status);
		if (params?.occupancyStatus) q.append('occupancyStatus', params.occupancyStatus);

		const endpoint = `/api/landlord/rooms${q.toString() ? `?${q.toString()}` : ''}`;
		const response = await apiCall<RoomWithOccupantsListResponse>(
			endpoint,
			{ method: 'GET' },
			token,
		);
		return { success: true, data: response };
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể tải danh sách phòng và người thuê'),
		};
	}
};

// Dashboard Overview (Landlord only)
export const getDashboardOverview = async (
	params?: {
		buildingId?: string;
	},
	token?: string,
): Promise<ApiResult<DashboardOverviewResponseDto>> => {
	try {
		const q = new URLSearchParams();
		if (params?.buildingId) q.append('buildingId', params.buildingId);

		const endpoint = `/api/dashboard/overview${q.toString() ? `?${q.toString()}` : ''}`;
		const response = await apiCall<DashboardOverviewResponseDto>(
			endpoint,
			{ method: 'GET' },
			token,
		);
		return { success: true, data: response };
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể tải dữ liệu tổng quan'),
		};
	}
};

// Dashboard Operations (Landlord only)
export const getDashboardOperations = async (
	params?: {
		buildingId?: string;
	},
	token?: string,
): Promise<ApiResult<DashboardOperationsResponseDto>> => {
	try {
		const q = new URLSearchParams();
		if (params?.buildingId) q.append('buildingId', params.buildingId);

		const endpoint = `/api/dashboard/operations${q.toString() ? `?${q.toString()}` : ''}`;
		const response = await apiCall<DashboardOperationsResponseDto>(
			endpoint,
			{ method: 'GET' },
			token,
		);
		return { success: true, data: response };
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể tải dữ liệu hoạt động'),
		};
	}
};

// Dashboard Finance (Landlord only)
export const getDashboardFinance = async (
	params?: {
		buildingId?: string;
		referenceMonth?: string; // Format: YYYY-MM
	},
	token?: string,
): Promise<ApiResult<DashboardFinanceResponseDto>> => {
	try {
		const q = new URLSearchParams();
		if (params?.buildingId) q.append('buildingId', params.buildingId);
		if (params?.referenceMonth) q.append('referenceMonth', params.referenceMonth);

		const endpoint = `/api/dashboard/finance${q.toString() ? `?${q.toString()}` : ''}`;
		const response = await apiCall<DashboardFinanceResponseDto>(endpoint, { method: 'GET' }, token);
		return { success: true, data: response };
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể tải dữ liệu tài chính'),
		};
	}
};
