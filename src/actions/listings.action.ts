'use server';

import { createServerApiCall } from '@/lib/api-client';
import { TokenUtils } from '@/lib/token-utils';

// Types for API responses
export interface RoomListing {
	id: string;
	slug: string;
	name: string;
	roomType: string;
	maxOccupancy: number;
	isVerified: boolean;
	buildingName: string;
	buildingVerified: boolean;
	address: string;
	owner: {
		name: string;
		avatarUrl: string | null;
		gender: string;
		verifiedPhone: boolean;
		verifiedEmail: boolean;
		verifiedIdentity: boolean;
	};
	location: {
		provinceId: number;
		provinceName: string;
		districtId: number;
		districtName: string;
		wardId: number;
		wardName: string;
	};
	images: Array<{
		url: string;
		alt: string;
		isPrimary: boolean;
		sortOrder: number;
	}>;
	amenities: Array<{
		id: string;
		name: string;
		category: string;
	}>;
	costs: Array<{
		id: string;
		name: string;
		value: string;
	}>;
	pricing: {
		basePriceMonthly: string;
		depositAmount: string;
		utilityIncluded: boolean;
	};
	rules: Array<{
		id: string;
		name: string;
		type: string;
	}>;
}

export interface RoomListingsResponse {
	data: RoomListing[];
	meta: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
		hasNext: boolean;
		hasPrev: boolean;
		itemCount: number;
	};
}

export interface RoomDetail {
	id: string;
	slug: string;
	name: string;
	description: string;
	roomType: string;
	areaSqm: string;
	maxOccupancy: number;
	isVerified: boolean;
	isActive: boolean;
	floorNumber: number;
	buildingName: string;
	buildingDescription: string;
	address: string;
	addressLine2: string | null;
	location: {
		provinceId: number;
		provinceName: string;
		districtId: number;
		districtName: string;
		wardId: number;
		wardName: string;
	};
	owner: {
		id: string;
		firstName: string;
		lastName: string;
		phone: string;
		avatarUrl: string | null;
		isVerifiedPhone: boolean;
		isVerifiedEmail: boolean;
		isVerifiedIdentity: boolean;
	};
	images: Array<{
		url: string;
		alt: string;
		isPrimary: boolean;
		sortOrder: number;
	}>;
	amenities: Array<{
		id: string;
		name: string;
		category: string;
		customValue: string | null;
		notes: string | null;
	}>;
	costs: Array<{
		id: string;
		name: string;
		value: string;
		category: string;
		notes: string | null;
	}>;
	pricing: {
		basePriceMonthly: string;
		depositAmount: string;
		depositMonths: number;
		utilityIncluded: boolean;
		minimumStayMonths: number;
		maximumStayMonths: number | null;
		priceNegotiable: boolean;
	};
	rules: Array<{
		id: string;
		name: string;
		type: string;
		customValue: string | null;
		notes: string | null;
		isEnforced: boolean;
	}>;
	lastUpdated: string;
}

// Search parameters interface
export interface RoomSearchParams {
	search?: string;
	provinceId?: number;
	districtId?: number;
	wardId?: number;
	roomType?: string;
	minPrice?: number;
	maxPrice?: number;
	minArea?: number;
	maxArea?: number;
	amenities?: string; // comma-separated amenity IDs
	maxOccupancy?: number;
	isVerified?: boolean;
	sortBy?: 'price' | 'area' | 'createdAt';
	sortOrder?: 'asc' | 'desc';
	page?: number;
	limit?: number;
}

// Create server API call function
const serverApiCall = createServerApiCall(() => TokenUtils.getAccessToken());

/**
 * Search room listings with filters
 */
export async function searchRoomListings(
	params: RoomSearchParams = {},
): Promise<RoomListingsResponse> {
	try {
		// Build query string
		const queryParams = new URLSearchParams();

		Object.entries(params).forEach(([key, value]) => {
			if (value !== undefined && value !== null && value !== '') {
				queryParams.append(key, value.toString());
			}
		});

		const endpoint = `/api/listings/rooms${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
		console.log('Calling API endpoint:', endpoint);

		const response = await serverApiCall<RoomListingsResponse>(endpoint, {
			method: 'GET',
		});

		console.log('API response received:', {
			dataLength: response.data?.length || 'no data property',
			meta: response.meta,
		});

		return response;
	} catch (error: unknown) {
		console.error('Failed to search room listings:', error);
		const errorMessage = error instanceof Error ? error.message : 'Failed to search room listings';
		throw new Error(errorMessage);
	}
}

/**
 * Get room detail by slug
 */
export async function getRoomBySlug(slug: string): Promise<RoomDetail> {
	try {
		const response = await serverApiCall<RoomDetail>(`/api/rooms/${slug}`, {
			method: 'GET',
		});

		return response;
	} catch (error: unknown) {
		console.error('Failed to get room detail:', error);
		const errorMessage = error instanceof Error ? error.message : 'Failed to get room detail';
		throw new Error(errorMessage);
	}
}

/**
 * Get featured/hot room listings for homepage
 */
export async function getFeaturedRoomListings(limit: number = 4): Promise<RoomListing[]> {
	try {
		const response = await searchRoomListings({
			sortBy: 'createdAt',
			sortOrder: 'desc',
			limit,
			page: 1,
		});

		return response.data;
	} catch (error: unknown) {
		console.error('Failed to get featured room listings:', error);
		const errorMessage =
			error instanceof Error ? error.message : 'Failed to get featured room listings';
		throw new Error(errorMessage);
	}
}
