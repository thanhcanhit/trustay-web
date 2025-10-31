'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { searchRoomListings } from '@/actions/listings.action';
import type { RoomSearchParams } from '@/types/types';

export function useRoomsQuery(params: RoomSearchParams) {
	return useInfiniteQuery({
		queryKey: ['rooms', params],
		queryFn: async ({ pageParam = 1 }) => {
			const response = await searchRoomListings({ ...params, page: pageParam });
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
