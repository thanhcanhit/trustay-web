"use client";

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Clock, RefreshCcw, Search, CheckCircle2, XCircle, Eye, FileText } from 'lucide-react';

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
	const router = useRouter();
	const [searchInput, setSearchInput] = useState('');
	const [search, setSearch] = useState('');
	const [status, setStatus] = useState<PendingKnowledgeStatus | 'all'>('all');
	const [limit, setLimit] = useState(20);
	const [offset, setOffset] = useState(0);
	const [selectedItem, setSelectedItem] = useState<PendingKnowledge | null>(null);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [actionNote, setActionNote] = useState('');

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
		mutationFn: (id: string) => approvePendingKnowledge(id, { note: actionNote || undefined }),
		onSuccess: () => {
			toast.success('Đã approve thành công');
			setDialogOpen(false);
			setActionNote('');
			setSelectedItem(null);
			void queryClient.invalidateQueries({ queryKey: ['admin-ai-pending-knowledge'] });
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Không thể approve');
		},
	});

	const rejectMutation = useMutation({
		mutationFn: (id: string) => rejectPendingKnowledge(id, { reason: actionNote }),
		onSuccess: () => {
			toast.success('Đã reject thành công');
			setDialogOpen(false);
			setActionNote('');
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

	const handleOpenDialog = (item: PendingKnowledge) => {
		setSelectedItem(item);
		setActionNote('');
		setDialogOpen(true);
	};

	const handleApproveSubmit = () => {
		if (!selectedItem) return;
		approveMutation.mutate(selectedItem.id);
	};

	const handleRejectSubmit = () => {
		if (!selectedItem || !actionNote.trim()) {
			toast.error('Vui lòng nhập lý do reject');
			return;
		}
		rejectMutation.mutate(selectedItem.id);
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
											<Button
												variant="ghost"
												size="sm"
												className="h-8 w-full"
												onClick={() => handleOpenDialog(item)}
												title="Xem chi tiết"
											>
												<Eye className="size-3.5 mr-1" />
												Chi tiết
											</Button>
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

			{/* Single Dialog for View, Approve, and Reject */}
			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent className="w-[90vw] min-w-[80vw] max-h-[95vh] top-4 overflow-hidden flex flex-col">
					<DialogHeader className="flex-shrink-0">
						<DialogTitle>Chi tiết Pending Knowledge</DialogTitle>
						<DialogDescription>
							Xem toàn bộ thông tin chi tiết và approve/reject entry này
						</DialogDescription>
					</DialogHeader>
					{selectedItem && (
						<div className="flex-1 overflow-y-auto space-y-4 pr-2">
							{/* Session Information - Compact */}
							<div className="bg-slate-50 border rounded-md p-4">
								<div className="flex items-start justify-between gap-4">
									<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-sm flex-1">
										<div>
											<span className="text-xs text-muted-foreground">ID:</span>
											<p className="font-mono text-foreground mt-0.5">{selectedItem.id}</p>
										</div>
										<div>
											<span className="text-xs text-muted-foreground">Status:</span>
											<div className="mt-0.5">
												<PendingKnowledgeStatusBadge status={selectedItem.status} />
											</div>
										</div>
										<div>
											<span className="text-xs text-muted-foreground">Created:</span>
											<p className="text-foreground mt-0.5">{formatDateTime(selectedItem.createdAt)}</p>
										</div>
										<div>
											<span className="text-xs text-muted-foreground">Updated:</span>
											<p className="text-foreground mt-0.5">{formatDateTime(selectedItem.updatedAt)}</p>
										</div>
										{selectedItem.sessionId && (
											<div>
												<span className="text-xs text-muted-foreground">Session ID:</span>
												<p className="text-xs font-mono text-foreground mt-0.5 break-all">{selectedItem.sessionId}</p>
											</div>
										)}
										{selectedItem.userId && (
											<div>
												<span className="text-xs text-muted-foreground">User ID:</span>
												<p className="text-xs font-mono text-foreground mt-0.5 break-all">{selectedItem.userId}</p>
											</div>
										)}
									</div>
									{selectedItem.processingLogId && (
										<Button
											variant="outline"
											size="sm"
											onClick={() => router.push(`/admin/ai/process/${selectedItem.processingLogId}`)}
											className="shrink-0"
										>
											<FileText className="size-4 mr-2" />
											Xem Log
										</Button>
									)}
								</div>
							</div>

							{/* Main Content - Grid 2 columns */}
							<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
								{/* Left Column */}
								<div className="space-y-4">
									<div className="space-y-2">
										<Label className="text-sm font-semibold">Câu hỏi</Label>
										<div className="text-sm text-foreground whitespace-pre-wrap bg-slate-50 border rounded-md p-4 max-h-[200px] overflow-y-auto">
											{selectedItem.question}
										</div>
									</div>

									<div className="space-y-2">
										<Label className="text-sm font-semibold">SQL</Label>
										{selectedItem.sql ? (
											<pre className="text-xs font-mono bg-slate-50 border rounded-md p-4 overflow-x-auto whitespace-pre-wrap max-h-[400px] overflow-y-auto">
												{selectedItem.sql}
											</pre>
										) : (
											<p className="text-sm text-muted-foreground bg-slate-50 border rounded-md p-4">
												Không có SQL
											</p>
										)}
									</div>

									{selectedItem.response && (
										<div className="space-y-2">
											<Label className="text-sm font-semibold">Response</Label>
											<div className="text-sm text-foreground whitespace-pre-wrap bg-green-50 border border-green-200 rounded-md p-4 max-h-[300px] overflow-y-auto">
												{selectedItem.response}
											</div>
										</div>
									)}
								</div>

								{/* Right Column */}
								<div className="space-y-4">
									{selectedItem.evaluation && (
										<div className="space-y-2">
											<Label className="text-sm font-semibold">Evaluation</Label>
											<div className="text-sm text-foreground whitespace-pre-wrap bg-blue-50 border border-blue-200 rounded-md p-4 max-h-[400px] overflow-y-auto">
												{selectedItem.evaluation}
											</div>
										</div>
									)}

									{selectedItem.validatorData && (
										<div className="space-y-2">
											<Label className="text-sm font-semibold">Validator Data</Label>
											<div className="bg-amber-50 border border-amber-200 rounded-md p-4 space-y-3 max-h-[400px] overflow-y-auto">
												<div className="grid grid-cols-2 gap-4">
													<div>
														<span className="text-xs font-medium">Valid:</span>{' '}
														<span
															className={`text-xs font-semibold ${
																selectedItem.validatorData.isValid
																	? 'text-green-600'
																	: 'text-red-600'
															}`}
														>
															{String(selectedItem.validatorData.isValid)}
														</span>
													</div>
													{selectedItem.validatorData.severity && (
														<div>
															<span className="text-xs font-medium">Severity:</span>{' '}
															<span className="text-xs">{selectedItem.validatorData.severity}</span>
														</div>
													)}
												</div>
												{selectedItem.validatorData.reason && (
													<div>
														<span className="text-xs font-medium">Reason:</span>
														<p className="text-xs mt-1 whitespace-pre-wrap">
															{selectedItem.validatorData.reason}
														</p>
													</div>
												)}
												{selectedItem.validatorData.violations &&
													selectedItem.validatorData.violations.length > 0 && (
														<div>
															<span className="text-xs font-medium">Violations:</span>
															<ul className="list-disc list-inside mt-1 space-y-1">
																{selectedItem.validatorData.violations.map((v, idx) => (
																	<li key={idx} className="text-xs">
																		{v}
																	</li>
																))}
															</ul>
														</div>
													)}
												{selectedItem.validatorData.tokenUsage && (
													<div className="pt-2 border-t border-amber-300">
														<span className="text-xs font-medium">Token Usage:</span>
														<div className="text-xs mt-1 space-y-1">
															<div>
																Prompt: {selectedItem.validatorData.tokenUsage.promptTokens || 0}
															</div>
															<div>
																Completion:{' '}
																{selectedItem.validatorData.tokenUsage.completionTokens || 0}
															</div>
															<div className="font-semibold">
																Total: {selectedItem.validatorData.tokenUsage.totalTokens || 0} tokens
															</div>
														</div>
													</div>
												)}
											</div>
										</div>
									)}
								</div>
							</div>

							{selectedItem.approvedAt && (
								<div className="space-y-2">
									<Label className="text-sm font-semibold">Approved At</Label>
									<p className="text-sm text-foreground bg-green-50 border border-green-200 rounded-md p-3">
										{formatDateTime(selectedItem.approvedAt)}
										{selectedItem.approvedBy && (
											<span className="text-muted-foreground ml-2">
												by {selectedItem.approvedBy}
											</span>
										)}
									</p>
								</div>
							)}

							{selectedItem.rejectedAt && (
								<div className="space-y-2">
									<Label className="text-sm font-semibold">Rejected At</Label>
									<p className="text-sm text-foreground bg-red-50 border border-red-200 rounded-md p-3">
										{formatDateTime(selectedItem.rejectedAt)}
										{selectedItem.rejectedBy && (
											<span className="text-muted-foreground ml-2">
												by {selectedItem.rejectedBy}
											</span>
										)}
									</p>
									{selectedItem.rejectionReason && (
										<div className="mt-2">
											<Label className="text-sm font-semibold">Rejection Reason</Label>
											<p className="text-sm text-foreground whitespace-pre-wrap bg-red-50 border border-red-200 rounded-md p-3 mt-1">
												{selectedItem.rejectionReason}
											</p>
										</div>
									)}
								</div>
							)}

							{/* Action Form - Only show for pending status */}
							{selectedItem.status === 'pending' && (
								<div className="space-y-2 pt-4 border-t">
									<Label htmlFor="action-note" className="text-sm font-semibold">
										Note / Reason <span className="text-muted-foreground text-xs">(optional for approve, required for reject)</span>
									</Label>
									<Textarea
										id="action-note"
										value={actionNote}
										onChange={(e) => setActionNote(e.target.value)}
										placeholder="Nhập note khi approve hoặc lý do khi reject..."
										rows={3}
										maxLength={1000}
									/>
									<p className="text-xs text-muted-foreground">
										{actionNote.length}/1000 ký tự
									</p>
								</div>
							)}
						</div>
					)}
					<DialogFooter className="flex-shrink-0">
						<Button variant="outline" onClick={() => setDialogOpen(false)}>
							Đóng
						</Button>
						{selectedItem?.status === 'pending' && (
							<>
								<Button
									onClick={handleApproveSubmit}
									disabled={!selectedItem.sql || approveMutation.isPending}
									className="text-green-600 hover:text-green-700 hover:bg-green-50"
								>
									<CheckCircle2 className="size-4 mr-2" />
									{approveMutation.isPending ? 'Đang xử lý...' : 'Accept'}
								</Button>
								<Button
									onClick={handleRejectSubmit}
									variant="destructive"
									disabled={!actionNote.trim() || rejectMutation.isPending}
								>
									<XCircle className="size-4 mr-2" />
									{rejectMutation.isPending ? 'Đang xử lý...' : 'Reject'}
								</Button>
							</>
						)}
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
