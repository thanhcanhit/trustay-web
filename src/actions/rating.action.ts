'use server';

import { createServerApiCall } from '@/lib/api-client';
import type {
	CreateRatingRequest,
	GetRatingsQueryParams,
	PaginatedRatingsResponse,
	RatingResponseDto,
	UpdateRatingRequest,
} from '@/types/types';

const apiCall = createServerApiCall();

/**
 * Create a new rating
 * @description Creates a new rating for a target (tenant, landlord, or room)
 * @endpoint POST /api/ratings
 * @auth Required
 */
export async function createRating(
	data: CreateRatingRequest,
	token?: string,
): Promise<RatingResponseDto> {
	const response = await apiCall<RatingResponseDto>(
		'/api/ratings',
		{
			method: 'POST',
			data,
		},
		token,
	);
	return response;
}

/**
 * Get ratings with filters and pagination
 * @description Retrieves a paginated list of ratings with optional filters
 * @endpoint GET /api/ratings
 * @auth Optional (if authenticated, current user's ratings appear first)
 */
export async function getRatings(
	params?: GetRatingsQueryParams,
	token?: string,
): Promise<PaginatedRatingsResponse> {
	try {
		const queryParams = new URLSearchParams();

		if (params?.targetType) queryParams.append('targetType', params.targetType);
		if (params?.targetId) queryParams.append('targetId', params.targetId);
		if (params?.reviewerId) queryParams.append('reviewerId', params.reviewerId);
		if (params?.rentalId) queryParams.append('rentalId', params.rentalId);
		if (params?.minRating) queryParams.append('minRating', params.minRating.toString());
		if (params?.maxRating) queryParams.append('maxRating', params.maxRating.toString());
		if (params?.page) queryParams.append('page', params.page.toString());
		if (params?.limit) queryParams.append('limit', params.limit.toString());
		if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
		if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

		const url = queryParams.toString() ? `/api/ratings?${queryParams.toString()}` : '/api/ratings';

		const response = await apiCall<PaginatedRatingsResponse>(
			url,
			{
				method: 'GET',
			},
			token,
		);
		return response;
	} catch (error: unknown) {
		// Re-throw other errors
		throw error;
	}
}

/**
 * Get a single rating by ID
 * @description Retrieves detailed information about a specific rating
 * @endpoint GET /api/ratings/:id
 * @auth Optional
 */
export async function getRatingById(ratingId: string, token?: string): Promise<RatingResponseDto> {
	const response = await apiCall<RatingResponseDto>(
		`/api/ratings/${ratingId}`,
		{
			method: 'GET',
		},
		token,
	);
	return response;
}

/**
 * Update an existing rating
 * @description Updates a rating. Only the owner can update their rating
 * @endpoint PATCH /api/ratings/:id
 * @auth Required (must be the rating owner)
 */
export async function updateRating(
	ratingId: string,
	data: UpdateRatingRequest,
	token?: string,
): Promise<RatingResponseDto> {
	const response = await apiCall<RatingResponseDto>(
		`/api/ratings/${ratingId}`,
		{
			method: 'PATCH',
			data,
		},
		token,
	);
	return response;
}

/**
 * Delete a rating
 * @description Deletes a rating. Only the owner can delete their rating
 * @endpoint DELETE /api/ratings/:id
 * @auth Required (must be the rating owner)
 */
export async function deleteRating(ratingId: string, token?: string): Promise<{ message: string }> {
	const response = await apiCall<{ message: string }>(
		`/api/ratings/${ratingId}`,
		{
			method: 'DELETE',
		},
		token,
	);
	return response;
}

/**
 * Get ratings created by a specific user
 * @description Retrieves all ratings that a user has created (reviews they've written)
 * @endpoint GET /api/ratings/user/:userId
 * @auth Optional
 */
export async function getUserCreatedRatings(
	userId: string,
	params?: Omit<GetRatingsQueryParams, 'reviewerId'>,
	token?: string,
): Promise<PaginatedRatingsResponse> {
	const queryParams = new URLSearchParams();

	if (params?.targetType) queryParams.append('targetType', params.targetType);
	if (params?.minRating) queryParams.append('minRating', params.minRating.toString());
	if (params?.maxRating) queryParams.append('maxRating', params.maxRating.toString());
	if (params?.page) queryParams.append('page', params.page.toString());
	if (params?.limit) queryParams.append('limit', params.limit.toString());
	if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
	if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

	const url = queryParams.toString()
		? `/api/ratings/user/${userId}?${queryParams.toString()}`
		: `/api/ratings/user/${userId}`;

	const response = await apiCall<PaginatedRatingsResponse>(
		url,
		{
			method: 'GET',
		},
		token,
	);
	return response;
}

/**
 * Check if current user has rated a target
 * @description Utility function to check if the current user has already rated a specific target
 * @param targetType Type of target (tenant, landlord, or room)
 * @param targetId ID of the target
 * @param token Authentication token (optional)
 */
export async function hasUserRatedTarget(
	targetType: 'tenant' | 'landlord' | 'room',
	targetId: string,
	token?: string,
): Promise<{ hasRated: boolean; rating?: RatingResponseDto }> {
	try {
		const data = await getRatings(
			{
				targetType,
				targetId,
				limit: 1,
			},
			token,
		);

		// Check if the first rating is from the current user
		const currentUserRating = data.data.find((rating: RatingResponseDto) => rating.isCurrentUser);

		return {
			hasRated: !!currentUserRating,
			rating: currentUserRating,
		};
	} catch (error) {
		throw new Error(error instanceof Error ? error.message : 'Failed to check rating');
	}
}

/**
 * Get rating statistics for a target
 * @description Gets the rating statistics (average, distribution, etc.) for a target
 * @param targetType Type of target (tenant, landlord, or room)
 * @param targetId ID of the target
 * @param token Authentication token (optional)
 */
export async function getRatingStats(
	targetType: 'tenant' | 'landlord' | 'room',
	targetId: string,
	token?: string,
): Promise<{
	totalRatings: number;
	averageRating: number;
	distribution: { 1: number; 2: number; 3: number; 4: number; 5: number };
}> {
	try {
		const data = await getRatings(
			{
				targetType,
				targetId,
				limit: 1, // We only need the stats, not the actual ratings
			},
			token,
		);

		if (data.stats) {
			return data.stats;
		}

		throw new Error('Failed to get rating statistics');
	} catch (error) {
		throw new Error(error instanceof Error ? error.message : 'Failed to get rating stats');
	}
}
