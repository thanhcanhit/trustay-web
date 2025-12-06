"use client";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import type { AILogEntry } from '@/types/admin-ai';
import { StatusBadge } from './badges';
import { formatDateTime, formatDuration } from './utils';

interface LogDetailDialogProps {
	item: AILogEntry | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function LogDetailDialog({ item, open, onOpenChange }: LogDetailDialogProps) {
	if (!item) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="w-[800px] max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<span>Log Entry</span>
						<StatusBadge status={item.status} />
					</DialogTitle>
					<DialogDescription>Chi tiết log xử lý AI</DialogDescription>
				</DialogHeader>

				<div className="space-y-6 py-4">
					<div className="space-y-2">
						<h3 className="text-sm font-semibold text-foreground">ID</h3>
						<p className="text-sm font-mono text-muted-foreground break-all">{item.id}</p>
					</div>

					<Separator />

					<div className="space-y-2">
						<h3 className="text-sm font-semibold text-foreground">Status</h3>
						<StatusBadge status={item.status} />
					</div>

					<Separator />

					<div className="space-y-2">
						<h3 className="text-sm font-semibold text-foreground">Question</h3>
						<p className="text-sm text-foreground whitespace-pre-wrap bg-slate-50 border rounded-md p-4">
							{item.question}
						</p>
					</div>

					{item.response && (
						<>
							<Separator />
							<div className="space-y-2">
								<h3 className="text-sm font-semibold text-foreground">Response</h3>
								<div className="text-sm text-foreground whitespace-pre-wrap bg-green-50 border border-green-200 rounded-md p-4 max-h-[300px] overflow-y-auto">
									{item.response}
								</div>
							</div>
						</>
					)}

					{item.error && (
						<>
							<Separator />
							<div className="space-y-2">
								<h3 className="text-sm font-semibold text-red-600">Error</h3>
								<div className="text-sm text-red-600 whitespace-pre-wrap bg-red-50 border border-red-200 rounded-md p-4 max-h-[300px] overflow-y-auto">
									{item.error}
								</div>
							</div>
						</>
					)}

					<Separator />

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<h3 className="text-sm font-semibold text-foreground">Duration</h3>
							<p className="text-sm text-muted-foreground">{formatDuration(item.totalDuration)}</p>
						</div>
						<div className="space-y-2">
							<h3 className="text-sm font-semibold text-foreground">Created At</h3>
							<p className="text-sm text-muted-foreground">{formatDateTime(item.createdAt)}</p>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
