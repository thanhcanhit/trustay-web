'use server';

import { AxiosError } from 'axios';
import { createServerApiCall } from '../lib/api-client';
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

const apiCall = createServerApiCall();

// Types for Roommate Applications
export interface RoommateApplication {
	id: string;
	roommateSeekingPostId: string;
	applicantId: string;
	fullName: string;
	occupation: string;
	phoneNumber: string;
	moveInDate: string;
	intendedStayMonths: number;
	applicationMessage: string;
	isUrgent: boolean;
	status:
		| 'pending'
		| 'approved_by_tenant'
		| 'rejected_by_tenant'
		| 'approved_by_landlord'
		| 'rejected_by_landlord'
		| 'cancelled'
		| 'expired';
	responseMessage?: string;
	isConfirmedByTenant?: boolean;
	isConfirmedByLandlord?: boolean;
	confirmedAt?: string;
	tenantResponse?: string;
	tenantRespondedAt?: string;
	landlordResponse?: string;
	landlordRespondedAt?: string;
	createdAt: string;
	updatedAt: string;
	// Post information for determining external vs platform room
	roommateSeekingPost?: {
		roomInstanceId?: string;
		externalAddress?: string;
		tenantId: string;
	};
}

export interface CreateRoommateApplicationRequest {
	roommateSeekingPostId: string;
	fullName: string;
	occupation: string;
	phoneNumber: string;
	moveInDate: string;
	intendedStayMonths: number;
	applicationMessage: string;
	isUrgent?: boolean;
}

export interface UpdateRoommateApplicationRequest {
	fullName?: string;
	occupation?: string;
	phoneNumber?: string;
	moveInDate?: string;
	intendedStayMonths?: number;
	applicationMessage?: string;
	isUrgent?: boolean;
}

export interface RespondToApplicationRequest {
	status:
		| 'approved_by_tenant'
		| 'rejected_by_tenant'
		| 'approved_by_landlord'
		| 'rejected_by_landlord';
}

export interface RoommateApplicationListResponse {
	data: RoommateApplication[];
	page: number;
	limit: number;
	total: number;
	totalPages: number;
}

export interface ApplicationStatistics {
	total: number;
	pending: number;
	approved: number;
	rejected: number;
	cancelled: number;
	expired: number;
}

// Create roommate application
export const createRoommateApplication = async (
	data: CreateRoommateApplicationRequest,
	token?: string,
): Promise<ApiResult<RoommateApplication>> => {
	try {
		const response = await apiCall<RoommateApplication>(
			'/api/roommate-applications',
			{
				method: 'POST',
				data,
			},
			token,
		);

		// Note: Backend should automatically send a message notification
		// with roommate application metadata to the post owner

		return {
			success: true,
			data: response,
		};
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể tạo đơn ứng tuyển'),
			status: error instanceof AxiosError ? error.response?.status : undefined,
		};
	}
};

// Get application by ID
export const getRoommateApplicationById = async (
	id: string,
	token?: string,
): Promise<ApiResult<RoommateApplication>> => {
	try {
		const response = await apiCall<RoommateApplication>(
			`/api/roommate-applications/${id}`,
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
			error: extractErrorMessage(error, 'Không thể tải thông tin đơn ứng tuyển'),
			status: error instanceof AxiosError ? error.response?.status : undefined,
		};
	}
};

// Get my applications
export const getMyRoommateApplications = async (
	params?: {
		page?: number;
		limit?: number;
		status?:
			| 'pending'
			| 'approved_by_tenant'
			| 'rejected_by_tenant'
			| 'approved_by_landlord'
			| 'rejected_by_landlord'
			| 'cancelled'
			| 'expired';
	},
	token?: string,
): Promise<ApiResult<RoommateApplicationListResponse>> => {
	try {
		const searchParams = new URLSearchParams();
		if (params?.page) searchParams.append('page', params.page.toString());
		if (params?.limit) searchParams.append('limit', params.limit.toString());
		if (params?.status) searchParams.append('status', params.status);

		const endpoint = `/api/roommate-applications/my-applications${
			searchParams.toString() ? `?${searchParams.toString()}` : ''
		}`;

		const response = await apiCall<RoommateApplicationListResponse>(
			endpoint,
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
			error: extractErrorMessage(error, 'Không thể tải danh sách đơn ứng tuyển của bạn'),
			status: error instanceof AxiosError ? error.response?.status : undefined,
		};
	}
};

// Get applications for my posts
export const getApplicationsForMyPosts = async (
	params?: {
		page?: number;
		limit?: number;
	},
	token?: string,
): Promise<ApiResult<RoommateApplicationListResponse>> => {
	try {
		const searchParams = new URLSearchParams();
		if (params?.page) searchParams.append('page', params.page.toString());
		if (params?.limit) searchParams.append('limit', params.limit.toString());

		const endpoint = `/api/roommate-applications/for-my-posts${
			searchParams.toString() ? `?${searchParams.toString()}` : ''
		}`;

		const response = await apiCall<RoommateApplicationListResponse>(
			endpoint,
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
			error: extractErrorMessage(
				error,
				'Không thể tải danh sách đơn ứng tuyển cho bài đăng của bạn',
			),
			status: error instanceof AxiosError ? error.response?.status : undefined,
		};
	}
};

// Update application
export const updateRoommateApplication = async (
	id: string,
	data: UpdateRoommateApplicationRequest,
	token?: string,
): Promise<ApiResult<RoommateApplication>> => {
	try {
		const response = await apiCall<RoommateApplication>(
			`/api/roommate-applications/${id}`,
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
			error: extractErrorMessage(error, 'Không thể cập nhật đơn ứng tuyển'),
			status: error instanceof AxiosError ? error.response?.status : undefined,
		};
	}
};

// Respond to application (approve or reject)
export const respondToRoommateApplication = async (
	id: string,
	data: RespondToApplicationRequest,
	token?: string,
): Promise<ApiResult<RoommateApplication>> => {
	try {
		const response = await apiCall<RoommateApplication>(
			`/api/roommate-applications/${id}/respond`,
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
			error: extractErrorMessage(error, 'Không thể phản hồi đơn ứng tuyển'),
			status: error instanceof AxiosError ? error.response?.status : undefined,
		};
	}
};

// Confirm application
export const confirmRoommateApplication = async (
	id: string,
	token?: string,
): Promise<ApiResult<RoommateApplication>> => {
	try {
		const response = await apiCall<RoommateApplication>(
			`/api/roommate-applications/${id}/confirm`,
			{
				method: 'PATCH',
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
			error: extractErrorMessage(error, 'Không thể xác nhận đơn ứng tuyển'),
			status: error instanceof AxiosError ? error.response?.status : undefined,
		};
	}
};

// Cancel application
export const cancelRoommateApplication = async (
	id: string,
	token?: string,
): Promise<ApiResult<RoommateApplication>> => {
	try {
		const response = await apiCall<RoommateApplication>(
			`/api/roommate-applications/${id}/cancel`,
			{
				method: 'PATCH',
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
			error: extractErrorMessage(error, 'Không thể hủy đơn ứng tuyển'),
			status: error instanceof AxiosError ? error.response?.status : undefined,
		};
	}
};

// Bulk respond to applications
export const bulkRespondToApplications = async (
	data: {
		applicationIds: string[];
		approve: boolean;
		message?: string;
	},
	token?: string,
): Promise<ApiResult<{ message: string; updatedCount: number }>> => {
	try {
		const response = await apiCall<{ message: string; updatedCount: number }>(
			'/api/roommate-applications/bulk-respond',
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
			error: extractErrorMessage(error, 'Không thể phản hồi hàng loạt đơn ứng tuyển'),
			status: error instanceof AxiosError ? error.response?.status : undefined,
		};
	}
};

// Get my application statistics
export const getMyApplicationStatistics = async (
	token?: string,
): Promise<ApiResult<ApplicationStatistics>> => {
	try {
		const response = await apiCall<ApplicationStatistics>(
			'/api/roommate-applications/statistics/my-applications',
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
			error: extractErrorMessage(error, 'Không thể tải thống kê đơn ứng tuyển của bạn'),
			status: error instanceof AxiosError ? error.response?.status : undefined,
		};
	}
};

// Get applications statistics for my posts
export const getApplicationStatisticsForMyPosts = async (
	token?: string,
): Promise<ApiResult<ApplicationStatistics>> => {
	try {
		const response = await apiCall<ApplicationStatistics>(
			'/api/roommate-applications/statistics/for-my-posts',
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
			error: extractErrorMessage(
				error,
				'Không thể tải thống kê đơn ứng tuyển cho bài đăng của bạn',
			),
			status: error instanceof AxiosError ? error.response?.status : undefined,
		};
	}
};
