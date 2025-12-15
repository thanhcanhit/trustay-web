"use client";

import { ListChecks, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LogsPanelHeaderProps {
	limit: number;
	onLimitChange: (limit: number) => void;
	onRefresh: () => void;
}

export function LogsPanelHeader({ limit, onLimitChange, onRefresh }: LogsPanelHeaderProps) {
	return (
		<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
			<div className="flex items-center gap-2">
				<div className="bg-amber-50 text-amber-700 p-2 rounded-lg border border-amber-100">
					<ListChecks className="size-4" />
				</div>
				<div>
					<h2 className="text-base sm:text-lg font-semibold">Logs xử lý AI</h2>
					<p className="text-sm text-muted-foreground">Trạng thái, lỗi và thời gian phản hồi.</p>
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
