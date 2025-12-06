"use client";

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BookOpenCheck, RefreshCcw, Search } from 'lucide-react';

import { getCanonicalEntries } from '@/actions/admin-ai.action';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { AICanonicalEntry, AdminAIPaginatedResponse } from '@/types/admin-ai';
import { PaginationControls } from './pagination-controls';
import { formatDateTime } from './utils';
import { LoaderState } from './loader-state';
import { CellDetailDialog } from './cell-detail-dialog';

type CellType = 'id' | 'question' | 'sql' | 'created' | 'lastUsed';

export function CanonicalPanel() {
	const [searchInput, setSearchInput] = useState('');
	const [search, setSearch] = useState('');
	const [limit, setLimit] = useState(20);
	const [offset, setOffset] = useState(0);
	const [selectedItem, setSelectedItem] = useState<AICanonicalEntry | null>(null);
	const [selectedCell, setSelectedCell] = useState<CellType | null>(null);
	const [dialogOpen, setDialogOpen] = useState(false);

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

	const handleCellClick = (item: AICanonicalEntry, cellType: CellType) => {
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
						<p className="text-sm text-muted-foreground">ID của canonical entry này</p>
					</div>
				);
			case 'question':
				return (
					<div className="space-y-4">
						<div className="space-y-2">
							<h3 className="text-sm font-semibold text-foreground">Câu hỏi</h3>
							<p className="text-sm text-foreground whitespace-pre-wrap bg-slate-50 border rounded-md p-4">
								{selectedItem.question}
							</p>
						</div>
						{selectedItem.parameters && Object.keys(selectedItem.parameters).length > 0 && (
							<div className="space-y-2">
								<h3 className="text-sm font-semibold text-foreground">Parameters</h3>
								<pre className="text-xs font-mono bg-slate-50 border rounded-md p-4 overflow-x-auto">
									{JSON.stringify(selectedItem.parameters, null, 2)}
								</pre>
							</div>
						)}
					</div>
				);
			case 'sql':
				return (
					<div className="space-y-4">
						<div className="space-y-2">
							<h3 className="text-sm font-semibold text-foreground">SQL Canonical</h3>
							<pre className="text-xs font-mono bg-slate-50 border rounded-md p-4 overflow-x-auto whitespace-pre-wrap">
								{selectedItem.sqlCanonical}
							</pre>
						</div>
						{selectedItem.sqlTemplate && (
							<div className="space-y-2">
								<h3 className="text-sm font-semibold text-foreground">SQL Template</h3>
								<pre className="text-xs font-mono bg-slate-50 border rounded-md p-4 overflow-x-auto whitespace-pre-wrap">
									{selectedItem.sqlTemplate}
								</pre>
							</div>
						)}
					</div>
				);
			case 'created':
				return (
					<div className="space-y-2">
						<h3 className="text-sm font-semibold text-foreground">Created At</h3>
						<p className="text-lg text-foreground">{formatDateTime(selectedItem.createdAt)}</p>
						<p className="text-sm text-muted-foreground">Thời gian tạo entry này</p>
					</div>
				);
			case 'lastUsed':
				return (
					<div className="space-y-2">
						<h3 className="text-sm font-semibold text-foreground">Last Used At</h3>
						<p className="text-lg text-foreground">
							{selectedItem.lastUsedAt ? formatDateTime(selectedItem.lastUsedAt) : 'Chưa dùng'}
						</p>
						<p className="text-sm text-muted-foreground">
							{selectedItem.lastUsedAt ? 'Thời gian sử dụng lần cuối' : 'Entry này chưa được sử dụng'}
						</p>
					</div>
				);
			default:
				return null;
		}
	};

	const getDialogTitle = () => {
		if (!selectedItem || !selectedCell) return '';
		const titles: Record<CellType, string> = {
			id: `ID - Entry #${selectedItem.id}`,
			question: 'Câu hỏi',
			sql: 'SQL Query',
			created: 'Created At',
			lastUsed: 'Last Used At',
		};
		return titles[selectedCell];
	};

	const getDialogDescription = () => {
		if (!selectedCell) return '';
		const descriptions: Record<CellType, string> = {
			id: 'ID của canonical entry',
			question: 'Câu hỏi và parameters',
			sql: 'SQL canonical và template',
			created: 'Thời gian tạo entry',
			lastUsed: 'Thời gian sử dụng lần cuối',
		};
		return descriptions[selectedCell];
	};

	return (
		<div className="flex flex-col gap-2">
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
			<div className="rounded-lg border bg-white overflow-hidden">
				<div className="overflow-x-auto w-full">
					<Table className="min-w-[800px]">
						<TableHeader>
								<TableRow>
									<TableHead className="w-16 min-w-[64px]">ID</TableHead>
									<TableHead className="min-w-[200px]">Câu hỏi</TableHead>
									<TableHead className="min-w-[300px]">SQL</TableHead>
									<TableHead className="min-w-[150px]">Created</TableHead>
									<TableHead className="min-w-[150px]">Last used</TableHead>
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
										<TableCell
											className="font-semibold text-foreground cursor-pointer hover:bg-muted/50 transition-colors"
											onClick={() => handleCellClick(item, 'id')}
										>
											{item.id}
										</TableCell>
										<TableCell
											className="min-w-[200px] max-w-[250px] cursor-pointer hover:bg-muted/50 transition-colors"
											onClick={() => handleCellClick(item, 'question')}
										>
											<p className="line-clamp-2 font-medium text-foreground break-words">{item.question}</p>
											<p className="text-xs text-muted-foreground truncate">
												Params: {item.parameters ? JSON.stringify(item.parameters) : 'N/A'}
											</p>
										</TableCell>
										<TableCell
											className="min-w-[300px] max-w-[400px] cursor-pointer hover:bg-muted/50 transition-colors"
											onClick={() => handleCellClick(item, 'sql')}
										>
											<div className="text-xs font-mono bg-slate-50 border rounded-md p-2 leading-relaxed line-clamp-3 break-words">
												{item.sqlCanonical}
											</div>
											{item.sqlTemplate && (
												<p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 truncate">
													Template: {item.sqlTemplate}
												</p>
											)}
										</TableCell>
										<TableCell
											className="text-sm text-muted-foreground min-w-[150px] whitespace-nowrap cursor-pointer hover:bg-muted/50 transition-colors"
											onClick={() => handleCellClick(item, 'created')}
										>
											{formatDateTime(item.createdAt)}
										</TableCell>
										<TableCell
											className="text-sm text-muted-foreground min-w-[150px] whitespace-nowrap cursor-pointer hover:bg-muted/50 transition-colors"
											onClick={() => handleCellClick(item, 'lastUsed')}
										>
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
