'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { getRoommateSeekingListings } from '@/actions/roommate-seeking-posts.action';

interface RoommateSearchParams {
	sortBy?: 'createdAt' | 'maxBudget' | 'updatedAt';
	sortOrder?: 'asc' | 'desc';
	limit?: number;
}

export function useRoommatesQuery(params: RoommateSearchParams) {
	return useInfiniteQuery({
		queryKey: ['roommates', params],
		queryFn: async ({ pageParam = 1 }) => {
			const response = await getRoommateSeekingListings({
				...params,
				page: pageParam,
				limit: params.limit || 50,
			});

			if (response.success && response.data) {
				// Filter only active posts
				const activeListings = response.data.data.filter((listing) => listing.status === 'active');
				return {
					data: activeListings,
					meta: response.data.meta,
				};
			}

			throw new Error('Failed to fetch roommates');
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage) => {
			return lastPage.meta.hasNext ? lastPage.meta.page + 1 : undefined;
		},
		getPreviousPageParam: (firstPage) => {
			return firstPage.meta.hasPrev ? firstPage.meta.page - 1 : undefined;
		},
	});
}
