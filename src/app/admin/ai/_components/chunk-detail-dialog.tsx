"use client";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import type { AIChunk } from '@/types/admin-ai';
import { CollectionBadge } from './badges';
import { formatDateTime } from './utils';

interface ChunkDetailDialogProps {
	item: AIChunk | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function ChunkDetailDialog({ item, open, onOpenChange }: ChunkDetailDialogProps) {
	if (!item) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="w-[800px] max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<span>Chunk #{item.id}</span>
					</DialogTitle>
					<DialogDescription>Chi tiết vector store chunk</DialogDescription>
				</DialogHeader>

				<div className="space-y-6 py-4">
					<div className="space-y-2">
						<h3 className="text-sm font-semibold text-foreground">ID</h3>
						<p className="text-sm text-muted-foreground">{item.id}</p>
					</div>

					<Separator />

					<div className="space-y-2">
						<h3 className="text-sm font-semibold text-foreground">Collection</h3>
						<CollectionBadge collection={item.collection} />
					</div>

					<Separator />

					<div className="space-y-2">
						<h3 className="text-sm font-semibold text-foreground">Content</h3>
						<div className="text-sm text-foreground whitespace-pre-wrap bg-slate-50 border rounded-md p-4 max-h-[400px] overflow-y-auto">
							{item.content}
						</div>
					</div>

					<Separator />

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<h3 className="text-sm font-semibold text-foreground">Created At</h3>
							<p className="text-sm text-muted-foreground">{formatDateTime(item.createdAt)}</p>
						</div>
						<div className="space-y-2">
							<h3 className="text-sm font-semibold text-foreground">Updated At</h3>
							<p className="text-sm text-muted-foreground">{formatDateTime(item.updatedAt)}</p>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
