"use client";

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BookOpenCheck, RefreshCcw, Search } from 'lucide-react';

import { getCanonicalEntries } from '@/actions/admin-ai.action';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { AICanonicalEntry, AdminAIPaginatedResponse } from '@/types/admin-ai';
import { PaginationControls } from './pagination-controls';
import { formatDateTime } from './utils';
import { LoaderState } from './loader-state';

export function CanonicalPanel() {
	const [searchInput, setSearchInput] = useState('');
	const [search, setSearch] = useState('');
	const [limit, setLimit] = useState(20);
	const [offset, setOffset] = useState(0);

	const { data, isLoading, isFetching, isError, error, refetch } = useQuery<
		AdminAIPaginatedResponse<AICanonicalEntry>,
		Error
	>({
		queryKey: ['admin-ai-canonical', search, limit, offset],
		queryFn: () =>
			getCanonicalEntries({
				search: search || undefined,
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
		setOffset(0);
		void refetch();
	};

	return (
		<Card className="shadow-sm">
			<CardHeader className="pb-4">
				<div className="flex flex-col gap-3">
					<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
						<div className="flex items-center gap-2">
							<div className="bg-emerald-50 text-emerald-700 p-2 rounded-lg border border-emerald-100">
								<BookOpenCheck className="size-4" />
							</div>
							<div>
								<CardTitle className="text-base sm:text-lg">Canonical SQL QA</CardTitle>
								<CardDescription>Danh sách QA đã dạy, kèm SQL và parameters.</CardDescription>
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
						<div className="flex-1 flex items-center gap-2">
							<div className="relative w-full">
								<Search className="size-4 text-muted-foreground absolute left-2.5 top-2.5" />
								<Input
									value={searchInput}
									onChange={(event) => setSearchInput(event.target.value)}
									placeholder="Tìm theo câu hỏi..."
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
									<TableHead>Câu hỏi</TableHead>
									<TableHead>SQL</TableHead>
									<TableHead>Created</TableHead>
									<TableHead>Last used</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								<LoaderState
									isLoading={isLoading}
									isError={isError}
									errorMessage={error?.message}
									empty={isEmpty}
									emptyLabel="Chưa có canonical nào"
									colSpan={5}
								/>

								{!isLoading &&
									!isError &&
									data?.items.map((item) => (
										<TableRow key={item.id}>
											<TableCell className="font-semibold text-foreground">{item.id}</TableCell>
											<TableCell className="max-w-sm">
												<p className="line-clamp-2 font-medium text-foreground">{item.question}</p>
												<p className="text-xs text-muted-foreground">
													Params: {item.parameters ? JSON.stringify(item.parameters) : 'N/A'}
												</p>
											</TableCell>
											<TableCell className="max-w-xl">
												<div className="text-xs font-mono bg-slate-50 border rounded-md p-2 leading-relaxed line-clamp-3">
													{item.sqlCanonical}
												</div>
												{item.sqlTemplate && (
													<p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
														Template: {item.sqlTemplate}
													</p>
												)}
											</TableCell>
											<TableCell className="text-sm text-muted-foreground">
												{formatDateTime(item.createdAt)}
											</TableCell>
											<TableCell className="text-sm text-muted-foreground">
												{item.lastUsedAt ? formatDateTime(item.lastUsedAt) : 'Chưa dùng'}
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
