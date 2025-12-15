"use client";

import { Clock, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PendingKnowledgePanelHeaderProps {
	limit: number;
	onLimitChange: (limit: number) => void;
	onRefresh: () => void;
}

export function PendingKnowledgePanelHeader({
	limit,
	onLimitChange,
	onRefresh,
}: PendingKnowledgePanelHeaderProps) {
	return (
		<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
			<div className="flex items-center gap-2">
				<div className="bg-blue-50 text-blue-700 p-2 rounded-lg border border-blue-100">
					<Clock className="size-4" />
				</div>
				<div>
					<h2 className="text-base sm:text-lg font-semibold">Pending Knowledge</h2>
					<p className="text-sm text-muted-foreground">
						Xác minh và approve/reject các câu SQL đã được AI validate.
					</p>
				</div>
			</div>
			<div className="flex items-center gap-2">
				<Select
					value={limit.toString()}
					onValueChange={(value) => {
						const parsed = Number(value);
						onLimitChange(parsed);
					}}
				>
					<SelectTrigger size="sm" className="w-[120px]">
						<SelectValue placeholder="Số bản ghi" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="10">10 / trang</SelectItem>
						<SelectItem value="20">20 / trang</SelectItem>
						<SelectItem value="50">50 / trang</SelectItem>
					</SelectContent>
				</Select>
				<Button variant="outline" size="icon" onClick={onRefresh}>
					<RefreshCcw className="size-4" />
				</Button>
			</div>
		</div>
	);
}
