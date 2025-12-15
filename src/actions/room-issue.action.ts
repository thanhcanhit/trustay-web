'use server';

import { createServerApiCall } from '../lib/api-client';
import {
	CreateRoomIssueRequest,
	LandlordRoomIssueQueryParams,
	PaginatedRoomIssuesResponse,
	RoomIssue,
	RoomIssueQueryParams,
	UpdateRoomIssueRequest,
} from '../types/types';
import { extractErrorMessage } from '../utils/api-error-handler';

// Types for error handling
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

// Create API call function for server actions
const apiCall = createServerApiCall();

// ============= TENANT APIs =============

// Create room issue (Tenant only)
export const createRoomIssue = async (
	data: CreateRoomIssueRequest,
	token?: string,
): Promise<ApiResult<{ data: RoomIssue }>> => {
	try {
		const response = await apiCall<{ data: RoomIssue }>(
			'/api/room-issues',
			{
				method: 'POST',
				data,
			},
			token,
		);

		return {
			success: true,
			data: response,
		};
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể tạo báo cáo sự cố'),
		};
	}
};

// Get my room issues (Tenant)
export const getMyRoomIssues = async (
	params?: RoomIssueQueryParams,
	token?: string,
): Promise<ApiResult<PaginatedRoomIssuesResponse>> => {
	try {
		const searchParams = new URLSearchParams();
		if (params?.page) searchParams.append('page', params.page.toString());
		if (params?.limit) searchParams.append('limit', params.limit.toString());
		if (params?.roomInstanceId) searchParams.append('roomInstanceId', params.roomInstanceId);
		if (params?.category) searchParams.append('category', params.category);
		if (params?.status) searchParams.append('status', params.status);

		const endpoint = `/api/room-issues/me${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
		const response = await apiCall<{
			success: boolean;
			message: string;
			data: PaginatedRoomIssuesResponse;
		}>(
			endpoint,
			{
				method: 'GET',
			},
			token,
		);

		return {
			success: true,
			data: response.data,
		};
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể tải danh sách sự cố'),
		};
	}
};

// ============= LANDLORD APIs =============

// Get room issues for landlord
export const getLandlordRoomIssues = async (
	params?: LandlordRoomIssueQueryParams,
	token?: string,
): Promise<ApiResult<PaginatedRoomIssuesResponse>> => {
	try {
		const searchParams = new URLSearchParams();
		if (params?.page) searchParams.append('page', params.page.toString());
		if (params?.limit) searchParams.append('limit', params.limit.toString());
		if (params?.roomInstanceId) searchParams.append('roomInstanceId', params.roomInstanceId);
		if (params?.category) searchParams.append('category', params.category);
		if (params?.status) searchParams.append('status', params.status);
		if (params?.reporterId) searchParams.append('reporterId', params.reporterId);

		const endpoint = `/api/room-issues/landlord${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
		const response = await apiCall<{
			success: boolean;
			message: string;
			data: PaginatedRoomIssuesResponse;
		}>(
			endpoint,
			{
				method: 'GET',
			},
			token,
		);

		return {
			success: true,
			data: response.data,
		};
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể tải danh sách sự cố'),
		};
	}
};

// ============= SHARED APIs =============

// Get room issue by ID
export const getRoomIssueById = async (
	issueId: string,
	token?: string,
): Promise<ApiResult<{ data: RoomIssue }>> => {
	try {
		const response = await apiCall<{ data: RoomIssue }>(
			`/api/room-issues/${issueId}`,
			{
				method: 'GET',
			},
			token,
		);

		return {
			success: true,
			data: response,
		};
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể tải thông tin sự cố'),
		};
	}
};

// Update room issue (Landlord can update status, tenant can update other fields)
export const updateRoomIssue = async (
	issueId: string,
	data: UpdateRoomIssueRequest,
	token?: string,
): Promise<ApiResult<{ data: RoomIssue }>> => {
	try {
		const response = await apiCall<{ data: RoomIssue }>(
			`/api/room-issues/landlord/${issueId}`,
			{
				method: 'PATCH',
				data,
			},
			token,
		);

		return {
			success: true,
			data: response,
		};
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể cập nhật sự cố'),
		};
	}
};
