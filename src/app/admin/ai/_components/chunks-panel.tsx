"use client";

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Database, RefreshCcw, Search } from 'lucide-react';

import { getAIChunks } from '@/actions/admin-ai.action';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { AIChunk, AICollection, AdminAIPaginatedResponse } from '@/types/admin-ai';
import { CollectionBadge } from './badges';
import { LoaderState } from './loader-state';
import { PaginationControls } from './pagination-controls';
import { formatDateTime } from './utils';
import { CellDetailDialog } from './cell-detail-dialog';

type ChunkCellType = 'id' | 'collection' | 'content' | 'created';

export function ChunksPanel() {
	const [searchInput, setSearchInput] = useState('');
	const [search, setSearch] = useState('');
	const [collection, setCollection] = useState<AICollection | 'all'>('all');
	const [limit, setLimit] = useState(20);
	const [offset, setOffset] = useState(0);
	const [selectedItem, setSelectedItem] = useState<AIChunk | null>(null);
	const [selectedCell, setSelectedCell] = useState<ChunkCellType | null>(null);
	const [dialogOpen, setDialogOpen] = useState(false);

	const { data, isLoading, isFetching, isError, error, refetch } = useQuery<
		AdminAIPaginatedResponse<AIChunk>,
		Error
	>({
		queryKey: ['admin-ai-chunks', search, collection, limit, offset],
		queryFn: () =>
			getAIChunks({
				search: search || undefined,
				collection: collection === 'all' ? undefined : collection,
				limit,
				offset,
			}),
		placeholderData: (previousData) => previousData,
	});

	const total = data?.total ?? 0;
	const isEmpty = !isLoading && !isError && (data?.items.length ?? 0) === 0;

	const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setOffset(0);
		setSearch(searchInput.trim());
	};

	const handleReset = () => {
		setSearch('');
		setSearchInput('');
		setCollection('all');
		setOffset(0);
		void refetch();
	};

	const handleCellClick = (item: AIChunk, cellType: ChunkCellType) => {
		setSelectedItem(item);
		setSelectedCell(cellType);
		setDialogOpen(true);
	};

	const getDialogContent = () => {
		if (!selectedItem || !selectedCell) return null;

		switch (selectedCell) {
			case 'id':
				return (
					<div className="space-y-2">
						<p className="text-2xl font-bold text-foreground">{selectedItem.id}</p>
						<p className="text-sm text-muted-foreground">ID của chunk này</p>
					</div>
				);
			case 'collection':
				return (
					<div className="space-y-2">
						<h3 className="text-sm font-semibold text-foreground">Collection</h3>
						<CollectionBadge collection={selectedItem.collection} />
						<p className="text-sm text-muted-foreground mt-2">Loại collection của chunk này</p>
					</div>
				);
			case 'content':
				return (
					<div className="space-y-2">
						<h3 className="text-sm font-semibold text-foreground">Content</h3>
						<div className="text-sm text-foreground whitespace-pre-wrap bg-slate-50 border rounded-md p-4 max-h-[500px] overflow-y-auto">
							{selectedItem.content}
						</div>
					</div>
				);
			case 'created':
				return (
					<div className="space-y-2">
						<h3 className="text-sm font-semibold text-foreground">Created At</h3>
						<p className="text-lg text-foreground">{formatDateTime(selectedItem.createdAt)}</p>
						<p className="text-sm text-muted-foreground">Thời gian tạo chunk này</p>
						{selectedItem.updatedAt && (
							<>
								<h3 className="text-sm font-semibold text-foreground mt-4">Updated At</h3>
								<p className="text-lg text-foreground">{formatDateTime(selectedItem.updatedAt)}</p>
							</>
						)}
					</div>
				);
			default:
				return null;
		}
	};

	const getDialogTitle = () => {
		if (!selectedItem || !selectedCell) return '';
		const titles: Record<ChunkCellType, string> = {
			id: `ID - Chunk #${selectedItem.id}`,
			collection: 'Collection',
			content: 'Content',
			created: 'Timestamps',
		};
		return titles[selectedCell];
	};

	const getDialogDescription = () => {
		if (!selectedCell) return '';
		const descriptions: Record<ChunkCellType, string> = {
			id: 'ID của chunk',
			collection: 'Loại collection',
			content: 'Nội dung của chunk',
			created: 'Thời gian tạo và cập nhật',
		};
		return descriptions[selectedCell];
	};

	return (
		<div className="flex flex-col gap-2">
			<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-2">
					<div className="bg-blue-50 text-blue-700 p-2 rounded-lg border border-blue-100">
						<Database className="size-4" />
					</div>
					<div>
						<h2 className="text-base sm:text-lg font-semibold">Chunks (vector store)</h2>
						<p className="text-sm text-muted-foreground">Tìm, lọc theo collection.</p>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Select
						value={limit.toString()}
						onValueChange={(value) => {
							const parsed = Number(value);
							setLimit(parsed);
							setOffset(0);
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
					<Button variant="outline" size="icon" onClick={() => void refetch()}>
						<RefreshCcw className="size-4" />
					</Button>
				</div>
			</div>
			<form onSubmit={handleSearch} className="flex flex-col gap-2 sm:flex-row sm:items-center">
				<div className="flex flex-1 flex-wrap items-center gap-2">
					<Select
						value={collection}
						onValueChange={(value) => {
							setCollection(value as AICollection | 'all');
							setOffset(0);
						}}
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
							onChange={(event) => setSearchInput(event.target.value)}
							placeholder="Tìm trong nội dung chunk..."
							className="pl-9"
						/>
					</div>
					<Button type="submit" variant="default">
						Tìm
					</Button>
					<Button type="button" variant="ghost" onClick={handleReset}>
						Xóa
					</Button>
				</div>
			</form>
			<div className="rounded-lg border bg-white overflow-hidden">
				<div className="overflow-x-auto w-full">
					<Table className="min-w-[600px]">
						<TableHeader>
							<TableRow>
								<TableHead className="w-16">ID</TableHead>
								<TableHead>Collection</TableHead>
								<TableHead>Nội dung</TableHead>
								<TableHead>Created</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							<LoaderState
								isLoading={isLoading}
								isError={isError}
								errorMessage={error?.message}
								empty={isEmpty}
								emptyLabel="Chưa có chunk nào"
								colSpan={4}
							/>

							{!isLoading &&
								!isError &&
								data?.items.map((item) => (
									<TableRow key={item.id}>
										<TableCell
											className="font-semibold text-foreground cursor-pointer hover:bg-muted/50 transition-colors"
											onClick={() => handleCellClick(item, 'id')}
										>
											{item.id}
										</TableCell>
										<TableCell
											className="cursor-pointer hover:bg-muted/50 transition-colors"
											onClick={() => handleCellClick(item, 'collection')}
										>
											<CollectionBadge collection={item.collection} />
										</TableCell>
										<TableCell
											className="max-w-3xl cursor-pointer hover:bg-muted/50 transition-colors"
											onClick={() => handleCellClick(item, 'content')}
										>
											<p className="line-clamp-3 text-foreground">{item.content}</p>
										</TableCell>
										<TableCell
											className="text-sm text-muted-foreground cursor-pointer hover:bg-muted/50 transition-colors"
											onClick={() => handleCellClick(item, 'created')}
										>
											{formatDateTime(item.createdAt)}
										</TableCell>
									</TableRow>
								))}
						</TableBody>
					</Table>
				</div>
			</div>

			<PaginationControls
				total={total}
				limit={limit}
				offset={offset}
				onPrev={() => setOffset(Math.max(0, offset - limit))}
				onNext={() => setOffset(offset + limit)}
				isLoading={isFetching}
			/>

			<CellDetailDialog
				open={dialogOpen}
				onOpenChange={setDialogOpen}
				title={getDialogTitle()}
				description={getDialogDescription()}
				content={getDialogContent()}
			/>
		</div>
	);
}
