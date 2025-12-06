"use client";

import { useEffect, useState } from 'react';
import { Brain, Clock, ListFilter, ShieldCheck } from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PASS_STORAGE_KEY } from './_components/constants';
import { CanonicalPanel } from './_components/canonical-panel';
import { ChunksPanel } from './_components/chunks-panel';
import { LogsPanel } from './_components/logs-panel';
import { PasscodeGate } from './_components/passcode-gate';
import { TeachPanel } from './_components/teach-panel';

export default function AdminAIPage() {
	const [isVerified, setIsVerified] = useState(false);

	useEffect(() => {
		if (typeof window === 'undefined') return;
		const stored = sessionStorage.getItem(PASS_STORAGE_KEY);
		if (stored === 'true') {
			setIsVerified(true);
		}
	}, []);

	if (!isVerified) {
		return <PasscodeGate onVerified={() => setIsVerified(true)} />;
	}

	return (
		<div className="container mx-auto px-4 py-8 space-y-6">
			<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
				<div className="space-y-1">
					<h1 className="text-2xl font-bold flex items-center gap-2">
						<Brain className="size-6 text-green-600" />
						Admin AI Control
					</h1>
					<p className="text-muted-foreground">
						Trang điều khiển nội bộ cho AI theo tài liệu <code>/api/admin/ai</code>.
					</p>
					<div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
						<ListFilter className="size-3.5" />
						Canonical · Chunks · Logs · Teach/Update
					</div>
				</div>
				<div className="flex items-center gap-3 text-sm text-muted-foreground">
					<div className="flex items-center gap-2">
						<ShieldCheck className="size-4 text-green-600" />
						JWT required
					</div>
					<div className="flex items-center gap-2">
						<Clock className="size-4 text-amber-600" />
						Pagination hỗ trợ limit/offset
					</div>
				</div>
			</div>

			<Tabs defaultValue="canonical" className="space-y-4">
				<TabsList className="flex flex-wrap">
					<TabsTrigger value="canonical" className="gap-2">
						Canonical
					</TabsTrigger>
					<TabsTrigger value="chunks" className="gap-2">
						Chunks
					</TabsTrigger>
					<TabsTrigger value="logs" className="gap-2">
						Logs
					</TabsTrigger>
					<TabsTrigger value="teach" className="gap-2">
						Teach/Update
					</TabsTrigger>
				</TabsList>

				<TabsContent value="canonical">
					<CanonicalPanel />
				</TabsContent>
				<TabsContent value="chunks">
					<ChunksPanel />
				</TabsContent>
				<TabsContent value="logs">
					<LogsPanel />
				</TabsContent>
				<TabsContent value="teach">
					<TeachPanel />
				</TabsContent>
			</Tabs>
		</div>
	);
}
