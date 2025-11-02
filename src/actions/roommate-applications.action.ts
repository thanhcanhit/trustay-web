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
	phoneNumber: string;
	email: string;
	occupation: string;
	monthlyIncome: number;
	applicationMessage: string;
	moveInDate: string;
	intendedStayMonths: number;
	isUrgent: boolean;
	status: 'pending' | 'accepted' | 'rejected' | 'awaiting_confirmation' | 'cancelled' | 'expired';
	tenantResponse?: string;
	landlordResponse?: string;
	tenantRespondedAt?: string;
	landlordRespondedAt?: string;
	confirmedAt?: string;
	createdAt: string;
	updatedAt: string;
	// Related data
	applicant?: {
		id: string;
		firstName: string;
		lastName: string;
		email: string;
		avatarUrl?: string;
	};
	roommateSeekingPost?: {
		id: string;
		title: string;
		slug?: string;
		tenantId?: string;
		monthlyRent: number;
		depositAmount?: number;
		roomInstanceId?: string;
		roomInstance?: {
			id: string;
			roomNumber: string;
			room: {
				name: string;
				building: {
					name: string;
					ownerId: string;
				};
			};
		};
		tenant?: {
			id: string;
			firstName: string;
			lastName: string;
			avatarUrl?: string | null;
		};
	};
	rental?: {
		id: string;
		roomInstanceId: string;
		tenantId: string;
		ownerId: string;
		contractStartDate: string;
		contractEndDate: string;
		monthlyRent: number;
		depositPaid: number;
		status: string;
	};
}

export interface CreateRoommateApplicationRequest {
	roommateSeekingPostId: string;
	fullName: string;
	phone: string;
	email: string;
	occupation: string;
	monthlyIncome: number;
	applicationMessage: string;
	moveInDate: string;
	intendedStayMonths: number;
	isUrgent?: boolean;
}

export interface UpdateRoommateApplicationRequest {
	fullName?: string;
	phone?: string;
	email?: string;
	occupation?: string;
	monthlyIncome?: number;
	applicationMessage?: string;
	moveInDate?: string;
	intendedStayMonths?: number;
	isUrgent?: boolean;
}

export interface RespondToApplicationRequest {
	status: 'accepted' | 'rejected';
	response: string;
}

export interface RoommateApplicationListResponse {
	data: RoommateApplication[];
	meta: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
		hasNext: boolean;
		hasPrev: boolean;
		itemCount: number;
	};
	counts: {
		pending: number;
		approvedByTenant: number;
		rejectedByTenant: number;
		approvedByLandlord: number;
		rejectedByLandlord: number;
		cancelled: number;
		expired: number;
		total: number;
	};
}

export interface ApplicationStatistics {
	total: number;
	pending: number;
	approvedByTenant: number;
	rejectedByTenant: number;
	approvedByLandlord: number;
	rejectedByLandlord: number;
	cancelled: number;
	expired: number;
	urgent: number;
	dailyStats: Array<{
		date: string;
		count: number;
	}>;
	statusBreakdown: Array<{
		status: string;
		count: number;
		percentage: number;
	}>;
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
			| 'accepted'
			| 'rejected'
			| 'awaiting_confirmation'
			| 'cancelled'
			| 'expired';
		search?: string;
		roommateSeekingPostId?: string;
		isUrgent?: boolean;
		sortBy?: string;
		sortOrder?: 'asc' | 'desc';
	},
	token?: string,
): Promise<ApiResult<RoommateApplicationListResponse>> => {
	try {
		const searchParams = new URLSearchParams();
		if (params?.page) searchParams.append('page', params.page.toString());
		if (params?.limit) searchParams.append('limit', params.limit.toString());
		if (params?.status) searchParams.append('status', params.status);
		if (params?.search) searchParams.append('search', params.search);
		if (params?.roommateSeekingPostId)
			searchParams.append('roommateSeekingPostId', params.roommateSeekingPostId);
		if (params?.isUrgent !== undefined) searchParams.append('isUrgent', params.isUrgent.toString());
		if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
		if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);

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
		status?:
			| 'pending'
			| 'accepted'
			| 'rejected'
			| 'awaiting_confirmation'
			| 'cancelled'
			| 'expired';
		search?: string;
		roommateSeekingPostId?: string;
		isUrgent?: boolean;
		sortBy?: string;
		sortOrder?: 'asc' | 'desc';
	},
	token?: string,
): Promise<ApiResult<RoommateApplicationListResponse>> => {
	try {
		const searchParams = new URLSearchParams();
		if (params?.page) searchParams.append('page', params.page.toString());
		if (params?.limit) searchParams.append('limit', params.limit.toString());
		if (params?.status) searchParams.append('status', params.status);
		if (params?.search) searchParams.append('search', params.search);
		if (params?.roommateSeekingPostId)
			searchParams.append('roommateSeekingPostId', params.roommateSeekingPostId);
		if (params?.isUrgent !== undefined) searchParams.append('isUrgent', params.isUrgent.toString());
		if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
		if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);

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
				data: {},
				headers: {
					'Content-Type': 'application/json',
				},
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
				data: {},
				headers: {
					'Content-Type': 'application/json',
				},
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
		status: 'accepted' | 'rejected';
		response: string;
	},
	token?: string,
): Promise<
	ApiResult<{
		successCount: number;
		failureCount: number;
		processedApplications: string[];
		errors: Array<{
			applicationId: string;
			error: string;
		}>;
	}>
> => {
	try {
		const response = await apiCall<{
			successCount: number;
			failureCount: number;
			processedApplications: string[];
			errors: Array<{
				applicationId: string;
				error: string;
			}>;
		}>(
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

// Landlord: Get pending applications that need approval (Platform Rooms only)
export const getLandlordPendingApplications = async (
	params?: {
		page?: number;
		limit?: number;
		status?: 'accepted' | 'rejected' | 'awaiting_confirmation';
		search?: string;
		roommateSeekingPostId?: string;
		isUrgent?: boolean;
		sortBy?: string;
		sortOrder?: 'asc' | 'desc';
	},
	token?: string,
): Promise<ApiResult<RoommateApplicationListResponse>> => {
	try {
		const searchParams = new URLSearchParams();
		if (params?.page) searchParams.append('page', params.page.toString());
		if (params?.limit) searchParams.append('limit', params.limit.toString());
		if (params?.status) searchParams.append('status', params.status);
		if (params?.search) searchParams.append('search', params.search);
		if (params?.roommateSeekingPostId)
			searchParams.append('roommateSeekingPostId', params.roommateSeekingPostId);
		if (params?.isUrgent !== undefined) searchParams.append('isUrgent', params.isUrgent.toString());
		if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
		if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);

		const endpoint = `/api/roommate-applications/landlord/pending${
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
			error: extractErrorMessage(error, 'Không thể tải danh sách đơn ứng tuyển cần duyệt'),
			status: error instanceof AxiosError ? error.response?.status : undefined,
		};
	}
};

// Landlord: Approve application (Platform Rooms only)
export const landlordApproveApplication = async (
	id: string,
	response: string,
	token?: string,
): Promise<ApiResult<RoommateApplication>> => {
	try {
		const result = await apiCall<RoommateApplication>(
			`/api/roommate-applications/${id}/landlord-approve`,
			{
				method: 'POST',
				data: {
					status: 'accepted',
					response,
				},
			},
			token,
		);

		return {
			success: true,
			data: result,
		};
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể phê duyệt đơn ứng tuyển'),
			status: error instanceof AxiosError ? error.response?.status : undefined,
		};
	}
};

// Landlord: Reject application (Platform Rooms only)
export const landlordRejectApplication = async (
	id: string,
	response: string,
	token?: string,
): Promise<ApiResult<RoommateApplication>> => {
	try {
		const result = await apiCall<RoommateApplication>(
			`/api/roommate-applications/${id}/landlord-reject`,
			{
				method: 'POST',
				data: {
					status: 'rejected',
					response,
				},
			},
			token,
		);

		return {
			success: true,
			data: result,
		};
	} catch (error) {
		return {
			success: false,
			error: extractErrorMessage(error, 'Không thể từ chối đơn ứng tuyển'),
			status: error instanceof AxiosError ? error.response?.status : undefined,
		};
	}
};
