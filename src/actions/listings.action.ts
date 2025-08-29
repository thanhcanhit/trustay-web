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
	search: string; // Required parameter
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
	latitude?: number; // For location-based search
	longitude?: number; // For location-based search
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
export async function searchRoomListings(params: RoomSearchParams): Promise<RoomListingsResponse> {
	try {
		// Build query string
		const queryParams = new URLSearchParams();

		// Required parameter - use '.' if search is empty
		queryParams.append('search', params.search || '.');

		// Optional parameters
		if (params.provinceId !== undefined)
			queryParams.append('provinceId', params.provinceId.toString());
		if (params.districtId !== undefined)
			queryParams.append('districtId', params.districtId.toString());
		if (params.wardId !== undefined) queryParams.append('wardId', params.wardId.toString());
		if (params.roomType) queryParams.append('roomType', params.roomType);
		if (params.minPrice !== undefined) queryParams.append('minPrice', params.minPrice.toString());
		if (params.maxPrice !== undefined) queryParams.append('maxPrice', params.maxPrice.toString());
		if (params.minArea !== undefined) queryParams.append('minArea', params.minArea.toString());
		if (params.maxArea !== undefined) queryParams.append('maxArea', params.maxArea.toString());
		if (params.amenities) queryParams.append('amenities', params.amenities);
		if (params.maxOccupancy !== undefined)
			queryParams.append('maxOccupancy', params.maxOccupancy.toString());
		if (params.isVerified !== undefined)
			queryParams.append('isVerified', params.isVerified.toString());
		if (params.latitude !== undefined) queryParams.append('latitude', params.latitude.toString());
		if (params.longitude !== undefined)
			queryParams.append('longitude', params.longitude.toString());
		if (params.sortBy) queryParams.append('sortBy', params.sortBy);
		if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
		if (params.page !== undefined) queryParams.append('page', params.page.toString());
		if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());

		const endpoint = `/api/listings/rooms?${queryParams.toString()}`;
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
		throw error;
	}
}

/**
 * Get room detail by slug
 */
export async function getRoomBySlug(slug: string): Promise<RoomDetail> {
	try {
		const response = await serverApiCall<RoomDetail>(`/api/rooms/public/${slug}`, {
			method: 'GET',
		});

		return response;
	} catch (error: unknown) {
		console.error('Failed to get room detail:', error);
		throw error;
	}
}

/**
 * Get all room listings without search filter (for internal use)
 */
export async function getAllRoomListings(
	params: Omit<RoomSearchParams, 'search'> = {},
): Promise<RoomListingsResponse> {
	try {
		// Use searchRoomListings with empty search (will default to '.')
		return await searchRoomListings({
			search: '',
			...params,
		});
	} catch (error: unknown) {
		console.error('Failed to get all room listings:', error);
		throw error;
	}
}

/**
 * Get featured/hot room listings for homepage
 */
export async function getFeaturedRoomListings(limit: number = 4): Promise<RoomListing[]> {
	try {
		const response = await getAllRoomListings({
			sortBy: 'createdAt',
			sortOrder: 'desc',
			page: 1,
		});

		return response.data.slice(0, limit);
	} catch (error: unknown) {
		console.error('Failed to get featured room listings:', error);
		throw error;
	}
}
