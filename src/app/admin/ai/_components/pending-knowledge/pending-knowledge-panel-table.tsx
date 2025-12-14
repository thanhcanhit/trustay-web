"use client";

import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { PendingKnowledge } from '@/types/admin-ai';
import { LoaderState } from '../loader-state';
import { PendingKnowledgeStatusBadge } from '../badges';
import { formatDateTime } from '../utils';

interface PendingKnowledgePanelTableProps {
	data: PendingKnowledge[] | undefined;
	isLoading: boolean;
	isError: boolean;
	errorMessage: string | undefined;
	empty: boolean;
	onViewDetail: (item: PendingKnowledge) => void;
}

export function PendingKnowledgePanelTable({
	data,
	isLoading,
	isError,
	errorMessage,
	empty,
	onViewDetail,
}: PendingKnowledgePanelTableProps) {
	return (
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
							errorMessage={errorMessage}
							empty={empty}
							emptyLabel="Chưa có pending knowledge nào"
							colSpan={7}
						/>

						{!isLoading &&
							!isError &&
							data?.map((item) => (
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
											onClick={() => onViewDetail(item)}
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
	);
}
