"use client";

import { Wand2, ShieldCheck } from 'lucide-react';

export function TeachPanelHeader() {
	return (
		<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
			<div className="flex items-center gap-2">
				<div className="bg-indigo-50 text-indigo-700 p-2 rounded-lg border border-indigo-100">
					<Wand2 className="size-4" />
				</div>
				<div>
					<h2 className="text-base sm:text-lg font-semibold">Teach / Update</h2>
					<p className="text-sm text-muted-foreground">Thêm mới hoặc chỉnh sửa canonical SQL QA.</p>
				</div>
			</div>
			<div className="flex items-center gap-2 text-xs text-muted-foreground">
				<ShieldCheck className="size-4" />
				Token JWT tự đính kèm qua TokenManager.
			</div>
		</div>
	);
}
