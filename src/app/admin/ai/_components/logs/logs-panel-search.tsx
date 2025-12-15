"use client";

import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { AILogStatus } from '@/types/admin-ai';

interface LogsPanelSearchProps {
	searchInput: string;
	onSearchInputChange: (value: string) => void;
	status: AILogStatus | 'all';
	onStatusChange: (status: AILogStatus | 'all') => void;
	onSearch: (event: React.FormEvent<HTMLFormElement>) => void;
	onReset: () => void;
}

export function LogsPanelSearch({
	searchInput,
	onSearchInputChange,
	status,
	onStatusChange,
	onSearch,
	onReset,
}: LogsPanelSearchProps) {
	return (
		<form onSubmit={onSearch} className="flex flex-col gap-2 sm:flex-row sm:items-center">
			<div className="flex flex-1 flex-wrap items-center gap-2">
				<Select
					value={status}
					onValueChange={(value) => onStatusChange(value as AILogStatus | 'all')}
				>
					<SelectTrigger size="sm" className="w-[160px]">
						<SelectValue placeholder="Trạng thái" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">Tất cả trạng thái</SelectItem>
						<SelectItem value="completed">completed</SelectItem>
						<SelectItem value="failed">failed</SelectItem>
						<SelectItem value="partial">partial</SelectItem>
					</SelectContent>
				</Select>
				<div className="relative flex-1 min-w-[200px]">
					<Search className="size-4 text-muted-foreground absolute left-2.5 top-2.5" />
					<Input
						value={searchInput}
						onChange={(event) => onSearchInputChange(event.target.value)}
						placeholder="Tìm theo câu hỏi..."
						className="pl-9"
					/>
				</div>
				<Button type="submit" variant="default">
					Tìm
				</Button>
				<Button type="button" variant="ghost" onClick={onReset}>
					Xóa
				</Button>
			</div>
		</form>
	);
}
