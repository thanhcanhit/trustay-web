'use client';

import { useEffect, useState } from 'react';
import { RatingItem } from './rating-item';
import { RatingStats } from './rating-stats';
import { UpdateRatingForm } from './update-rating-form';
import { CreateRatingForm } from './create-rating-form';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { PlusCircle } from 'lucide-react';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useRatingStore } from '@/stores/ratingStore';
import { useUserStore } from '@/stores/userStore';
import type {
	RatingTargetType,
	RatingResponseDto,
	GetRatingsQueryParams,
} from '@/types/types';
import { toast } from 'sonner';

interface RatingsListProps {
	targetType: RatingTargetType;
	targetId: string;
	showStats?: boolean;
	showCreateButton?: boolean;
	rentalId?: string;
	initialParams?: Omit<GetRatingsQueryParams, 'targetType' | 'targetId'>;
}

export function RatingsList({
	targetType,
	targetId,
	showStats = true,
	showCreateButton = true,
	rentalId,
	initialParams = {},
}: RatingsListProps) {
	const {
		ratings,
		pagination,
		statistics,
		isLoading,
		getRatings,
		deleteRating,
	} = useRatingStore();
	const { isAuthenticated } = useUserStore();

	const [currentPage, setCurrentPage] = useState(
		initialParams.page || 1,
	);
	const [editingRating, setEditingRating] =
		useState<RatingResponseDto | null>(null);
	const [deletingRatingId, setDeletingRatingId] = useState<string | null>(
		null,
	);
	const [isCreatingRating, setIsCreatingRating] = useState(false);

	const fetchRatings = async (page: number) => {
		try {
			await getRatings({
				targetType,
				targetId,
				page,
				limit: initialParams.limit || 10,
				...initialParams,
			});
		} catch (error) {
			toast.error('Không thể tải đánh giá', {
				description:
					error instanceof Error ? error.message : 'Vui lòng thử lại',
			});
		}
	};

	// Fetch ratings when component mounts or parameters change
	useEffect(() => {
		fetchRatings(currentPage);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [targetType, targetId, currentPage]);

	const handleDelete = async () => {
		if (!deletingRatingId) return;

		try {
			await deleteRating(deletingRatingId);
			toast.success('Xóa đánh giá thành công');
			setDeletingRatingId(null);
			// Refresh the list
			await fetchRatings(currentPage);
		} catch (error) {
			toast.error('Không thể xóa đánh giá', {
				description:
					error instanceof Error ? error.message : 'Vui lòng thử lại',
			});
		}
	};

	const handleEditSuccess = async () => {
		setEditingRating(null);
		await fetchRatings(currentPage);
	};

	const handleCreateSuccess = async () => {
		setIsCreatingRating(false);
		await fetchRatings(1); // Go to first page to see new rating
		setCurrentPage(1);
	};

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
	};

	if (isLoading && ratings.length === 0) {
		return (
			<div className="space-y-6">
				{showStats && <Skeleton className="h-64 w-full" />}
				{[1, 2, 3].map((i) => (
					<Skeleton key={i} className="h-48 w-full" />
				))}
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Statistics */}
			{showStats && statistics && (
				<RatingStats
					statistics={statistics}
					targetType={targetType}
				/>
			)}

			{/* Create Review Button */}
			{showCreateButton && (
				<div className="flex justify-between items-center">
					<h3 className="text-lg font-semibold">Đánh giá</h3>
					<Button
						onClick={() => setIsCreatingRating(true)}
						className="gap-2"
						disabled={!isAuthenticated}
						title={!isAuthenticated ? 'Vui lòng đăng nhập để viết đánh giá' : ''}
					>
						<PlusCircle className="w-4 h-4" />
						Viết đánh giá
					</Button>
				</div>
			)}

			{/* Ratings List */}
			<div className="space-y-4">
				{ratings.length === 0 ? (
					<div className="text-center py-12 bg-gray-50 rounded-lg">
						<p className="text-gray-500 text-lg">Chưa có đánh giá nào</p>
						<p className="text-gray-400 text-sm mt-2">
							Hãy là người đầu tiên để lại đánh giá!
						</p>
					</div>
				) : (
					<>
						<div className="space-y-4">
							{ratings.map((rating) => (
								<RatingItem
									key={rating.id}
									rating={rating}
									onEdit={setEditingRating}
									onDelete={setDeletingRatingId}
								/>
							))}
						</div>

						{/* Pagination */}
						{pagination && pagination.totalPages > 1 && (
							<div className="flex justify-center gap-2 mt-6">
								<Button
									variant="outline"
									onClick={() => handlePageChange(currentPage - 1)}
									disabled={currentPage === 1 || isLoading}
								>
									Trước
								</Button>

								<div className="flex items-center gap-2">
									{Array.from(
										{ length: pagination.totalPages },
										(_, i) => i + 1,
									).map((page) => {
										// Show first page, last page, current page, and pages around current
										const showPage =
											page === 1 ||
											page === pagination.totalPages ||
											Math.abs(page - currentPage) <= 1;

										if (!showPage) {
											// Show ellipsis
											if (
												page === currentPage - 2 ||
												page === currentPage + 2
											) {
												return (
													<span key={page} className="px-2">
														...
													</span>
												);
											}
											return null;
										}

										return (
											<Button
												key={page}
												variant={page === currentPage ? 'default' : 'outline'}
												onClick={() => handlePageChange(page)}
												disabled={isLoading}
											>
												{page}
											</Button>
										);
									})}
								</div>

								<Button
									variant="outline"
									onClick={() => handlePageChange(currentPage + 1)}
									disabled={
										currentPage === pagination.totalPages || isLoading
									}
								>
									Sau
								</Button>
							</div>
						)}
					</>
				)}
			</div>

			{/* Create Rating Dialog */}
			<Dialog open={isCreatingRating} onOpenChange={setIsCreatingRating}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>Viết đánh giá</DialogTitle>
					</DialogHeader>
					<CreateRatingForm
						targetType={targetType}
						targetId={targetId}
						rentalId={rentalId}
						onSuccess={handleCreateSuccess}
						onCancel={() => setIsCreatingRating(false)}
					/>
				</DialogContent>
			</Dialog>

			{/* Edit Dialog */}
			<Dialog open={!!editingRating} onOpenChange={() => setEditingRating(null)}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>Chỉnh sửa đánh giá</DialogTitle>
					</DialogHeader>
					{editingRating && (
						<UpdateRatingForm
							rating={editingRating}
							onSuccess={handleEditSuccess}
							onCancel={() => setEditingRating(null)}
						/>
					)}
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<AlertDialog
				open={!!deletingRatingId}
				onOpenChange={() => setDeletingRatingId(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Xóa đánh giá</AlertDialogTitle>
						<AlertDialogDescription>
							Bạn có chắc chắn muốn xóa đánh giá này? Hành động này không thể hoàn tác.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Hủy</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							className="bg-red-600 hover:bg-red-700"
						>
							Xóa
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
