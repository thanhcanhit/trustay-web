"use client";

import { ExternalLink, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { AIChunk } from '@/types/admin-ai';
import { LoaderState } from '../loader-state';
import { CollectionBadge } from '../badges';
import { formatDateTime } from '../utils';

type ChunkCellType = 'id' | 'collection' | 'content' | 'created';

interface ChunksPanelTableProps {
	data: AIChunk[] | undefined;
	isLoading: boolean;
	isError: boolean;
	errorMessage: string | undefined;
	empty: boolean;
	onCellClick: (item: AIChunk, cellType: ChunkCellType) => void;
	onViewCanonical: (item: AIChunk, e: React.MouseEvent) => void;
	onDelete: (item: AIChunk, e: React.MouseEvent) => void;
	isLoadingCanonical: boolean;
	isDeleting: boolean;
}

export function ChunksPanelTable({
	data,
	isLoading,
	isError,
	errorMessage,
	empty,
	onCellClick,
	onViewCanonical,
	onDelete,
	isLoadingCanonical,
	isDeleting,
}: ChunksPanelTableProps) {
	return (
		<div className="rounded-lg border bg-white overflow-hidden">
			<div className="overflow-x-auto w-full">
				<Table className="min-w-[600px]">
					<TableHeader>
						<TableRow>
							<TableHead className="w-16">ID</TableHead>
							<TableHead>Collection</TableHead>
							<TableHead>Nội dung</TableHead>
							<TableHead>Created</TableHead>
							<TableHead className="w-24 min-w-[96px]">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						<LoaderState
							isLoading={isLoading}
							isError={isError}
							errorMessage={errorMessage}
							empty={empty}
							emptyLabel="Chưa có chunk nào"
							colSpan={5}
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
										className="cursor-pointer hover:bg-muted/50 transition-colors"
										onClick={() => onCellClick(item, 'collection')}
									>
										<CollectionBadge collection={item.collection} />
									</TableCell>
									<TableCell
										className="max-w-3xl cursor-pointer hover:bg-muted/50 transition-colors"
										onClick={() => onCellClick(item, 'content')}
									>
										<p className="line-clamp-3 text-foreground">{item.content}</p>
									</TableCell>
									<TableCell
										className="text-sm text-muted-foreground cursor-pointer hover:bg-muted/50 transition-colors"
										onClick={() => onCellClick(item, 'created')}
									>
										{formatDateTime(item.createdAt)}
									</TableCell>
									<TableCell className="w-32 min-w-[128px]">
										<div className="flex items-center gap-1">
											<Button
												variant="ghost"
												size="sm"
												className="h-8 flex-1"
												onClick={(e) => onViewCanonical(item, e)}
												title="Xem canonical entry liên quan"
												disabled={isLoadingCanonical}
											>
												<ExternalLink className="size-3.5 mr-1" />
												Canonical
											</Button>
											<Button
												variant="ghost"
												size="sm"
												className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
												onClick={(e) => onDelete(item, e)}
												title="Xóa chunk"
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
