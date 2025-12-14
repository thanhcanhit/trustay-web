"use client";

import { BookOpenCheck, RefreshCcw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CanonicalPanelHeaderProps {
	limit: number;
	onLimitChange: (limit: number) => void;
	onRefresh: () => void;
	onExport: (format: 'json' | 'csv') => void;
	isExporting: boolean;
}

export function CanonicalPanelHeader({
	limit,
	onLimitChange,
	onRefresh,
	onExport,
	isExporting,
}: CanonicalPanelHeaderProps) {
	return (
		<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
			<div className="flex items-center gap-2">
				<div className="bg-emerald-50 text-emerald-700 p-2 rounded-lg border border-emerald-100">
					<BookOpenCheck className="size-4" />
				</div>
				<div>
					<h2 className="text-base sm:text-lg font-semibold">Canonical SQL QA</h2>
					<p className="text-sm text-muted-foreground">Danh sách QA đã dạy, kèm SQL và parameters.</p>
				</div>
			</div>
			<div className="flex items-center gap-2">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" size="sm" disabled={isExporting}>
							<Download className="size-4 mr-2" />
							Export Golden Data
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem onClick={() => onExport('json')} disabled={isExporting}>
							Export Golden Data (JSON)
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => onExport('csv')} disabled={isExporting}>
							Export Golden Data (CSV)
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
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
