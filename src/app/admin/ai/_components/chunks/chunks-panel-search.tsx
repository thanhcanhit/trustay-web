"use client";

import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { AICollection } from '@/types/admin-ai';

interface ChunksPanelSearchProps {
	searchInput: string;
	onSearchInputChange: (value: string) => void;
	collection: AICollection | 'all';
	onCollectionChange: (collection: AICollection | 'all') => void;
	onSearch: (event: React.FormEvent<HTMLFormElement>) => void;
	onReset: () => void;
}

export function ChunksPanelSearch({
	searchInput,
	onSearchInputChange,
	collection,
	onCollectionChange,
	onSearch,
	onReset,
}: ChunksPanelSearchProps) {
	return (
		<form onSubmit={onSearch} className="flex flex-col gap-2 sm:flex-row sm:items-center">
			<div className="flex flex-1 flex-wrap items-center gap-2">
				<Select
					value={collection}
					onValueChange={(value) => onCollectionChange(value as AICollection | 'all')}
				>
					<SelectTrigger size="sm" className="w-[160px]">
						<SelectValue placeholder="Collection" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">Tất cả collections</SelectItem>
						<SelectItem value="schema">schema</SelectItem>
						<SelectItem value="qa">qa</SelectItem>
						<SelectItem value="business">business</SelectItem>
						<SelectItem value="docs">docs</SelectItem>
					</SelectContent>
				</Select>
				<div className="relative flex-1 min-w-[200px]">
					<Search className="size-4 text-muted-foreground absolute left-2.5 top-2.5" />
					<Input
						value={searchInput}
						onChange={(event) => onSearchInputChange(event.target.value)}
						placeholder="Tìm trong nội dung chunk..."
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
