"use client";

import { Loader2 } from 'lucide-react';
import { TableCell, TableRow } from '@/components/ui/table';

interface LoaderStateProps {
	isLoading: boolean;
	isError: boolean;
	errorMessage?: string;
	empty: boolean;
	emptyLabel: string;
	colSpan: number;
}

export function LoaderState({
	isLoading,
	isError,
	errorMessage,
	empty,
	emptyLabel,
	colSpan,
}: LoaderStateProps) {
	if (isLoading) {
		return (
			<TableRow>
				<TableCell colSpan={colSpan} className="text-center py-10">
					<div className="flex items-center justify-center gap-2 text-muted-foreground">
						<Loader2 className="size-4 animate-spin" />
						Đang tải dữ liệu...
					</div>
				</TableCell>
			</TableRow>
		);
	}

	if (isError) {
		return (
			<TableRow>
				<TableCell colSpan={colSpan} className="text-center text-red-600 py-10">
					{errorMessage || 'Không thể tải dữ liệu'}
				</TableCell>
			</TableRow>
		);
	}

	if (empty) {
		return (
			<TableRow>
				<TableCell colSpan={colSpan} className="text-center py-8 text-muted-foreground">
					{emptyLabel}
				</TableCell>
			</TableRow>
		);
	}

	return null;
}
