'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Loader2 } from 'lucide-react';
import { RoommateSeekingCard } from '@/components/roommate/roommate-seeking-card';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { useRoommatesQuery } from '@/hooks/useRoommatesQuery';
import { useScrollRestoration } from '@/hooks/useScrollRestoration';
import { Button } from '@/components/ui/button';

function RoommateListingsContent() {
	const [sortBy, setSortBy] = useState<'createdAt' | 'maxBudget' | 'updatedAt'>('createdAt');
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

	// Khôi phục scroll position
	useScrollRestoration('roommates-list');

	const computedParams = useMemo(() => {
		return {
			sortBy,
			sortOrder,
			limit: 50,
		};
	}, [sortBy, sortOrder]);

	// Sử dụng TanStack Query
	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading,
		isError,
		error,
	} = useRoommatesQuery(computedParams);

	// Flatten all pages into single array
	const listings = useMemo(() => {
		return data?.pages.flatMap((page) => page.data) ?? [];
	}, [data]);

	// Infinite scroll handler
	useEffect(() => {
		const handleScroll = () => {
			if (
				window.innerHeight + document.documentElement.scrollTop >=
				document.documentElement.offsetHeight - 1000 &&
				hasNextPage &&
				!isFetchingNextPage
			) {
				fetchNextPage();
			}
		};

		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, [hasNextPage, isFetchingNextPage, fetchNextPage]);

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="mb-8">
				<h1 className="text-3xl font-bold mb-2">Tìm Bạn Cùng Trọ</h1>
				<p className="text-gray-600">Tìm kiếm người ở ghép phù hợp với bạn</p>
			</div>

			{/* Filter Bar */}
			<div className="mb-6 flex justify-end gap-2">
				<Select value={sortBy} onValueChange={(value: 'createdAt' | 'maxBudget' | 'updatedAt') => setSortBy(value)}>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Sắp xếp theo" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="createdAt">Ngày đăng</SelectItem>
						<SelectItem value="maxBudget">Ngân sách</SelectItem>
						<SelectItem value="updatedAt">Cập nhật</SelectItem>
					</SelectContent>
				</Select>
				<Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
					<SelectTrigger className="w-[140px]">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="desc">Giảm dần</SelectItem>
						<SelectItem value="asc">Tăng dần</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* Loading State */}
			{isLoading && (
				<div className="text-center py-12">
					<Loader2 className="h-8 w-8 animate-spin mx-auto text-green-600" />
					<p className="text-gray-600 mt-2">Đang tải...</p>
				</div>
			)}

			{/* Error State */}
			{isError && (
				<div className="text-center py-12">
					<p className="text-red-600 mb-4">{error?.message || 'Có lỗi xảy ra'}</p>
					<Button onClick={() => window.location.reload()} variant="outline">Thử lại</Button>
				</div>
			)}

			{/* Empty State */}
			{!isLoading && !isError && listings.length === 0 && (
				<Empty>
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<Users />
						</EmptyMedia>
						<EmptyTitle>Không tìm thấy bài đăng</EmptyTitle>
						<EmptyDescription>
							Chưa có bài đăng tìm bạn cùng trọ nào. Hãy quay lại sau để xem các bài đăng mới nhất.
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
			)}

			{/* Listings Grid */}
			{!isLoading && !isError && listings.length > 0 && (
				<>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{listings.map((listing) => (
							<RoommateSeekingCard key={listing.id} listing={listing} />
						))}
					</div>

					{/* Load More Button / Loading More */}
					{hasNextPage && (
						<div className="text-center mt-8">
							{isFetchingNextPage ? (
								<div className="flex items-center justify-center">
									<Loader2 className="h-6 w-6 animate-spin text-green-600 mr-2" />
									<span className="text-gray-600">Đang tải thêm...</span>
								</div>
							) : (
								<Button
									variant="outline"
									onClick={() => fetchNextPage()}
									className="px-8"
								>
									Tải thêm bài đăng
								</Button>
							)}
						</div>
					)}

					{/* Result Count */}
					<div className="mt-6 text-center text-gray-600">
						Hiển thị {listings.length} bài đăng
					</div>
				</>
			)}
		</div>
	);
}

export default function RoommatePage() {
	return (
		<Suspense fallback={<div className="container mx-auto px-4 py-8 text-center">Đang tải...</div>}>
			<RoommateListingsContent />
		</Suspense>
	);
}
