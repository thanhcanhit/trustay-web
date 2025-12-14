"use client";

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, RefreshCcw, Search, CheckCircle2, XCircle, Eye } from 'lucide-react';

import {
	getPendingKnowledge,
	approvePendingKnowledge,
	rejectPendingKnowledge,
} from '@/actions/admin-ai.action';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type {
	PendingKnowledge,
	PendingKnowledgeStatus,
	AdminAIPaginatedResponse,
} from '@/types/admin-ai';
import { PaginationControls } from './pagination-controls';
import { formatDateTime } from './utils';
import { LoaderState } from './loader-state';
import { PendingKnowledgeStatusBadge } from './badges';
import { toast } from 'sonner';

export function PendingKnowledgePanel() {
	const queryClient = useQueryClient();
	const [searchInput, setSearchInput] = useState('');
	const [search, setSearch] = useState('');
	const [status, setStatus] = useState<PendingKnowledgeStatus | 'all'>('all');
	const [limit, setLimit] = useState(20);
	const [offset, setOffset] = useState(0);
	const [selectedItem, setSelectedItem] = useState<PendingKnowledge | null>(null);
	const [approveDialogOpen, setApproveDialogOpen] = useState(false);
	const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
	const [approveNote, setApproveNote] = useState('');
	const [rejectReason, setRejectReason] = useState('');

	const { data, isLoading, isFetching, isError, error, refetch } = useQuery<
		AdminAIPaginatedResponse<PendingKnowledge>,
		Error
	>({
		queryKey: ['admin-ai-pending-knowledge', search, status, limit, offset],
		queryFn: () =>
			getPendingKnowledge({
				search: search || undefined,
				status: status === 'all' ? undefined : status,
				limit,
				offset,
			}),
		placeholderData: (previousData) => previousData,
	});

	const approveMutation = useMutation({
		mutationFn: (id: string) => approvePendingKnowledge(id, { note: approveNote || undefined }),
		onSuccess: () => {
			toast.success('Đã approve thành công');
			setApproveDialogOpen(false);
			setApproveNote('');
			setSelectedItem(null);
			void queryClient.invalidateQueries({ queryKey: ['admin-ai-pending-knowledge'] });
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Không thể approve');
		},
	});

	const rejectMutation = useMutation({
		mutationFn: (id: string) => rejectPendingKnowledge(id, { reason: rejectReason }),
		onSuccess: () => {
			toast.success('Đã reject thành công');
			setRejectDialogOpen(false);
			setRejectReason('');
			setSelectedItem(null);
			void queryClient.invalidateQueries({ queryKey: ['admin-ai-pending-knowledge'] });
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Không thể reject');
		},
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

	const handleApprove = (item: PendingKnowledge) => {
		setSelectedItem(item);
		setApproveNote('');
		setApproveDialogOpen(true);
	};

	const handleReject = (item: PendingKnowledge) => {
		setSelectedItem(item);
		setRejectReason('');
		setRejectDialogOpen(true);
	};

	const handleApproveSubmit = () => {
		if (!selectedItem) return;
		approveMutation.mutate(selectedItem.id);
	};

	const handleRejectSubmit = () => {
		if (!selectedItem || !rejectReason.trim()) {
			toast.error('Vui lòng nhập lý do reject');
			return;
		}
		rejectMutation.mutate(selectedItem.id);
	};

	const handleViewDetails = (item: PendingKnowledge) => {
		setSelectedItem(item);
		setApproveDialogOpen(true);
	};

	return (
		<div className="flex flex-col gap-2">
			<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-2">
					<div className="bg-blue-50 text-blue-700 p-2 rounded-lg border border-blue-100">
						<Clock className="size-4" />
					</div>
					<div>
						<h2 className="text-base sm:text-lg font-semibold">Pending Knowledge</h2>
						<p className="text-sm text-muted-foreground">
							Xác minh và approve/reject các câu SQL đã được AI validate.
						</p>
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
							setStatus(value as PendingKnowledgeStatus | 'all');
							setOffset(0);
						}}
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
					<Table className="min-w-[1000px]">
						<TableHeader>
							<TableRow>
								<TableHead className="w-20">ID</TableHead>
								<TableHead className="min-w-[200px]">Câu hỏi</TableHead>
								<TableHead className="min-w-[300px]">SQL</TableHead>
								<TableHead className="min-w-[150px]">Trạng thái</TableHead>
								<TableHead className="min-w-[150px]">Validator</TableHead>
								<TableHead className="min-w-[150px]">Created</TableHead>
								<TableHead className="w-32">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							<LoaderState
								isLoading={isLoading}
								isError={isError}
								errorMessage={error?.message}
								empty={isEmpty}
								emptyLabel="Chưa có pending knowledge nào"
								colSpan={7}
							/>

							{!isLoading &&
								!isError &&
								data?.items.map((item) => (
									<TableRow key={item.id}>
										<TableCell className="font-semibold text-foreground">
											<span className="line-clamp-1 max-w-[120px] truncate">{item.id}</span>
										</TableCell>
										<TableCell className="min-w-[200px] max-w-[250px]">
											<p className="line-clamp-2 font-medium text-foreground break-words">
												{item.question}
											</p>
										</TableCell>
										<TableCell className="min-w-[300px] max-w-[400px]">
											{item.sql ? (
												<div className="text-xs font-mono bg-slate-50 border rounded-md p-2 leading-relaxed line-clamp-3 break-words">
													{item.sql}
												</div>
											) : (
												<span className="text-muted-foreground text-sm">-</span>
											)}
										</TableCell>
										<TableCell>
											<PendingKnowledgeStatusBadge status={item.status} />
										</TableCell>
										<TableCell className="min-w-[150px]">
											{item.validatorData ? (
												<div className="space-y-1">
													<div
														className={`text-xs font-medium ${
															item.validatorData.isValid
																? 'text-green-600'
																: 'text-red-600'
														}`}
													>
														{item.validatorData.isValid ? 'Valid' : 'Invalid'}
													</div>
													{item.validatorData.severity && (
														<div className="text-xs text-muted-foreground">
															{item.validatorData.severity}
														</div>
													)}
												</div>
											) : (
												<span className="text-muted-foreground text-sm">-</span>
											)}
										</TableCell>
										<TableCell className="text-sm text-muted-foreground min-w-[150px] whitespace-nowrap">
											{formatDateTime(item.createdAt)}
										</TableCell>
										<TableCell className="w-32">
											<div className="flex items-center gap-1">
												<Button
													variant="ghost"
													size="sm"
													className="h-8 px-2"
													onClick={() => handleViewDetails(item)}
													title="Xem chi tiết"
												>
													<Eye className="size-3.5" />
												</Button>
												{item.status === 'pending' && (
													<>
														<Button
															variant="ghost"
															size="sm"
															className="h-8 px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
															onClick={() => handleApprove(item)}
															title="Approve"
															disabled={!item.sql}
														>
															<CheckCircle2 className="size-3.5" />
														</Button>
														<Button
															variant="ghost"
															size="sm"
															className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
															onClick={() => handleReject(item)}
															title="Reject"
														>
															<XCircle className="size-3.5" />
														</Button>
													</>
												)}
											</div>
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

			{/* Approve Dialog */}
			<Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
				<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Approve Pending Knowledge</DialogTitle>
						<DialogDescription>
							Xem chi tiết và approve câu SQL này để lưu vào vector DB.
						</DialogDescription>
					</DialogHeader>
					{selectedItem && (
						<div className="space-y-4">
							<div className="space-y-2">
								<Label>ID</Label>
								<p className="text-sm font-mono text-foreground">{selectedItem.id}</p>
							</div>
							<div className="space-y-2">
								<Label>Câu hỏi</Label>
								<p className="text-sm text-foreground whitespace-pre-wrap bg-slate-50 border rounded-md p-3">
									{selectedItem.question}
								</p>
							</div>
							<div className="space-y-2">
								<Label>SQL</Label>
								{selectedItem.sql ? (
									<pre className="text-xs font-mono bg-slate-50 border rounded-md p-3 overflow-x-auto whitespace-pre-wrap">
										{selectedItem.sql}
									</pre>
								) : (
									<p className="text-sm text-muted-foreground">Không có SQL</p>
								)}
							</div>
							{selectedItem.evaluation && (
								<div className="space-y-2">
									<Label>Evaluation</Label>
									<p className="text-sm text-foreground whitespace-pre-wrap bg-blue-50 border border-blue-200 rounded-md p-3">
										{selectedItem.evaluation}
									</p>
								</div>
							)}
							{selectedItem.validatorData && (
								<div className="space-y-2">
									<Label>Validator Data</Label>
									<div className="bg-amber-50 border border-amber-200 rounded-md p-3 space-y-2">
										<div className="text-xs">
											<span className="font-medium">Valid:</span>{' '}
											<span
												className={
													selectedItem.validatorData.isValid
														? 'text-green-600'
														: 'text-red-600'
												}
											>
												{String(selectedItem.validatorData.isValid)}
											</span>
										</div>
										{selectedItem.validatorData.reason && (
											<div className="text-xs">
												<span className="font-medium">Reason:</span>{' '}
												{selectedItem.validatorData.reason}
											</div>
										)}
										{selectedItem.validatorData.severity && (
											<div className="text-xs">
												<span className="font-medium">Severity:</span>{' '}
												{selectedItem.validatorData.severity}
											</div>
										)}
										{selectedItem.validatorData.violations &&
											selectedItem.validatorData.violations.length > 0 && (
												<div className="text-xs">
													<span className="font-medium">Violations:</span>
													<ul className="list-disc list-inside mt-1">
														{selectedItem.validatorData.violations.map((v, idx) => (
															<li key={idx}>{v}</li>
														))}
													</ul>
												</div>
											)}
										{selectedItem.validatorData.tokenUsage && (
											<div className="text-xs pt-2 border-t border-amber-300">
												<span className="font-medium">Token Usage:</span>{' '}
												{selectedItem.validatorData.tokenUsage.totalTokens} tokens
											</div>
										)}
									</div>
								</div>
							)}
							<div className="space-y-2">
								<Label htmlFor="approve-note">Note (optional)</Label>
								<Textarea
									id="approve-note"
									value={approveNote}
									onChange={(e) => setApproveNote(e.target.value)}
									placeholder="Ghi chú khi approve..."
									rows={3}
									maxLength={500}
								/>
								<p className="text-xs text-muted-foreground">
									{approveNote.length}/500 ký tự
								</p>
							</div>
						</div>
					)}
					<DialogFooter>
						<Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
							Hủy
						</Button>
						<Button
							onClick={handleApproveSubmit}
							disabled={!selectedItem?.sql || approveMutation.isPending}
						>
							{approveMutation.isPending ? 'Đang xử lý...' : 'Approve'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Reject Dialog */}
			<Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
				<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Reject Pending Knowledge</DialogTitle>
						<DialogDescription>
							Nhập lý do reject câu SQL này. Entry sẽ không được lưu vào vector DB.
						</DialogDescription>
					</DialogHeader>
					{selectedItem && (
						<div className="space-y-4">
							<div className="space-y-2">
								<Label>Câu hỏi</Label>
								<p className="text-sm text-foreground whitespace-pre-wrap bg-slate-50 border rounded-md p-3">
									{selectedItem.question}
								</p>
							</div>
							{selectedItem.sql && (
								<div className="space-y-2">
									<Label>SQL</Label>
									<pre className="text-xs font-mono bg-slate-50 border rounded-md p-3 overflow-x-auto whitespace-pre-wrap">
										{selectedItem.sql}
									</pre>
								</div>
							)}
							<div className="space-y-2">
								<Label htmlFor="reject-reason">
									Lý do reject <span className="text-red-500">*</span>
								</Label>
								<Textarea
									id="reject-reason"
									value={rejectReason}
									onChange={(e) => setRejectReason(e.target.value)}
									placeholder="Nhập lý do reject..."
									rows={4}
									maxLength={1000}
									required
								/>
								<p className="text-xs text-muted-foreground">
									{rejectReason.length}/1000 ký tự
								</p>
							</div>
						</div>
					)}
					<DialogFooter>
						<Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
							Hủy
						</Button>
						<Button
							onClick={handleRejectSubmit}
							variant="destructive"
							disabled={!rejectReason.trim() || rejectMutation.isPending}
						>
							{rejectMutation.isPending ? 'Đang xử lý...' : 'Reject'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
