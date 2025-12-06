"use client";

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';

interface PaginationControlsProps {
	total: number;
	limit: number;
	offset: number;
	onPrev: () => void;
	onNext: () => void;
	isLoading?: boolean;
}

export function PaginationControls({
	total,
	limit,
	offset,
	onPrev,
	onNext,
	isLoading,
}: PaginationControlsProps) {
	const page = useMemo(() => Math.floor(offset / limit) + 1, [offset, limit]);
	const totalPages = useMemo(
		() => (total && limit ? Math.max(1, Math.ceil(total / limit)) : 1),
		[total, limit],
	);

	return (
		<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-sm text-muted-foreground">
			<div>
				<span className="font-medium text-foreground">{total}</span> bản ghi · Trang{' '}
				<span className="font-medium text-foreground">{page}</span>/{totalPages}
			</div>
			<div className="flex items-center gap-2">
				<Button variant="outline" size="sm" onClick={onPrev} disabled={isLoading || offset === 0}>
					Trước
				</Button>
				<Button
					variant="outline"
					size="sm"
					onClick={onNext}
					disabled={isLoading || offset + limit >= total}
				>
					Tiếp
				</Button>
			</div>
		</div>
	);
}
