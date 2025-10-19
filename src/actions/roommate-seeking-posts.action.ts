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

// Types for Roommate Seeking Posts
export interface RoommateSeekingPost {
	id: string;
	title: string;
	description: string;
	slug: string;

	// Người đăng (tenant)
	tenantId: string;

	// Phòng trong platform (tùy chọn)
	roomInstanceId?: string;
	rentalId?: string;

	// Phòng ngoài platform (tùy chọn)
	externalAddress?: string;
	externalProvinceId?: number;
	externalDistrictId?: number;
	externalWardId?: number;

	// Chi phí
	monthlyRent: number;
	currency: string;
	depositAmount: number;
	utilityCostPerPerson?: number;

	// Số lượng người
	seekingCount: number;
	approvedCount: number;
	remainingSlots: number;
	maxOccupancy: number;
	currentOccupancy: number;

	// Yêu cầu
	preferredGender: 'other' | 'male' | 'female';
	additionalRequirements?: string;

	// Thời gian
	availableFromDate: string;
	minimumStayMonths?: number;
	maximumStayMonths?: number;

	// Trạng thái
	status: 'draft' | 'active' | 'paused' | 'closed' | 'expired';
	requiresLandlordApproval: boolean;
	isApprovedByLandlord?: boolean;
	landlordNotes?: string;

	// Visibility
	isActive: boolean;
	expiresAt?: string;

	// Statistics
	viewCount: number;
	contactCount: number;

	// Timestamps
	createdAt: string;
	updatedAt: string;

	// Relations (optional, populated by backend)
	tenant?: {
		id: string;
		firstName?: string;
		lastName?: string;
		avatarUrl?: string;
		phoneNumber?: string;
	};
	roomInstance?: {
		id: string;
		roomNumber: string;
		room?: {
			id: string;
			name: string;
			building?: {
				id: string;
				name: string;
				address: string;
			};
		};
	};
	externalProvince?: { id: number; name: string };
	externalDistrict?: { id: number; name: string };
	externalWard?: { id: number; name: string };
}

export interface CreateRoommateSeekingPostRequest {
	// Thông tin cơ bản
	title: string;
	description: string;

	// Phòng trong platform (tùy chọn - chọn 1 trong 2: phòng trong hệ thống hoặc ngoài)
	roomInstanceId?: string;
	rentalId?: string;

	// Phòng ngoài platform (tùy chọn)
	externalAddress?: string;
	externalProvinceId?: number;
	externalDistrictId?: number;
	externalWardId?: number;

	// Chi phí
	monthlyRent: number;
	currency?: string; // Default: "VND"
	depositAmount: number;
	utilityCostPerPerson?: number;

	// Số lượng người
	seekingCount: number; // Số người cần tìm
	maxOccupancy: number; // Tối đa số người ở
	currentOccupancy: number; // Số người hiện tại (thường là 1)

	// Yêu cầu về roommate
	preferredGender: 'other' | 'male' | 'female';
	additionalRequirements?: string;

	// Thời gian
	availableFromDate: string; // ISO date string
	minimumStayMonths?: number;
	maximumStayMonths?: number;

	// Khác
	requiresLandlordApproval?: boolean; // Default: false
	expiresAt?: string; // ISO date string
}

export interface UpdateRoommateSeekingPostRequest {
	// Thông tin cơ bản
	title?: string;
	description?: string;

	// Phòng trong platform
	roomInstanceId?: string;
	rentalId?: string;

	// Phòng ngoài platform
	externalAddress?: string;
	externalProvinceId?: number;
	externalDistrictId?: number;
	externalWardId?: number;

	// Chi phí
	monthlyRent?: number;
	currency?: string;
	depositAmount?: number;
	utilityCostPerPerson?: number;

	// Số lượng
	seekingCount?: number;
	maxOccupancy?: number;
	currentOccupancy?: number;

	// Yêu cầu
	preferredGender?: 'other' | 'male' | 'female';
	additionalRequirements?: string;

	// Thời gian
	availableFromDate?: string;
	minimumStayMonths?: number;
	maximumStayMonths?: number;

	// Khác
	requiresLandlordApproval?: boolean;
	expiresAt?: string;
}

export interface RoommateSeekingPostListResponse {
	data: RoommateSeekingPost[];
	page: number;
	limit: number;
	total: number;
	totalPages: number;
}

// Listing response (from /api/listings/roommate-seeking-posts)
export interface RoommateSeekingListingItem {
	id: string;
	title: string;
	description: string;
	slug: string;
	maxBudget: number;
	currency: string;
	occupancy: number;
	moveInDate: string;
	status: 'active' | 'paused' | 'closed' | 'expired';
	viewCount: number;
	contactCount: number;
	createdAt: string;
	requester: {
		id: string;
		avatarUrl: string | null;
		name: string;
		email: string;
	};
}

export interface RoommateSeekingListingResponse {
	data: RoommateSeekingListingItem[];
	meta: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
		hasNext: boolean;
		hasPrev: boolean;
		itemCount: number;
	};
	seo: {
		title: string;
		description: string;
		keywords: string;
	};
	breadcrumb: {
		items: Array<{
			title: string;
			path: string;
		}>;
	};
}

export interface SearchRoommateSeekingPostsParams {
	page?: number;
	limit?: number;
	provinceId?: number;
	districtId?: number;
	wardId?: number;
	minPrice?: number;
	maxPrice?: number;
	preferredGender?: 'other' | 'male' | 'female';
	status?: 'active' | 'paused' | 'closed' | 'expired';
	sortBy?: 'createdAt' | 'monthlyRent' | 'updatedAt';
	sortOrder?: 'asc' | 'desc';
}

// Create roommate seeking post
export const createRoommateSeekingPost = async (
	data: CreateRoommateSeekingPostRequest,
	token?: string,
): Promise<ApiResult<RoommateSeekingPost>> => {
	try {
		const response = await apiCall<RoommateSeekingPost>(
			'/api/roommate-seeking-posts',
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
			error: extractErrorMessage(error, 'Không thể tạo bài đăng tìm bạn cùng phòng'),
			status: error instanceof AxiosError ? error.response?.status : undefined,
		};
	}
};

// Get roommate seeking post by ID
export const getRoommateSeekingPostById = async (
	id: string,
	token?: string,
): Promise<ApiResult<RoommateSeekingPost>> => {
	try {
		const response = await apiCall<RoommateSeekingPost>(
			`/api/roommate-seeking-posts/${id}`,
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
			error: extractErrorMessage(error, 'Không thể tải thông tin bài đăng'),
			status: error instanceof AxiosError ? error.response?.status : undefined,
		};
	}
};

// Get my roommate seeking posts
export const getMyRoommateSeekingPosts = async (
	params?: {
		page?: number;
		limit?: number;
	},
	token?: string,
): Promise<ApiResult<RoommateSeekingPostListResponse>> => {
	try {
		const searchParams = new URLSearchParams();
		if (params?.page) searchParams.append('page', params.page.toString());
		if (params?.limit) searchParams.append('limit', params.limit.toString());

		const endpoint = `/api/roommate-seeking-posts/me${
			searchParams.toString() ? `?${searchParams.toString()}` : ''
		}`;

		const response = await apiCall<RoommateSeekingPostListResponse>(
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
			error: extractErrorMessage(error, 'Không thể tải danh sách bài đăng của bạn'),
			status: error instanceof AxiosError ? error.response?.status : undefined,
		};
	}
};

// Get all roommate seeking posts (public)
export const getAllRoommateSeekingPosts = async (
	params?: {
		page?: number;
		limit?: number;
		sortBy?: 'createdAt' | 'monthlyRent' | 'updatedAt';
		sortOrder?: 'asc' | 'desc';
	},
	token?: string,
): Promise<ApiResult<RoommateSeekingPostListResponse>> => {
	try {
		const searchParams = new URLSearchParams();
		if (params?.page) searchParams.append('page', params.page.toString());
		if (params?.limit) searchParams.append('limit', params.limit.toString());
		if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
		if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);

		const endpoint = `/api/roommate-seeking-posts${
			searchParams.toString() ? `?${searchParams.toString()}` : ''
		}`;

		const response = await apiCall<RoommateSeekingPostListResponse>(
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
			error: extractErrorMessage(error, 'Không thể tải danh sách bài đăng'),
			status: error instanceof AxiosError ? error.response?.status : undefined,
		};
	}
};

// Search/Filter roommate seeking posts
export const searchRoommateSeekingPosts = async (
	params: SearchRoommateSeekingPostsParams,
	token?: string,
): Promise<ApiResult<RoommateSeekingPostListResponse>> => {
	try {
		const searchParams = new URLSearchParams();
		if (params.page) searchParams.append('page', params.page.toString());
		if (params.limit) searchParams.append('limit', params.limit.toString());
		if (params.provinceId) searchParams.append('provinceId', params.provinceId.toString());
		if (params.districtId) searchParams.append('districtId', params.districtId.toString());
		if (params.wardId) searchParams.append('wardId', params.wardId.toString());
		if (params.minPrice) searchParams.append('minPrice', params.minPrice.toString());
		if (params.maxPrice) searchParams.append('maxPrice', params.maxPrice.toString());
		if (params.preferredGender) searchParams.append('preferredGender', params.preferredGender);
		if (params.status) searchParams.append('status', params.status);
		if (params.sortBy) searchParams.append('sortBy', params.sortBy);
		if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);

		const endpoint = `/api/roommate-seeking-posts/search${
			searchParams.toString() ? `?${searchParams.toString()}` : ''
		}`;

		const response = await apiCall<RoommateSeekingPostListResponse>(
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
			error: extractErrorMessage(error, 'Không thể tìm kiếm bài đăng'),
			status: error instanceof AxiosError ? error.response?.status : undefined,
		};
	}
};

// Update roommate seeking post
export const updateRoommateSeekingPost = async (
	id: string,
	data: UpdateRoommateSeekingPostRequest,
	token?: string,
): Promise<ApiResult<RoommateSeekingPost>> => {
	try {
		const response = await apiCall<RoommateSeekingPost>(
			`/api/roommate-seeking-posts/${id}`,
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
			error: extractErrorMessage(error, 'Không thể cập nhật bài đăng'),
			status: error instanceof AxiosError ? error.response?.status : undefined,
		};
	}
};

// Update roommate seeking post status
export const updateRoommateSeekingPostStatus = async (
	id: string,
	status: 'active' | 'paused' | 'closed' | 'expired',
	token?: string,
): Promise<ApiResult<RoommateSeekingPost>> => {
	try {
		const response = await apiCall<RoommateSeekingPost>(
			`/api/roommate-seeking-posts/${id}/status`,
			{
				method: 'PATCH',
				data: { status },
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
			error: extractErrorMessage(error, 'Không thể cập nhật trạng thái bài đăng'),
			status: error instanceof AxiosError ? error.response?.status : undefined,
		};
	}
};

// Delete roommate seeking post
export const deleteRoommateSeekingPost = async (
	id: string,
	token?: string,
): Promise<ApiResult<{ message: string }>> => {
	try {
		const response = await apiCall<{ message: string }>(
			`/api/roommate-seeking-posts/${id}`,
			{
				method: 'DELETE',
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
			error: extractErrorMessage(error, 'Không thể xóa bài đăng'),
			status: error instanceof AxiosError ? error.response?.status : undefined,
		};
	}
};

// Get listings (public endpoint - similar to room-seekings)
export const getRoommateSeekingListings = async (
	params?: {
		page?: number;
		limit?: number;
		sortBy?: 'createdAt' | 'maxBudget' | 'updatedAt';
		sortOrder?: 'asc' | 'desc';
	},
	token?: string,
): Promise<ApiResult<RoommateSeekingListingResponse>> => {
	try {
		const searchParams = new URLSearchParams();
		if (params?.page) searchParams.append('page', params.page.toString());
		if (params?.limit) searchParams.append('limit', params.limit.toString());
		if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
		if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);

		const endpoint = `/api/listings/roommate-seeking-posts${
			searchParams.toString() ? `?${searchParams.toString()}` : ''
		}`;

		const response = await apiCall<RoommateSeekingListingResponse>(
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
			error: extractErrorMessage(error, 'Không thể tải danh sách bài đăng'),
			status: error instanceof AxiosError ? error.response?.status : undefined,
		};
	}
};
