"use client";

import type { AIChunk, AICanonicalEntry } from '@/types/admin-ai';
import { CellDetailDialog } from '../cell-detail-dialog';
import { PasscodeConfirmDialog } from '../passcode-confirm-dialog';
import { CollectionBadge } from '../badges';
import { formatDateTime } from '../utils';

type ChunkCellType = 'id' | 'collection' | 'content' | 'created';

interface ChunksPanelDialogsProps {
	// Cell detail dialog
	cellDialogOpen: boolean;
	onCellDialogOpenChange: (open: boolean) => void;
	selectedItem: AIChunk | null;
	selectedCell: ChunkCellType | null;

	// Delete confirm dialog
	deleteConfirmOpen: boolean;
	onDeleteConfirmOpenChange: (open: boolean) => void;
	chunkToDelete: AIChunk | null;
	onConfirmDelete: () => void;

	// Canonical dialog
	canonicalDialogOpen: boolean;
	onCanonicalDialogOpenChange: (open: boolean) => void;
	relatedCanonical: AICanonicalEntry | null;
}

export function ChunksPanelDialogs({
	cellDialogOpen,
	onCellDialogOpenChange,
	selectedItem,
	selectedCell,
	deleteConfirmOpen,
	onDeleteConfirmOpenChange,
	chunkToDelete,
	onConfirmDelete,
	canonicalDialogOpen,
	onCanonicalDialogOpenChange,
	relatedCanonical,
}: ChunksPanelDialogsProps) {
	const getDialogContent = () => {
		if (!selectedItem || !selectedCell) return null;

		switch (selectedCell) {
			case 'id':
				return (
					<div className="space-y-2">
						<p className="text-2xl font-bold text-foreground">{selectedItem.id}</p>
						<p className="text-sm text-muted-foreground">ID của chunk này</p>
					</div>
				);
			case 'collection':
				return (
					<div className="space-y-2">
						<h3 className="text-sm font-semibold text-foreground">Collection</h3>
						<CollectionBadge collection={selectedItem.collection} />
						<p className="text-sm text-muted-foreground mt-2">Loại collection của chunk này</p>
					</div>
				);
			case 'content':
				return (
					<div className="space-y-2">
						<h3 className="text-sm font-semibold text-foreground">Content</h3>
						<div className="text-sm text-foreground whitespace-pre-wrap bg-slate-50 border rounded-md p-4 max-h-[500px] overflow-y-auto">
							{selectedItem.content}
						</div>
					</div>
				);
			case 'created':
				return (
					<div className="space-y-2">
						<h3 className="text-sm font-semibold text-foreground">Created At</h3>
						<p className="text-lg text-foreground">{formatDateTime(selectedItem.createdAt)}</p>
						<p className="text-sm text-muted-foreground">Thời gian tạo chunk này</p>
						{selectedItem.updatedAt && (
							<>
								<h3 className="text-sm font-semibold text-foreground mt-4">Updated At</h3>
								<p className="text-lg text-foreground">{formatDateTime(selectedItem.updatedAt)}</p>
							</>
						)}
					</div>
				);
			default:
				return null;
		}
	};

	const getDialogTitle = () => {
		if (!selectedItem || !selectedCell) return '';
		const titles: Record<ChunkCellType, string> = {
			id: `ID - Chunk #${selectedItem.id}`,
			collection: 'Collection',
			content: 'Content',
			created: 'Timestamps',
		};
		return titles[selectedCell];
	};

	const getDialogDescription = () => {
		if (!selectedCell) return '';
		const descriptions: Record<ChunkCellType, string> = {
			id: 'ID của chunk',
			collection: 'Loại collection',
			content: 'Nội dung của chunk',
			created: 'Thời gian tạo và cập nhật',
		};
		return descriptions[selectedCell];
	};

	return (
		<>
			<CellDetailDialog
				open={cellDialogOpen}
				onOpenChange={onCellDialogOpenChange}
				title={getDialogTitle()}
				description={getDialogDescription()}
				content={getDialogContent()}
			/>

			<PasscodeConfirmDialog
				open={deleteConfirmOpen}
				onOpenChange={onDeleteConfirmOpenChange}
				onConfirm={onConfirmDelete}
				title="Xóa Chunk"
				description={`Bạn có chắc chắn muốn xóa chunk ID ${chunkToDelete?.id}? Thao tác này không thể hoàn tác.`}
				dangerous={true}
			/>

			<CellDetailDialog
				open={canonicalDialogOpen}
				onOpenChange={onCanonicalDialogOpenChange}
				title={relatedCanonical ? `Canonical Entry #${relatedCanonical.id}` : 'Canonical Entry liên quan'}
				description="Canonical entry liên kết với chunk này"
				content={
					relatedCanonical ? (
						<div className="space-y-4">
							<div className="space-y-2">
								<h3 className="text-sm font-semibold text-foreground">ID</h3>
								<p className="text-lg font-bold text-foreground">{relatedCanonical.id}</p>
							</div>
							<div className="space-y-2">
								<h3 className="text-sm font-semibold text-foreground">Câu hỏi</h3>
								<p className="text-sm text-foreground whitespace-pre-wrap bg-slate-50 border rounded-md p-4">
									{relatedCanonical.question}
								</p>
							</div>
							{relatedCanonical.parameters && Object.keys(relatedCanonical.parameters).length > 0 && (
								<div className="space-y-2">
									<h3 className="text-sm font-semibold text-foreground">Parameters</h3>
									<pre className="text-xs font-mono bg-slate-50 border rounded-md p-4 overflow-x-auto">
										{JSON.stringify(relatedCanonical.parameters, null, 2)}
									</pre>
								</div>
							)}
							<div className="space-y-2">
								<h3 className="text-sm font-semibold text-foreground">SQL Canonical</h3>
								<pre className="text-xs font-mono bg-slate-50 border rounded-md p-4 overflow-x-auto whitespace-pre-wrap">
									{relatedCanonical.sqlCanonical}
								</pre>
							</div>
							{relatedCanonical.sqlTemplate && (
								<div className="space-y-2">
									<h3 className="text-sm font-semibold text-foreground">SQL Template</h3>
									<pre className="text-xs font-mono bg-slate-50 border rounded-md p-4 overflow-x-auto whitespace-pre-wrap">
										{relatedCanonical.sqlTemplate}
									</pre>
								</div>
							)}
							<div className="space-y-2">
								<h3 className="text-sm font-semibold text-foreground">Created At</h3>
								<p className="text-sm text-muted-foreground">{formatDateTime(relatedCanonical.createdAt)}</p>
							</div>
							{relatedCanonical.lastUsedAt && (
								<div className="space-y-2">
									<h3 className="text-sm font-semibold text-foreground">Last Used At</h3>
									<p className="text-sm text-muted-foreground">{formatDateTime(relatedCanonical.lastUsedAt)}</p>
								</div>
							)}
						</div>
					) : (
						<div className="text-center py-4">
							<p className="text-muted-foreground">Đang tải...</p>
						</div>
					)
				}
			/>
		</>
	);
}
