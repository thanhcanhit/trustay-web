"use client";

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Database, RefreshCcw, Search } from 'lucide-react';

import { getAIChunks } from '@/actions/admin-ai.action';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { AIChunk, AICollection, AdminAIPaginatedResponse } from '@/types/admin-ai';
import { CollectionBadge } from './badges';
import { LoaderState } from './loader-state';
import { PaginationControls } from './pagination-controls';
import { formatDateTime } from './utils';

export function ChunksPanel() {
	const [searchInput, setSearchInput] = useState('');
	const [search, setSearch] = useState('');
	const [collection, setCollection] = useState<AICollection | 'all'>('all');
	const [limit, setLimit] = useState(20);
	const [offset, setOffset] = useState(0);

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

	return (
		<Card className="shadow-sm">
			<CardHeader className="pb-4">
				<div className="flex flex-col gap-3">
					<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
						<div className="flex items-center gap-2">
							<div className="bg-blue-50 text-blue-700 p-2 rounded-lg border border-blue-100">
								<Database className="size-4" />
							</div>
							<div>
								<CardTitle className="text-base sm:text-lg">Chunks (vector store)</CardTitle>
								<CardDescription>Tìm, lọc theo collection.</CardDescription>
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
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="rounded-lg border bg-white">
					<div className="overflow-x-auto">
						<Table>
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
											<TableCell className="font-semibold text-foreground">{item.id}</TableCell>
											<TableCell>
												<CollectionBadge collection={item.collection} />
											</TableCell>
											<TableCell className="max-w-3xl">
												<p className="line-clamp-3 text-foreground">{item.content}</p>
											</TableCell>
											<TableCell className="text-sm text-muted-foreground">
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
			</CardContent>
		</Card>
	);
}
