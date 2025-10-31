'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { listPublicRoomSeekingPosts } from '@/actions/listings.action';
import type { RoomSeekingPublicSearchParams } from '@/types/types';

export function useRoomSeekingsQuery(params: RoomSeekingPublicSearchParams) {
	return useInfiniteQuery({
		queryKey: ['room-seekings', params],
		queryFn: async ({ pageParam = 1 }) => {
			const response = await listPublicRoomSeekingPosts({
				...params,
				page: pageParam,
				status: 'active',
				isPublic: true,
			});
			return response;
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
