'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users } from 'lucide-react';
import { getRoommateSeekingListings, type RoommateSeekingListingItem } from '@/actions/roommate-seeking-posts.action';
import { RoommateSeekingCard } from '@/components/roommate/roommate-seeking-card';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty';

function RoommateListingsContent() {
	const isRequestInProgress = useRef(false);
	const [listings, setListings] = useState<RoommateSeekingListingItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [sortBy, setSortBy] = useState<'createdAt' | 'maxBudget' | 'updatedAt'>('createdAt');
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

	const computedParams = useMemo(() => {
		return {
			sortBy,
			sortOrder,
		};
	}, [sortBy, sortOrder]);

	useEffect(() => {
		const run = async () => {
			if (isRequestInProgress.current) return;
			isRequestInProgress.current = true;
			setLoading(true);
			
			try {
				const result = await getRoommateSeekingListings({ page: 1, limit: 50, ...computedParams });
				
				console.log('Roommate listings result:', result);
				
				if (result.success && result.data) {
					// Filter only active posts
					const activeListings = result.data.data.filter(listing => listing.status === 'active');
					console.log('Active listings:', activeListings.length, 'out of', result.data.data.length);
					setListings(activeListings);
				}
			} catch (err) {
				console.error('Error loading roommate listings:', err);
			} finally {
				setLoading(false);
				isRequestInProgress.current = false;
			}
		};
		
		run();
	}, [computedParams]);

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
			{loading && (
				<div className="text-center py-12">
					<p className="text-gray-600">Đang tải...</p>
				</div>
			)}

			{/* Empty State */}
			{!loading && listings.length === 0 && (
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
			{!loading && listings.length > 0 && (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
					{listings.map((listing) => (
						<RoommateSeekingCard key={listing.id} listing={listing} />
					))}
				</div>
			)}

			{/* Result Count */}
			{!loading && listings.length > 0 && (
				<div className="mt-6 text-center text-gray-600">
					Hiển thị {listings.length} bài đăng
				</div>
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
