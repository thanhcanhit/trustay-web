'use client';

import { formatDistanceToNow } from 'date-fns';
import { MoreVertical, CheckCircle2, Pencil, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { RatingStars } from './rating-stars';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { RatingResponseDto } from '@/types/types';
import { cn } from '@/lib/utils';

interface RatingItemProps {
	rating: RatingResponseDto;
	onEdit?: (rating: RatingResponseDto) => void;
	onDelete?: (ratingId: string) => void;
	className?: string;
}

export function RatingItem({
	rating,
	onEdit,
	onDelete,
	className,
}: RatingItemProps) {
	const getInitials = (firstName: string, lastName: string) => {
		return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
	};

	return (
		<div
			className={cn(
				'p-6 bg-white border rounded-lg space-y-4',
				{
					'border-blue-200 bg-blue-50/30': rating.isCurrentUser,
				},
				className,
			)}
		>
			{/* Header: Reviewer Info + Actions */}
			<div className="flex items-start justify-between">
				<div className="flex items-start gap-3">
					<Avatar className="h-12 w-12">
						<AvatarImage
							src={rating.reviewer.avatarUrl || undefined}
							alt={`${rating.reviewer.firstName} ${rating.reviewer.lastName}`}
						/>
						<AvatarFallback>
							{getInitials(
								rating.reviewer.firstName,
								rating.reviewer.lastName,
							)}
						</AvatarFallback>
					</Avatar>

					<div className="space-y-1">
						<div className="flex items-center gap-2">
							<h4 className="font-semibold text-gray-900">
								{rating.reviewer.firstName} {rating.reviewer.lastName}
							</h4>
							{rating.reviewer.isVerified && (
								<Badge variant="secondary" className="gap-1">
									<CheckCircle2 className="w-3 h-3" />
									Đã xác minh
								</Badge>
							)}
							{rating.isCurrentUser && (
								<Badge variant="default">Đánh giá của bạn</Badge>
							)}
						</div>
						<p className="text-sm text-gray-500">
							{formatDistanceToNow(new Date(rating.createdAt), {
								addSuffix: true,
							})}
						</p>
					</div>
				</div>

				{/* Actions Menu (only for current user) */}
				{rating.isCurrentUser && (onEdit || onDelete) && (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="icon">
								<MoreVertical className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							{onEdit && (
								<DropdownMenuItem onClick={() => onEdit(rating)}>
									<Pencil className="mr-2 h-4 w-4" />
									Chỉnh sửa đánh giá
								</DropdownMenuItem>
							)}
							{onDelete && (
								<DropdownMenuItem
									onClick={() => onDelete(rating.id)}
									className="text-red-600 focus:text-red-600"
								>
									<Trash2 className="mr-2 h-4 w-4" />
									Xóa đánh giá
								</DropdownMenuItem>
							)}
						</DropdownMenuContent>
					</DropdownMenu>
				)}
			</div>

			{/* Rating Stars */}
			<div>
				<RatingStars rating={rating.rating} size="medium" showValue={false} />
			</div>

			{/* Review Content */}
			{rating.content && (
				<p className="text-gray-700 leading-relaxed">{rating.content}</p>
			)}

			{/* Review Images */}
			{rating.images && rating.images.length > 0 && (
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
					{rating.images.map((imageUrl, index) => (
						<div
							key={index}
							className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
						>
							<Image
								src={imageUrl}
								alt={`Review image ${index + 1}`}
								fill
								className="object-cover"
							/>
						</div>
					))}
				</div>
			)}

			{/* Updated indicator */}
			{rating.createdAt !== rating.updatedAt && (
				<p className="text-xs text-gray-400 italic">Edited</p>
			)}
		</div>
	);
}
