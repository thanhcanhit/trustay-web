'use client';

import { Star } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface RatingStarsProps {
	rating: number; // 0-5
	size?: 'small' | 'medium' | 'large';
	showValue?: boolean; // Hiển thị số rating
	interactive?: boolean; // Cho phép click để rate
	onChange?: (rating: number) => void;
	className?: string;
}

const sizeClasses = {
	small: 'w-4 h-4',
	medium: 'w-5 h-5',
	large: 'w-6 h-6',
};

const textSizeClasses = {
	small: 'text-sm',
	medium: 'text-base',
	large: 'text-lg',
};

export function RatingStars({
	rating,
	size = 'medium',
	showValue = true,
	interactive = false,
	onChange,
	className,
}: RatingStarsProps) {
	const [hoverRating, setHoverRating] = useState(0);
	const displayRating = interactive ? hoverRating || rating : rating;

	const handleClick = (star: number) => {
		if (interactive && onChange) {
			onChange(star);
		}
	};

	const handleMouseEnter = (star: number) => {
		if (interactive) {
			setHoverRating(star);
		}
	};

	const handleMouseLeave = () => {
		if (interactive) {
			setHoverRating(0);
		}
	};

	return (
		<div className={cn('flex items-center gap-1', className)}>
			<div className="flex items-center gap-0.5">
				{[1, 2, 3, 4, 5].map((star) => {
					const isFilled = star <= displayRating;
					const isPartiallyFilled =
						star > Math.floor(displayRating) &&
						star <= Math.ceil(displayRating) &&
						!interactive;
					const fillPercentage =
						isPartiallyFilled ? (displayRating % 1) * 100 : 0;

					return (
						<div
							key={star}
							className={cn('relative', {
								'cursor-pointer': interactive,
							})}
							onClick={() => handleClick(star)}
							onMouseEnter={() => handleMouseEnter(star)}
							onMouseLeave={handleMouseLeave}
						>
							{isPartiallyFilled ? (
								<div className="relative">
									<Star
										className={cn(
											sizeClasses[size],
											'text-gray-300 fill-gray-300',
										)}
									/>
									<div
										className="absolute top-0 left-0 overflow-hidden"
										style={{ width: `${fillPercentage}%` }}
									>
										<Star
											className={cn(
												sizeClasses[size],
												'text-yellow-400 fill-yellow-400',
											)}
										/>
									</div>
								</div>
							) : (
								<Star
									className={cn(sizeClasses[size], {
										'text-yellow-400 fill-yellow-400': isFilled,
										'text-gray-300 fill-gray-300': !isFilled,
										'transition-colors duration-200': interactive,
										'hover:text-yellow-400 hover:fill-yellow-400': interactive,
									})}
								/>
							)}
						</div>
					);
				})}
			</div>

			{showValue && (
				<span
					className={cn(
						'font-medium text-gray-700',
						textSizeClasses[size],
					)}
				>
					{rating.toFixed(1)}
				</span>
			)}
		</div>
	);
}
