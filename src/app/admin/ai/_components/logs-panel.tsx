"use client";

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ListChecks, RefreshCcw, Search } from 'lucide-react';

import { getAILogs } from '@/actions/admin-ai.action';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { AILogEntry, AILogStatus, AdminAIPaginatedResponse } from '@/types/admin-ai';
import { LoaderState } from './loader-state';
import { PaginationControls } from './pagination-controls';
import { StatusBadge } from './badges';
import { formatDateTime, formatDuration } from './utils';

export function LogsPanel() {
	const [searchInput, setSearchInput] = useState('');
	const [search, setSearch] = useState('');
	const [status, setStatus] = useState<AILogStatus | 'all'>('all');
	const [limit, setLimit] = useState(20);
	const [offset, setOffset] = useState(0);

	const { data, isLoading, isFetching, isError, error, refetch } = useQuery<
		AdminAIPaginatedResponse<AILogEntry>,
		Error
	>({
		queryKey: ['admin-ai-logs', search, status, limit, offset],
		queryFn: () =>
			getAILogs({
				search: search || undefined,
				status: status === 'all' ? undefined : status,
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
		setStatus('all');
		setOffset(0);
		void refetch();
	};

	return (
		<Card className="shadow-sm">
			<CardHeader className="pb-4">
				<div className="flex flex-col gap-3">
					<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
						<div className="flex items-center gap-2">
							<div className="bg-amber-50 text-amber-700 p-2 rounded-lg border border-amber-100">
								<ListChecks className="size-4" />
							</div>
							<div>
								<CardTitle className="text-base sm:text-lg">Logs xử lý AI</CardTitle>
								<CardDescription>Trạng thái, lỗi và thời gian phản hồi.</CardDescription>
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
								value={status}
								onValueChange={(value) => {
									setStatus(value as AILogStatus | 'all');
									setOffset(0);
								}}
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
									<TableHead className="w-20">ID</TableHead>
									<TableHead>Câu hỏi</TableHead>
									<TableHead>Trạng thái</TableHead>
									<TableHead>Error</TableHead>
									<TableHead>Duration</TableHead>
									<TableHead>Created</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								<LoaderState
									isLoading={isLoading}
									isError={isError}
									errorMessage={error?.message}
									empty={isEmpty}
									emptyLabel="Chưa có log nào"
									colSpan={6}
								/>

								{!isLoading &&
									!isError &&
									data?.items.map((item) => (
										<TableRow key={item.id}>
											<TableCell className="font-semibold text-foreground">
												<span className="line-clamp-1 max-w-[120px]">{item.id}</span>
											</TableCell>
											<TableCell className="max-w-xl">
												<p className="line-clamp-2 text-foreground">{item.question}</p>
												{item.response && (
													<p className="text-xs text-muted-foreground line-clamp-1 mt-1">
														Resp: {item.response}
													</p>
												)}
											</TableCell>
											<TableCell>
												<StatusBadge status={item.status} />
											</TableCell>
											<TableCell className="max-w-xs">
												{item.error ? (
													<p className="text-sm text-red-600 line-clamp-2">{item.error}</p>
												) : (
													<span className="text-muted-foreground text-sm">-</span>
												)}
											</TableCell>
											<TableCell className="text-sm text-muted-foreground">
												{formatDuration(item.totalDuration)}
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
