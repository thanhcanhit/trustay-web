"use client";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import type { AICanonicalEntry } from '@/types/admin-ai';
import { formatDateTime } from './utils';

interface CanonicalDetailDialogProps {
	item: AICanonicalEntry | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function CanonicalDetailDialog({
	item,
	open,
	onOpenChange,
}: CanonicalDetailDialogProps) {
	if (!item) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="w-[800px] max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<span>Canonical Entry #{item.id}</span>
					</DialogTitle>
					<DialogDescription>Chi tiết SQL QA entry</DialogDescription>
				</DialogHeader>

				<div className="space-y-6 py-4">
					<div className="space-y-2">
						<h3 className="text-sm font-semibold text-foreground">ID</h3>
						<p className="text-sm text-muted-foreground">{item.id}</p>
					</div>

					<Separator />

					<div className="space-y-2">
						<h3 className="text-sm font-semibold text-foreground">Câu hỏi</h3>
						<p className="text-sm text-foreground whitespace-pre-wrap">{item.question}</p>
					</div>

					<Separator />

					<div className="space-y-2">
						<h3 className="text-sm font-semibold text-foreground">SQL Canonical</h3>
						<pre className="text-xs font-mono bg-slate-50 border rounded-md p-4 overflow-x-auto">
							{item.sqlCanonical}
						</pre>
					</div>

					{item.sqlTemplate && (
						<>
							<Separator />
							<div className="space-y-2">
								<h3 className="text-sm font-semibold text-foreground">SQL Template</h3>
								<pre className="text-xs font-mono bg-slate-50 border rounded-md p-4 overflow-x-auto">
									{item.sqlTemplate}
								</pre>
							</div>
						</>
					)}

					{item.parameters && Object.keys(item.parameters).length > 0 && (
						<>
							<Separator />
							<div className="space-y-2">
								<h3 className="text-sm font-semibold text-foreground">Parameters</h3>
								<pre className="text-xs font-mono bg-slate-50 border rounded-md p-4 overflow-x-auto">
									{JSON.stringify(item.parameters, null, 2)}
								</pre>
							</div>
						</>
					)}

					<Separator />

					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="space-y-2">
							<h3 className="text-sm font-semibold text-foreground">Created At</h3>
							<p className="text-sm text-muted-foreground">{formatDateTime(item.createdAt)}</p>
						</div>
						<div className="space-y-2">
							<h3 className="text-sm font-semibold text-foreground">Updated At</h3>
							<p className="text-sm text-muted-foreground">{formatDateTime(item.updatedAt)}</p>
						</div>
						<div className="space-y-2">
							<h3 className="text-sm font-semibold text-foreground">Last Used At</h3>
							<p className="text-sm text-muted-foreground">
								{item.lastUsedAt ? formatDateTime(item.lastUsedAt) : 'Chưa dùng'}
							</p>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
