"use client";

import { Badge } from '@/components/ui/badge';
import type { AICollection, AILogStatus } from '@/types/admin-ai';

export function StatusBadge({ status }: { status: AILogStatus }) {
	const styles: Record<AILogStatus, string> = {
		completed: 'bg-green-50 text-green-700 border-green-200',
		failed: 'bg-red-50 text-red-700 border-red-200',
		partial: 'bg-amber-50 text-amber-700 border-amber-200',
	};

	return <Badge className={styles[status]}>{status}</Badge>;
}

export function CollectionBadge({ collection }: { collection: AICollection }) {
	const variants: Record<AICollection, string> = {
		schema: 'bg-blue-50 text-blue-700 border-blue-200',
		qa: 'bg-emerald-50 text-emerald-700 border-emerald-200',
		business: 'bg-purple-50 text-purple-700 border-purple-200',
		docs: 'bg-slate-50 text-slate-700 border-slate-200',
	};

	return <Badge className={variants[collection]}>{collection}</Badge>;
}
