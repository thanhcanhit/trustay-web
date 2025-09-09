import { type RoomSearchParams } from '@/types/types';

/**
 * Safely encode search query for API calls
 * Handles empty strings, whitespace, and special characters
 */
export function encodeSearchQuery(query: string | undefined | null): string {
	if (!query || query.trim() === '') {
		return '.';
	}
	return query.trim();
}

/**
 * Helper function to build URL search params from RoomSearchParams
 * This is a client-side utility function, not a server action
 */
export function buildSearchParams(params: RoomSearchParams): URLSearchParams {
	const searchParams = new URLSearchParams();

	// Required parameter
	searchParams.append('search', encodeSearchQuery(params.search));

	// Optional parameters
	if (params.provinceId !== undefined)
		searchParams.append('provinceId', params.provinceId.toString());
	if (params.districtId !== undefined)
		searchParams.append('districtId', params.districtId.toString());
	if (params.wardId !== undefined) searchParams.append('wardId', params.wardId.toString());
	if (params.roomType) searchParams.append('roomType', params.roomType);
	if (params.minPrice !== undefined) searchParams.append('minPrice', params.minPrice.toString());
	if (params.maxPrice !== undefined) searchParams.append('maxPrice', params.maxPrice.toString());
	if (params.minArea !== undefined) searchParams.append('minArea', params.minArea.toString());
	if (params.maxArea !== undefined) searchParams.append('maxArea', params.maxArea.toString());
	if (params.amenities) searchParams.append('amenities', params.amenities);
	if (params.maxOccupancy !== undefined)
		searchParams.append('maxOccupancy', params.maxOccupancy.toString());
	if (params.isVerified !== undefined)
		searchParams.append('isVerified', params.isVerified.toString());
	if (params.latitude !== undefined) searchParams.append('latitude', params.latitude.toString());
	if (params.longitude !== undefined) searchParams.append('longitude', params.longitude.toString());
	if (params.sortBy) searchParams.append('sortBy', params.sortBy);
	if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);
	if (params.page !== undefined) searchParams.append('page', params.page.toString());
	if (params.limit !== undefined) searchParams.append('limit', params.limit.toString());

	return searchParams;
}

/**
 * Parse URL search params into RoomSearchParams object
 */
export function parseSearchParams(searchParams: URLSearchParams): RoomSearchParams {
	return {
		search: encodeSearchQuery(searchParams.get('search')),
		provinceId: searchParams.get('provinceId')
			? parseInt(searchParams.get('provinceId')!)
			: undefined,
		districtId: searchParams.get('districtId')
			? parseInt(searchParams.get('districtId')!)
			: undefined,
		wardId: searchParams.get('wardId') ? parseInt(searchParams.get('wardId')!) : undefined,
		roomType: searchParams.get('roomType') || undefined,
		minPrice: searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined,
		maxPrice: searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined,
		minArea: searchParams.get('minArea') ? parseInt(searchParams.get('minArea')!) : undefined,
		maxArea: searchParams.get('maxArea') ? parseInt(searchParams.get('maxArea')!) : undefined,
		amenities: searchParams.get('amenities') || undefined,
		maxOccupancy: searchParams.get('maxOccupancy')
			? parseInt(searchParams.get('maxOccupancy')!)
			: undefined,
		isVerified: searchParams.get('isVerified') === 'true' ? true : undefined,
		latitude: searchParams.get('latitude') ? parseFloat(searchParams.get('latitude')!) : undefined,
		longitude: searchParams.get('longitude')
			? parseFloat(searchParams.get('longitude')!)
			: undefined,
		sortBy: (searchParams.get('sortBy') as 'price' | 'area' | 'createdAt') || 'createdAt',
		sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
		page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
		limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
	};
}
