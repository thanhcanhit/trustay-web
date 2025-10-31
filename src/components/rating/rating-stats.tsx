'use client';

import { Star } from 'lucide-react';
import { RatingStars } from './rating-stars';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { RatingStatistics, RatingTargetType } from '@/types/types';
import { cn } from '@/lib/utils';

interface RatingStatsProps {
	statistics: RatingStatistics;
	targetType?: RatingTargetType;
	className?: string;
}

export function RatingStats({
	statistics,
	targetType,
	className,
}: RatingStatsProps) {
	const getTargetLabel = () => {
		switch (targetType) {
			case 'tenant':
				return 'Người thuê';
			case 'landlord':
				return 'Chủ trọ';
			case 'room':
				return 'Phòng trọ';
			default:
				return 'Đánh giá';
		}
	};

	// Calculate percentage for each star rating
	const getPercentage = (count: number) => {
		if (statistics.totalRatings === 0) return 0;
		return (count / statistics.totalRatings) * 100;
	};

	return (
		<Card className={cn('w-full', className)}>
			<CardHeader>
				<CardTitle>
					Đánh giá {getTargetLabel()} ({statistics.totalRatings})
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
					{/* Overall Rating */}
					<div className="flex flex-col items-center justify-center space-y-4 p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
						<div className="text-center">
							<div className="text-5xl font-bold text-gray-900">
								{statistics.averageRating.toFixed(1)}
							</div>
							<div className="mt-2">
								<RatingStars
									rating={statistics.averageRating}
									size="large"
									showValue={false}
								/>
							</div>
							<p className="text-sm text-gray-600 mt-2">
								Dựa trên {statistics.totalRatings}{' '}
								{statistics.totalRatings === 1 ? 'đánh giá' : 'đánh giá'}
							</p>
						</div>
					</div>

					{/* Rating Distribution */}
					<div className="space-y-3">
						{[5, 4, 3, 2, 1].map((stars) => {
							const count = statistics.distribution[
								stars as keyof typeof statistics.distribution
							];
							const percentage = getPercentage(count);

							const barColor =
								stars >= 4
									? 'bg-green-500'
									: stars === 3
										? 'bg-yellow-500'
										: stars === 2
											? 'bg-orange-500'
											: 'bg-red-500';

							return (
								<div key={stars} className="flex items-center gap-3">
									<div className="flex items-center gap-1 w-16">
										<span className="text-sm font-medium text-gray-700">
											{stars}
										</span>
										<Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
									</div>

									<div className="flex-1 bg-gray-200 rounded-full h-2">
										<div
											className={cn('h-full rounded-full transition-all', barColor)}
											style={{ width: `${percentage}%` }}
										/>
									</div>

									<div className="flex items-center gap-2 w-20 justify-end">
										<span className="text-sm text-gray-500">
											{count}
										</span>
										<span className="text-xs text-gray-400">
											({percentage.toFixed(0)}%)
										</span>
									</div>
								</div>
							);
						})}
					</div>
				</div>

				{/* Additional Stats */}
				<div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t">
					<div className="text-center">
						<div className="text-2xl font-bold text-green-600">
							{statistics.distribution[5] + statistics.distribution[4]}
						</div>
						<p className="text-xs text-gray-500 mt-1">Đánh giá tích cực</p>
					</div>
					<div className="text-center">
						<div className="text-2xl font-bold text-yellow-600">
							{statistics.distribution[3]}
						</div>
						<p className="text-xs text-gray-500 mt-1">Đánh giá trung lập</p>
					</div>
					<div className="text-center">
						<div className="text-2xl font-bold text-red-600">
							{statistics.distribution[2] + statistics.distribution[1]}
						</div>
						<p className="text-xs text-gray-500 mt-1">Đánh giá tiêu cực</p>
					</div>
					<div className="text-center">
						<div className="text-2xl font-bold text-blue-600">
							{(
								(getPercentage(statistics.distribution[5]) +
									getPercentage(statistics.distribution[4])) /
								(statistics.totalRatings > 0 ? 1 : 1)
							).toFixed(0)}
							%
						</div>
						<p className="text-xs text-gray-500 mt-1">Tỷ lệ hài lòng</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
