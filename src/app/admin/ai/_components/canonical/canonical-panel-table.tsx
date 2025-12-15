"use client";

import { ExternalLink, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { AICanonicalEntry } from '@/types/admin-ai';
import { LoaderState } from '../loader-state';
import { formatDateTime } from '../utils';

type CellType = 'id' | 'question' | 'sql' | 'created' | 'lastUsed';

interface CanonicalPanelTableProps {
	data: AICanonicalEntry[] | undefined;
	isLoading: boolean;
	isError: boolean;
	errorMessage: string | undefined;
	empty: boolean;
	onCellClick: (item: AICanonicalEntry, cellType: CellType) => void;
	onNavigateToUpdate?: (item: AICanonicalEntry) => void;
	onViewChunks: (item: AICanonicalEntry, e: React.MouseEvent) => void;
	onDelete: (item: AICanonicalEntry, e: React.MouseEvent) => void;
	isLoadingChunk: boolean;
	isDeleting: boolean;
}

export function CanonicalPanelTable({
	data,
	isLoading,
	isError,
	errorMessage,
	empty,
	onCellClick,
	onNavigateToUpdate,
	onViewChunks,
	onDelete,
	isLoadingChunk,
	isDeleting,
}: CanonicalPanelTableProps) {
	return (
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
							<TableHead className="w-24 min-w-[96px]">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						<LoaderState
							isLoading={isLoading}
							isError={isError}
							errorMessage={errorMessage}
							empty={empty}
							emptyLabel="Chưa có canonical nào"
							colSpan={6}
						/>

						{!isLoading &&
							!isError &&
							data?.map((item) => (
								<TableRow key={item.id}>
									<TableCell
										className="font-semibold text-foreground cursor-pointer hover:bg-muted/50 transition-colors"
										onClick={() => onCellClick(item, 'id')}
									>
										{item.id}
									</TableCell>
									<TableCell
										className="min-w-[200px] max-w-[250px] cursor-pointer hover:bg-muted/50 transition-colors"
										onClick={() => onCellClick(item, 'question')}
									>
										<p className="line-clamp-2 font-medium text-foreground break-words">{item.question}</p>
										<p className="text-xs text-muted-foreground truncate">
											Params: {item.parameters ? JSON.stringify(item.parameters) : 'N/A'}
										</p>
									</TableCell>
									<TableCell
										className="min-w-[300px] max-w-[400px] cursor-pointer hover:bg-muted/50 transition-colors"
										onClick={() => onCellClick(item, 'sql')}
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
										onClick={() => onCellClick(item, 'created')}
									>
										{formatDateTime(item.createdAt)}
									</TableCell>
									<TableCell
										className="text-sm text-muted-foreground min-w-[150px] whitespace-nowrap cursor-pointer hover:bg-muted/50 transition-colors"
										onClick={() => onCellClick(item, 'lastUsed')}
									>
										{item.lastUsedAt ? formatDateTime(item.lastUsedAt) : 'Chưa dùng'}
									</TableCell>
									<TableCell className="w-32 min-w-[128px]">
										<div className="flex gap-1">
											{onNavigateToUpdate && (
												<Button
													variant="ghost"
													size="sm"
													className="h-8 flex-1"
													onClick={(e) => {
														e.stopPropagation();
														onNavigateToUpdate(item);
													}}
													title="Cập nhật entry này"
												>
													<Pencil className="size-3.5 mr-1" />
													Update
												</Button>
											)}
											<Button
												variant="ghost"
												size="sm"
												className="h-8 flex-1"
												onClick={(e) => onViewChunks(item, e)}
												title="Xem chunk liên quan"
												disabled={isLoadingChunk}
											>
												<ExternalLink className="size-3.5 mr-1" />
												Chunks
											</Button>
											<Button
												variant="ghost"
												size="sm"
												className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
												onClick={(e) => onDelete(item, e)}
												title="Xóa SQL QA (sẽ xóa cả chunks liên kết)"
												disabled={isDeleting}
											>
												<Trash2 className="size-3.5" />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
