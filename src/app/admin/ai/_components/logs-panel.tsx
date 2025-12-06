"use client";

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ListChecks, RefreshCcw, Search, Workflow } from 'lucide-react';

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

type LogCellType = 'id' | 'question' | 'status' | 'error' | 'duration' | 'created' | 'orchestrator' | 'sqlGeneration' | 'validator' | 'ragContext' | 'tokenUsage' | 'stepsLog';

export function LogsPanel() {
	const router = useRouter();
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
						{/* Question & Response */}
						<div className="space-y-3">
							<div className="space-y-2">
								<h3 className="text-sm font-semibold text-foreground">Question</h3>
								<p className="text-sm text-foreground whitespace-pre-wrap bg-slate-50 border rounded-md p-4">
									{selectedItem.question}
								</p>
							</div>
							{selectedItem.response && (
								<div className="space-y-2">
									<h3 className="text-sm font-semibold text-foreground">Response</h3>
									<div className="text-sm text-foreground whitespace-pre-wrap bg-green-50 border border-green-200 rounded-md p-4 max-h-[200px] overflow-y-auto">
										{selectedItem.response}
									</div>
								</div>
							)}
						</div>

						<div className="border-t pt-4 space-y-4">
							{/* Orchestrator Data */}
							{selectedItem.orchestratorData && (
								<div className="space-y-2">
									<h3 className="text-sm font-semibold text-foreground">Orchestrator Agent</h3>
									<div className="bg-blue-50 border border-blue-200 rounded-md p-3 space-y-2">
										{(() => {
											const data = selectedItem.orchestratorData as Record<string, unknown>;
											return (
												<>
													{data.duration && (
														<div className="text-xs">
															<span className="font-medium">Duration:</span> {String(data.duration)}ms
														</div>
													)}
													{data.userRole && (
														<div className="text-xs">
															<span className="font-medium">User Role:</span> {String(data.userRole)}
														</div>
													)}
													{data.entityHint && (
														<div className="text-xs">
															<span className="font-medium">Entity:</span> {String(data.entityHint)}
														</div>
													)}
													{data.tablesHint && (
														<div className="text-xs">
															<span className="font-medium">Tables:</span> {String(data.tablesHint)}
														</div>
													)}
													{data.filtersHint && (
														<div className="text-xs">
															<span className="font-medium">Filters:</span> {String(data.filtersHint)}
														</div>
													)}
													{data.intentAction && (
														<div className="text-xs">
															<span className="font-medium">Intent:</span> {String(data.intentAction)}
														</div>
													)}
													{data.requestType && (
														<div className="text-xs">
															<span className="font-medium">Request Type:</span> {String(data.requestType)}
														</div>
													)}
													{data.readyForSql !== undefined && (
														<div className="text-xs">
															<span className="font-medium">Ready for SQL:</span> {String(data.readyForSql)}
														</div>
													)}
													{data.tokenUsage && (
														<div className="text-xs mt-2 pt-2 border-t border-blue-300">
															<span className="font-medium">Tokens:</span> {String((data.tokenUsage as { totalTokens?: number })?.totalTokens || 'N/A')}
														</div>
													)}
												</>
											);
										})()}
									</div>
								</div>
							)}

							{/* SQL Generation Attempts */}
							{selectedItem.sqlGenerationAttempts && selectedItem.sqlGenerationAttempts.length > 0 && (
								<div className="space-y-2">
									<h3 className="text-sm font-semibold text-foreground">SQL Generation ({selectedItem.sqlGenerationAttempts.length} attempt{selectedItem.sqlGenerationAttempts.length > 1 ? 's' : ''})</h3>
									<div className="space-y-3">
										{selectedItem.sqlGenerationAttempts.map((attempt, idx) => {
											const attemptData = attempt as Record<string, unknown>;
											const safetyCheck = attemptData.safetyCheck as { isValid?: boolean; violations?: unknown[] } | undefined;
											const finalSql = attemptData.finalSql ? String(attemptData.finalSql) : null;
											const durationMs = attemptData.durationMs ? String(attemptData.durationMs) : null;
											const tokenUsage = attemptData.tokenUsage as { totalTokens?: number } | undefined;
											return (
												<div key={idx} className="bg-purple-50 border border-purple-200 rounded-md p-3 space-y-2">
													<div className="text-xs font-semibold text-purple-700">Attempt #{idx + 1}</div>
													{finalSql && (
														<div className="space-y-1">
															<div className="text-xs font-medium">Final SQL:</div>
															<pre className="text-xs font-mono bg-white border rounded p-2 overflow-x-auto whitespace-pre-wrap">
																{finalSql}
															</pre>
														</div>
													)}
													{durationMs && (
														<div className="text-xs">
															<span className="font-medium">Duration:</span> {durationMs}ms
														</div>
													)}
													{safetyCheck && (
														<div className="text-xs">
															<span className="font-medium">Safety Check:</span>{' '}
															<span className={safetyCheck.isValid ? 'text-green-600' : 'text-red-600'}>
																{String(safetyCheck.isValid ? 'Valid' : 'Invalid')}
															</span>
															{safetyCheck.violations && Array.isArray(safetyCheck.violations) && safetyCheck.violations.length > 0 && (
																<div className="mt-1 text-red-600">
																	Violations: {JSON.stringify(safetyCheck.violations)}
																</div>
															)}
														</div>
													)}
													{tokenUsage && (
														<div className="text-xs pt-1 border-t border-purple-300">
															<span className="font-medium">Tokens:</span> {String(tokenUsage?.totalTokens || 'N/A')}
														</div>
													)}
												</div>
											);
										})}
									</div>
								</div>
							)}

							{/* Validator Data */}
							{selectedItem.validatorData && (
								<div className="space-y-2">
									<h3 className="text-sm font-semibold text-foreground">Validator Agent</h3>
									<div className="bg-amber-50 border border-amber-200 rounded-md p-3 space-y-2">
										{(() => {
											const data = selectedItem.validatorData as Record<string, unknown>;
											return (
												<>
													{data.isValid !== undefined && (
														<div className="text-xs">
															<span className="font-medium">Valid:</span>{' '}
															<span className={data.isValid ? 'text-green-600' : 'text-red-600'}>
																{String(data.isValid)}
															</span>
														</div>
													)}
													{data.reason && (
														<div className="text-xs">
															<span className="font-medium">Reason:</span> {String(data.reason)}
														</div>
													)}
													{data.duration && (
														<div className="text-xs">
															<span className="font-medium">Duration:</span> {String(data.duration)}ms
														</div>
													)}
													{data.violations && Array.isArray(data.violations) && data.violations.length > 0 && (
														<div className="text-xs">
															<span className="font-medium">Violations:</span>
															<pre className="text-xs font-mono bg-white border rounded p-2 mt-1 overflow-x-auto">
																{JSON.stringify(data.violations, null, 2)}
															</pre>
														</div>
													)}
													{data.tokenUsage && (
														<div className="text-xs pt-1 border-t border-amber-300">
															<span className="font-medium">Tokens:</span> {String((data.tokenUsage as { totalTokens?: number })?.totalTokens || 'N/A')}
														</div>
													)}
												</>
											);
										})()}
									</div>
								</div>
							)}

							{/* RAG Context */}
							{selectedItem.ragContext && (
								<div className="space-y-2">
									<h3 className="text-sm font-semibold text-foreground">RAG Context</h3>
									<div className="bg-indigo-50 border border-indigo-200 rounded-md p-3 space-y-2">
										{(() => {
											const data = selectedItem.ragContext as Record<string, unknown>;
											const canonicalDecision = data.canonicalDecision as Record<string, unknown> | undefined;
											return (
												<>
													{data.tablesHint && (
														<div className="text-xs">
															<span className="font-medium">Tables:</span> {String(data.tablesHint)}
														</div>
													)}
													{data.filtersHint && (
														<div className="text-xs">
															<span className="font-medium">Filters:</span> {String(data.filtersHint)}
														</div>
													)}
													{data.intentAction && (
														<div className="text-xs">
															<span className="font-medium">Intent:</span> {String(data.intentAction)}
														</div>
													)}
													{canonicalDecision && (() => {
														const mode = canonicalDecision.mode ? String(canonicalDecision.mode) : null;
														const sql = canonicalDecision.sql ? String(canonicalDecision.sql) : null;
														const sqlQAId = canonicalDecision.sqlQAId ? String(canonicalDecision.sqlQAId) : null;
														const chunkId = canonicalDecision.chunkId ? String(canonicalDecision.chunkId) : null;
														const score = canonicalDecision.score !== undefined ? String(canonicalDecision.score) : null;
														return (
															<div className="text-xs pt-2 border-t border-indigo-300">
																<span className="font-medium">Canonical Decision:</span>
																<div className="mt-1 bg-white border rounded p-2">
																	{mode && (
																		<div className="mb-1">
																			<span className="font-medium">Mode:</span> {mode}
																		</div>
																	)}
																	{sql && (
																		<div className="mb-1">
																			<span className="font-medium">SQL:</span>
																			<pre className="text-xs font-mono bg-slate-50 border rounded p-1 mt-1 overflow-x-auto whitespace-pre-wrap">
																				{sql}
																			</pre>
																		</div>
																	)}
																	{sqlQAId && (
																		<div className="mb-1">
																			<span className="font-medium">SQL QA ID:</span> {sqlQAId}
																		</div>
																	)}
																	{chunkId && (
																		<div className="mb-1">
																			<span className="font-medium">Chunk ID:</span> {chunkId}
																		</div>
																	)}
																	{score !== null && (
																		<div className="mb-1">
																			<span className="font-medium">Score:</span> {score}
																		</div>
																	)}
																</div>
															</div>
														);
													})()}
													{data.schemaContextLength && (
														<div className="text-xs">
															<span className="font-medium">Schema Context Length:</span> {String(data.schemaContextLength)}
														</div>
													)}
												</>
											);
										})()}
									</div>
								</div>
							)}

							{/* Token Usage Summary */}
							{selectedItem.tokenUsage && (
								<div className="space-y-2">
									<h3 className="text-sm font-semibold text-foreground">Token Usage (Total)</h3>
									<div className="bg-slate-50 border border-slate-200 rounded-md p-3">
										<div className="text-xs">
											<span className="font-medium">Total Tokens:</span> {String((selectedItem.tokenUsage as { totalTokens?: number })?.totalTokens || 'N/A')}
										</div>
										{(selectedItem.tokenUsage as { promptTokens?: number })?.promptTokens !== undefined && (
											<div className="text-xs">
												<span className="font-medium">Prompt Tokens:</span> {String((selectedItem.tokenUsage as { promptTokens?: number }).promptTokens)}
											</div>
										)}
										{(selectedItem.tokenUsage as { completionTokens?: number })?.completionTokens !== undefined && (
											<div className="text-xs">
												<span className="font-medium">Completion Tokens:</span> {String((selectedItem.tokenUsage as { completionTokens?: number }).completionTokens)}
											</div>
										)}
									</div>
								</div>
							)}

							{/* Steps Log */}
							{selectedItem.stepsLog && (
								<div className="space-y-2">
									<h3 className="text-sm font-semibold text-foreground">Steps Log</h3>
									<pre className="text-xs font-mono bg-slate-50 border border-slate-200 rounded-md p-3 overflow-x-auto max-h-[300px] overflow-y-auto whitespace-pre-wrap">
										{selectedItem.stepsLog}
									</pre>
								</div>
							)}

							{/* Duration & Status */}
							<div className="grid grid-cols-2 gap-4 pt-2 border-t">
								{selectedItem.totalDuration && (
									<div className="text-xs">
										<span className="font-medium">Total Duration:</span> {formatDuration(selectedItem.totalDuration)}
									</div>
								)}
								<div className="text-xs">
									<span className="font-medium">Status:</span> <StatusBadge status={selectedItem.status} />
								</div>
							</div>
						</div>
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
			case 'orchestrator':
				return (
					<div className="space-y-2">
						<h3 className="text-sm font-semibold text-foreground">Orchestrator Data</h3>
						{selectedItem.orchestratorData ? (
							<pre className="text-xs font-mono bg-slate-50 border rounded-md p-4 overflow-x-auto max-h-[500px] overflow-y-auto whitespace-pre-wrap">
								{JSON.stringify(selectedItem.orchestratorData, null, 2)}
							</pre>
						) : (
							<p className="text-sm text-muted-foreground">Không có dữ liệu orchestrator</p>
						)}
					</div>
				);
			case 'sqlGeneration':
				return (
					<div className="space-y-2">
						<h3 className="text-sm font-semibold text-foreground">SQL Generation Attempts</h3>
						{selectedItem.sqlGenerationAttempts && selectedItem.sqlGenerationAttempts.length > 0 ? (
							<div className="space-y-3">
								{selectedItem.sqlGenerationAttempts.map((attempt, index) => (
									<div key={index} className="border rounded-md p-3 bg-slate-50">
										<p className="text-xs font-semibold text-muted-foreground mb-2">Attempt #{index + 1}</p>
										<pre className="text-xs font-mono overflow-x-auto whitespace-pre-wrap">
											{JSON.stringify(attempt, null, 2)}
										</pre>
									</div>
								))}
							</div>
						) : (
							<p className="text-sm text-muted-foreground">Không có dữ liệu SQL generation attempts</p>
						)}
					</div>
				);
			case 'validator':
				return (
					<div className="space-y-2">
						<h3 className="text-sm font-semibold text-foreground">Validator Data</h3>
						{selectedItem.validatorData ? (
							<pre className="text-xs font-mono bg-slate-50 border rounded-md p-4 overflow-x-auto max-h-[500px] overflow-y-auto whitespace-pre-wrap">
								{JSON.stringify(selectedItem.validatorData, null, 2)}
							</pre>
						) : (
							<p className="text-sm text-muted-foreground">Không có dữ liệu validator</p>
						)}
					</div>
				);
			case 'ragContext':
				return (
					<div className="space-y-2">
						<h3 className="text-sm font-semibold text-foreground">RAG Context</h3>
						{selectedItem.ragContext ? (
							<pre className="text-xs font-mono bg-slate-50 border rounded-md p-4 overflow-x-auto max-h-[500px] overflow-y-auto whitespace-pre-wrap">
								{JSON.stringify(selectedItem.ragContext, null, 2)}
							</pre>
						) : (
							<p className="text-sm text-muted-foreground">Không có RAG context</p>
						)}
					</div>
				);
			case 'tokenUsage':
				return (
					<div className="space-y-2">
						<h3 className="text-sm font-semibold text-foreground">Token Usage</h3>
						{selectedItem.tokenUsage ? (
							<pre className="text-xs font-mono bg-slate-50 border rounded-md p-4 overflow-x-auto max-h-[500px] overflow-y-auto whitespace-pre-wrap">
								{JSON.stringify(selectedItem.tokenUsage, null, 2)}
							</pre>
						) : (
							<p className="text-sm text-muted-foreground">Không có dữ liệu token usage</p>
						)}
					</div>
				);
			case 'stepsLog':
				return (
					<div className="space-y-2">
						<h3 className="text-sm font-semibold text-foreground">Steps Log</h3>
						{selectedItem.stepsLog ? (
							<pre className="text-xs font-mono bg-slate-50 border rounded-md p-4 overflow-x-auto max-h-[500px] overflow-y-auto whitespace-pre-wrap">
								{selectedItem.stepsLog}
							</pre>
						) : (
							<p className="text-sm text-muted-foreground">Không có steps log</p>
						)}
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
			orchestrator: 'Orchestrator Data',
			sqlGeneration: 'SQL Generation Attempts',
			validator: 'Validator Data',
			ragContext: 'RAG Context',
			tokenUsage: 'Token Usage',
			stepsLog: 'Steps Log',
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
			orchestrator: 'Dữ liệu từ Orchestrator Agent',
			sqlGeneration: 'Các lần thử generate SQL (có thể retry nhiều lần)',
			validator: 'Dữ liệu từ Result Validator Agent',
			ragContext: 'RAG Context từ vector DB',
			tokenUsage: 'Token usage tổng hợp',
			stepsLog: 'Log các bước xử lý (step-by-step)',
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
									<TableHead className="w-32">Details</TableHead>
									<TableHead className="w-24">Flow</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								<LoaderState
									isLoading={isLoading}
									isError={isError}
									errorMessage={error?.message}
									empty={isEmpty}
									emptyLabel="Chưa có log nào"
									colSpan={8}
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
											<TableCell className="w-32">
												<Button
													variant="outline"
													size="sm"
													className="h-8 w-full text-xs"
													onClick={(e) => {
														e.stopPropagation();
														setSelectedItem(item);
														setSelectedCell('question');
														setDialogOpen(true);
													}}
												>
													View All
												</Button>
											</TableCell>
											<TableCell className="w-24">
												{item.stepsLog ? (
													<Button
														variant="ghost"
														size="sm"
														className="h-8 w-full text-xs"
														onClick={(e) => {
															e.stopPropagation();
															router.push(`/admin/ai/process/${item.id}`);
														}}
														title="Xem process flow"
													>
														<Workflow className="size-3.5" />
													</Button>
												) : (
													<span className="text-muted-foreground text-xs">-</span>
												)}
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
