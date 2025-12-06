"use client";

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ListChecks, RefreshCcw, Search } from 'lucide-react';

import { getAILogs } from '@/actions/admin-ai.action';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { AILogEntry, AILogStatus, AdminAIPaginatedResponse } from '@/types/admin-ai';
import { LoaderState } from './loader-state';
import { PaginationControls } from './pagination-controls';
import { StatusBadge } from './badges';
import { formatDateTime, formatDuration } from './utils';
import { CellDetailDialog } from './cell-detail-dialog';

type LogCellType = 'id' | 'question' | 'status' | 'error' | 'duration' | 'created';

export function LogsPanel() {
	const [searchInput, setSearchInput] = useState('');
	const [search, setSearch] = useState('');
	const [status, setStatus] = useState<AILogStatus | 'all'>('all');
	const [limit, setLimit] = useState(20);
	const [offset, setOffset] = useState(0);
	const [selectedItem, setSelectedItem] = useState<AILogEntry | null>(null);
	const [selectedCell, setSelectedCell] = useState<LogCellType | null>(null);
	const [dialogOpen, setDialogOpen] = useState(false);

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

	const handleCellClick = (item: AILogEntry, cellType: LogCellType) => {
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
						<p className="text-sm font-mono text-foreground break-all">{selectedItem.id}</p>
						<p className="text-sm text-muted-foreground">ID của log entry này</p>
					</div>
				);
			case 'question':
				return (
					<div className="space-y-4">
						<div className="space-y-2">
							<h3 className="text-sm font-semibold text-foreground">Question</h3>
							<p className="text-sm text-foreground whitespace-pre-wrap bg-slate-50 border rounded-md p-4">
								{selectedItem.question}
							</p>
						</div>
						{selectedItem.response && (
							<div className="space-y-2">
								<h3 className="text-sm font-semibold text-foreground">Response</h3>
								<div className="text-sm text-foreground whitespace-pre-wrap bg-green-50 border border-green-200 rounded-md p-4 max-h-[300px] overflow-y-auto">
									{selectedItem.response}
								</div>
							</div>
						)}
					</div>
				);
			case 'status':
				return (
					<div className="space-y-2">
						<h3 className="text-sm font-semibold text-foreground">Status</h3>
						<StatusBadge status={selectedItem.status} />
						<p className="text-sm text-muted-foreground mt-2">Trạng thái xử lý của log này</p>
					</div>
				);
			case 'error':
				return (
					<div className="space-y-2">
						<h3 className="text-sm font-semibold text-red-600">Error</h3>
						{selectedItem.error ? (
							<div className="text-sm text-red-600 whitespace-pre-wrap bg-red-50 border border-red-200 rounded-md p-4 max-h-[400px] overflow-y-auto">
								{selectedItem.error}
							</div>
						) : (
							<p className="text-sm text-muted-foreground">Không có lỗi</p>
						)}
					</div>
				);
			case 'duration':
				return (
					<div className="space-y-2">
						<h3 className="text-sm font-semibold text-foreground">Duration</h3>
						<p className="text-2xl font-bold text-foreground">{formatDuration(selectedItem.totalDuration)}</p>
						<p className="text-sm text-muted-foreground">Thời gian xử lý của log này</p>
					</div>
				);
			case 'created':
				return (
					<div className="space-y-2">
						<h3 className="text-sm font-semibold text-foreground">Created At</h3>
						<p className="text-lg text-foreground">{formatDateTime(selectedItem.createdAt)}</p>
						<p className="text-sm text-muted-foreground">Thời gian tạo log này</p>
					</div>
				);
			default:
				return null;
		}
	};

	const getDialogTitle = () => {
		if (!selectedItem || !selectedCell) return '';
		const titles: Record<LogCellType, string> = {
			id: 'Log ID',
			question: 'Question & Response',
			status: 'Status',
			error: 'Error',
			duration: 'Duration',
			created: 'Created At',
		};
		return titles[selectedCell];
	};

	const getDialogDescription = () => {
		if (!selectedCell) return '';
		const descriptions: Record<LogCellType, string> = {
			id: 'ID của log entry',
			question: 'Câu hỏi và phản hồi',
			status: 'Trạng thái xử lý',
			error: 'Thông báo lỗi (nếu có)',
			duration: 'Thời gian xử lý',
			created: 'Thời gian tạo log',
		};
		return descriptions[selectedCell];
	};

	return (
		<div className="flex flex-col gap-2">
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
			<div className="rounded-lg border bg-white overflow-hidden">
				<div className="overflow-x-auto w-full">
					<Table className="min-w-[900px]">
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
											<TableCell
												className="font-semibold text-foreground cursor-pointer hover:bg-muted/50 transition-colors"
												onClick={() => handleCellClick(item, 'id')}
											>
												<span className="line-clamp-1 max-w-[120px]">{item.id}</span>
											</TableCell>
											<TableCell
												className="max-w-xl cursor-pointer hover:bg-muted/50 transition-colors"
												onClick={() => handleCellClick(item, 'question')}
											>
												<p className="line-clamp-2 text-foreground">{item.question}</p>
												{item.response && (
													<p className="text-xs text-muted-foreground line-clamp-1 mt-1">
														Resp: {item.response}
													</p>
												)}
											</TableCell>
											<TableCell
												className="cursor-pointer hover:bg-muted/50 transition-colors"
												onClick={() => handleCellClick(item, 'status')}
											>
												<StatusBadge status={item.status} />
											</TableCell>
											<TableCell
												className="max-w-xs cursor-pointer hover:bg-muted/50 transition-colors"
												onClick={() => handleCellClick(item, 'error')}
											>
												{item.error ? (
													<p className="text-sm text-red-600 line-clamp-2">{item.error}</p>
												) : (
													<span className="text-muted-foreground text-sm">-</span>
												)}
											</TableCell>
											<TableCell
												className="text-sm text-muted-foreground cursor-pointer hover:bg-muted/50 transition-colors"
												onClick={() => handleCellClick(item, 'duration')}
											>
												{formatDuration(item.totalDuration)}
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
