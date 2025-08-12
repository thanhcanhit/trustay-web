'use server';

import { createServerApiCall } from '@/lib/api-client';
import type { Amenity, AppEnums, CostType, Rule } from '@/stores/referenceStore';

// Create server API call function (reference data is public, no auth needed)
const serverApiCall = createServerApiCall(() => null);

/**
 * Get all amenities with optional category filter
 */
export async function getAmenities(category?: string): Promise<Amenity[]> {
	try {
		const endpoint = category
			? `/api/reference/amenities?category=${category}`
			: '/api/reference/amenities';

		const response = await serverApiCall<Amenity[]>(endpoint, {
			method: 'GET',
		});

		return response;
	} catch (error: unknown) {
		console.error('Failed to get amenities:', error);
		const errorMessage = error instanceof Error ? error.message : 'Failed to get amenities';
		throw new Error(errorMessage);
	}
}

/**
 * Get all cost types with optional category filter
 */
export async function getCostTypes(category?: string): Promise<CostType[]> {
	try {
		const endpoint = category
			? `/api/reference/cost-types?category=${category}`
			: '/api/reference/cost-types';

		const response = await serverApiCall<CostType[]>(endpoint, {
			method: 'GET',
		});

		return response;
	} catch (error: unknown) {
		console.error('Failed to get cost types:', error);
		const errorMessage = error instanceof Error ? error.message : 'Failed to get cost types';
		throw new Error(errorMessage);
	}
}

/**
 * Get all rules with optional category filter
 */
export async function getRules(category?: string): Promise<Rule[]> {
	try {
		const endpoint = category
			? `/api/reference/rules?category=${category}`
			: '/api/reference/rules';

		const response = await serverApiCall<Rule[]>(endpoint, {
			method: 'GET',
		});

		return response;
	} catch (error: unknown) {
		console.error('Failed to get rules:', error);
		const errorMessage = error instanceof Error ? error.message : 'Failed to get rules';
		throw new Error(errorMessage);
	}
}

/**
 * Get all application enums
 */
export async function getAppEnums(): Promise<AppEnums> {
	try {
		const response = await serverApiCall<AppEnums>('/api/reference/enums', {
			method: 'GET',
		});

		return response;
	} catch (error: unknown) {
		console.error('Failed to get app enums:', error);
		const errorMessage = error instanceof Error ? error.message : 'Failed to get app enums';
		throw new Error(errorMessage);
	}
}
