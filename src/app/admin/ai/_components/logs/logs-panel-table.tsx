"use client";

import { Workflow } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { AILogEntry } from '@/types/admin-ai';
import { LoaderState } from '../loader-state';
import { StatusBadge } from '../badges';
import { formatDateTime, formatDuration } from '../utils';

type LogCellType = 'id' | 'question' | 'status' | 'error' | 'duration' | 'created' | 'orchestrator' | 'sqlGeneration' | 'validator' | 'ragContext' | 'tokenUsage' | 'stepsLog';

interface LogsPanelTableProps {
	data: AILogEntry[] | undefined;
	isLoading: boolean;
	isError: boolean;
	errorMessage: string | undefined;
	empty: boolean;
	onCellClick: (item: AILogEntry, cellType: LogCellType) => void;
	onViewAll: (item: AILogEntry) => void;
}

export function LogsPanelTable({
	data,
	isLoading,
	isError,
	errorMessage,
	empty,
	onCellClick,
	onViewAll,
}: LogsPanelTableProps) {
	const router = useRouter();

	return (
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
							errorMessage={errorMessage}
							empty={empty}
							emptyLabel="Chưa có log nào"
							colSpan={8}
						/>

						{!isLoading &&
							!isError &&
							data?.map((item) => (
								<TableRow key={item.id}>
									<TableCell
										className="font-semibold text-foreground cursor-pointer hover:bg-muted/50 transition-colors"
										onClick={() => onCellClick(item, 'id')}
									>
										<span className="line-clamp-1 max-w-[120px]">{item.id}</span>
									</TableCell>
									<TableCell
										className="max-w-xl cursor-pointer hover:bg-muted/50 transition-colors"
										onClick={() => onCellClick(item, 'question')}
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
										onClick={() => onCellClick(item, 'status')}
									>
										<StatusBadge status={item.status} />
									</TableCell>
									<TableCell
										className="max-w-xs cursor-pointer hover:bg-muted/50 transition-colors"
										onClick={() => onCellClick(item, 'error')}
									>
										{item.error ? (
											<p className="text-sm text-red-600 line-clamp-2">{item.error}</p>
										) : (
											<span className="text-muted-foreground text-sm">-</span>
										)}
									</TableCell>
									<TableCell
										className="text-sm text-muted-foreground cursor-pointer hover:bg-muted/50 transition-colors"
										onClick={() => onCellClick(item, 'duration')}
									>
										{formatDuration(item.totalDuration)}
									</TableCell>
									<TableCell
										className="text-sm text-muted-foreground cursor-pointer hover:bg-muted/50 transition-colors"
										onClick={() => onCellClick(item, 'created')}
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
												onViewAll(item);
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
	);
}
