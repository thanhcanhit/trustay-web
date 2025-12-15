"use client";

import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { PendingKnowledgeStatus } from '@/types/admin-ai';

interface PendingKnowledgePanelSearchProps {
	searchInput: string;
	onSearchInputChange: (value: string) => void;
	status: PendingKnowledgeStatus | 'all';
	onStatusChange: (status: PendingKnowledgeStatus | 'all') => void;
	onSearch: (event: React.FormEvent<HTMLFormElement>) => void;
	onReset: () => void;
}

export function PendingKnowledgePanelSearch({
	searchInput,
	onSearchInputChange,
	status,
	onStatusChange,
	onSearch,
	onReset,
}: PendingKnowledgePanelSearchProps) {
	return (
		<form onSubmit={onSearch} className="flex flex-col gap-2 sm:flex-row sm:items-center">
			<div className="flex flex-1 flex-wrap items-center gap-2">
				<Select
					value={status}
					onValueChange={(value) => onStatusChange(value as PendingKnowledgeStatus | 'all')}
				>
					<SelectTrigger size="sm" className="w-[160px]">
						<SelectValue placeholder="Trạng thái" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">Tất cả trạng thái</SelectItem>
						<SelectItem value="pending">pending</SelectItem>
						<SelectItem value="approved">approved</SelectItem>
						<SelectItem value="rejected">rejected</SelectItem>
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
