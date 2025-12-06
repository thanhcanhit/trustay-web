"use client";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';

interface CellDetailDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description?: string;
	content: React.ReactNode;
	footer?: React.ReactNode;
}

export function CellDetailDialog({
	open,
	onOpenChange,
	title,
	description,
	content,
	footer,
}: CellDetailDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="w-[800px] max-h-[calc(100vh-10rem)] top-[5rem] bottom-[5rem] flex flex-col">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					{description && <DialogDescription>{description}</DialogDescription>}
				</DialogHeader>

				<div className="flex-1 overflow-y-auto py-4 min-h-0">{content}</div>

				<DialogFooter>{footer || <div className="text-xs text-muted-foreground">Click outside để đóng</div>}</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
