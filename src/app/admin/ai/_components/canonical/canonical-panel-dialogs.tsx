"use client";

import type { AICanonicalEntry, AIChunk } from '@/types/admin-ai';
import { CellDetailDialog } from '../cell-detail-dialog';
import { PasscodeConfirmDialog } from '../passcode-confirm-dialog';
import { CollectionBadge } from '../badges';
import { formatDateTime } from '../utils';

type CellType = 'id' | 'question' | 'sql' | 'created' | 'lastUsed';

interface CanonicalPanelDialogsProps {
	// Cell detail dialog
	cellDialogOpen: boolean;
	onCellDialogOpenChange: (open: boolean) => void;
	selectedItem: AICanonicalEntry | null;
	selectedCell: CellType | null;

	// Delete confirm dialog
	deleteConfirmOpen: boolean;
	onDeleteConfirmOpenChange: (open: boolean) => void;
	sqlQAToDelete: AICanonicalEntry | null;
	onConfirmDelete: () => void;

	// Chunk dialog
	chunkDialogOpen: boolean;
	onChunkDialogOpenChange: (open: boolean) => void;
	relatedChunk: AIChunk | null;
}

export function CanonicalPanelDialogs({
	cellDialogOpen,
	onCellDialogOpenChange,
	selectedItem,
	selectedCell,
	deleteConfirmOpen,
	onDeleteConfirmOpenChange,
	sqlQAToDelete,
	onConfirmDelete,
	chunkDialogOpen,
	onChunkDialogOpenChange,
	relatedChunk,
}: CanonicalPanelDialogsProps) {
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
				title="Xóa SQL QA"
				description={`Bạn có chắc chắn muốn xóa SQL QA ID ${sqlQAToDelete?.id}? Thao tác này sẽ xóa cả chunks liên kết và không thể hoàn tác.`}
				dangerous={true}
			/>

			<CellDetailDialog
				open={chunkDialogOpen}
				onOpenChange={onChunkDialogOpenChange}
				title={relatedChunk ? `Chunk #${relatedChunk.id}` : 'Chunk liên quan'}
				description="Chunk liên kết với canonical entry này"
				content={
					relatedChunk ? (
						<div className="space-y-4">
							<div className="space-y-2">
								<h3 className="text-sm font-semibold text-foreground">ID</h3>
								<p className="text-lg font-bold text-foreground">{relatedChunk.id}</p>
							</div>
							<div className="space-y-2">
								<h3 className="text-sm font-semibold text-foreground">Collection</h3>
								<CollectionBadge collection={relatedChunk.collection} />
							</div>
							<div className="space-y-2">
								<h3 className="text-sm font-semibold text-foreground">Content</h3>
								<div className="text-sm text-foreground whitespace-pre-wrap bg-slate-50 border rounded-md p-4 max-h-[500px] overflow-y-auto">
									{relatedChunk.content}
								</div>
							</div>
							<div className="space-y-2">
								<h3 className="text-sm font-semibold text-foreground">Created At</h3>
								<p className="text-sm text-muted-foreground">{formatDateTime(relatedChunk.createdAt)}</p>
							</div>
							{relatedChunk.updatedAt && (
								<div className="space-y-2">
									<h3 className="text-sm font-semibold text-foreground">Updated At</h3>
									<p className="text-sm text-muted-foreground">{formatDateTime(relatedChunk.updatedAt)}</p>
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
