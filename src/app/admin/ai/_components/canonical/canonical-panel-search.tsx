"use client";

import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CanonicalPanelSearchProps {
	searchInput: string;
	onSearchInputChange: (value: string) => void;
	onSearch: (event: React.FormEvent<HTMLFormElement>) => void;
	onReset: () => void;
}

export function CanonicalPanelSearch({
	searchInput,
	onSearchInputChange,
	onSearch,
	onReset,
}: CanonicalPanelSearchProps) {
	return (
		<form onSubmit={onSearch} className="flex flex-col gap-2 sm:flex-row sm:items-center">
			<div className="flex-1 flex items-center gap-2">
				<div className="relative w-full">
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
