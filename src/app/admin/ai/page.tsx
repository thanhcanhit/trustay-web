"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Brain, Database, CheckCircle2, GraduationCap, Gem, StepForward } from 'lucide-react';

import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarInset,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
	SidebarTrigger,
} from '@/components/ui/sidebar';
import { PASS_STORAGE_KEY } from './_components/constants';
import { CanonicalPanel } from './_components/canonical-panel';
import { ChunksPanel } from './_components/chunks-panel';
import { LogsPanel } from './_components/logs-panel';
import { PasscodeGate } from './_components/passcode-gate';
import { TeachPanel } from './_components/teach-panel';
import { PendingKnowledgePanel } from './_components/pending-knowledge-panel';
import { getCanonicalChunkId, getChunkCanonicalId } from '@/actions/admin-ai.action';
import { toast } from 'sonner';
import type { AICanonicalEntry } from '@/types/admin-ai';

type PanelType = 'canonical' | 'chunks' | 'logs' | 'teach' | 'pending';

const menuItems = [
	{
		value: 'canonical' as PanelType,
		label: 'Golden Data',
		icon: Gem,
		description: 'SQL QA entries',
	},
	{
		value: 'pending' as PanelType,
		label: 'Knowledge Validation',
		icon: CheckCircle2,
		description: 'Verify and approve SQL',
	},
	{
		value: 'logs' as PanelType,
		label: 'AI Processing Logs',
		icon: StepForward,
		description: 'Processing logs',
	},
	{
		value: 'teach' as PanelType,
		label: 'Teaching Knowledge',
		icon: GraduationCap,
		description: 'Add or update knowledge',
	},
	{
		value: 'chunks' as PanelType,
		label: 'Vector Store',
		icon: Database,
		description: 'Vector store content',
	},
];

function AdminAIPageContent() {
	const searchParams = useSearchParams();
	const router = useRouter();
	
	const [isVerified, setIsVerified] = useState(false);
	const [isInitialized, setIsInitialized] = useState(false);
	const [activePanel, setActivePanel] = useState<PanelType>('canonical');
	const [canonicalSearchId, setCanonicalSearchId] = useState<string>('');
	const [chunksSearchId, setChunksSearchId] = useState<string>('');
	const [teachPanelInitialData, setTeachPanelInitialData] = useState<{
		id: number;
		question: string;
		sql: string;
	} | undefined>(undefined);

	// Initialize from URL params
	useEffect(() => {
		if (typeof window === 'undefined') return;
		const stored = sessionStorage.getItem(PASS_STORAGE_KEY);
		if (stored === 'true') {
			setIsVerified(true);
		}

		// Read panel from URL
		const panelParam = searchParams.get('panel') as PanelType;
		if (panelParam && ['canonical', 'chunks', 'logs', 'teach', 'pending'].includes(panelParam)) {
			setActivePanel(panelParam);
		}

		// Read search IDs from URL
		const canonicalId = searchParams.get('canonicalId');
		if (canonicalId) {
			setCanonicalSearchId(canonicalId);
		}

		const chunkId = searchParams.get('chunkId');
		if (chunkId) {
			setChunksSearchId(chunkId);
		}

		setIsInitialized(true);
	}, [searchParams]);

	// Update URL params when activePanel changes (only after initialization)
	useEffect(() => {
		if (!isVerified || !isInitialized) return;
		
		const current = new URLSearchParams(Array.from(searchParams.entries()));
		
		if (activePanel === 'canonical') {
			current.set('panel', 'canonical');
			if (canonicalSearchId) {
				current.set('canonicalId', canonicalSearchId);
			} else {
				current.delete('canonicalId');
			}
			current.delete('chunkId');
		} else if (activePanel === 'chunks') {
			current.set('panel', 'chunks');
			if (chunksSearchId) {
				current.set('chunkId', chunksSearchId);
			} else {
				current.delete('chunkId');
			}
			current.delete('canonicalId');
		} else {
			current.set('panel', activePanel);
			current.delete('canonicalId');
			current.delete('chunkId');
		}

		const query = current.toString();
		const newUrl = query ? `?${query}` : '';
		const currentUrl = searchParams.toString();
		const newUrlString = query;
		
		// Only update if URL actually changed
		if (currentUrl !== newUrlString) {
			router.replace(`/admin/ai${newUrl}`, { scroll: false });
		}
	}, [activePanel, canonicalSearchId, chunksSearchId, isVerified, isInitialized, router, searchParams]);

	if (!isVerified) {
		return <PasscodeGate onVerified={() => setIsVerified(true)} />;
	}

	const handleNavigateToChunks = async (canonicalId: number) => {
		try {
			const response = await getCanonicalChunkId(canonicalId);
			if (response.chunkId) {
				setChunksSearchId(response.chunkId.toString());
				setActivePanel('chunks');
			} else {
				toast.error('Không tìm thấy chunk liên kết với canonical này');
			}
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Không thể tải chunk ID';
			toast.error(message);
		}
	};

	const handleNavigateToCanonical = async (chunkId: number) => {
		try {
			const response = await getChunkCanonicalId(chunkId);
			if (response.sqlQAId) {
				setCanonicalSearchId(response.sqlQAId.toString());
				setActivePanel('canonical');
			} else {
				toast.error('Không tìm thấy canonical liên kết với chunk này');
			}
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Không thể tải canonical ID';
			toast.error(message);
		}
	};

	const handleNavigateToUpdate = (item: AICanonicalEntry) => {
		setTeachPanelInitialData({
			id: item.id,
			question: item.question,
			sql: item.sqlCanonical,
		});
		setActivePanel('teach');
	};

	const renderPanel = () => {
		switch (activePanel) {
			case 'canonical':
				return <CanonicalPanel onNavigateToChunks={handleNavigateToChunks} onNavigateToUpdate={handleNavigateToUpdate} initialSearchId={canonicalSearchId} onSearchIdCleared={() => setCanonicalSearchId('')} />;
			case 'chunks':
				return <ChunksPanel onNavigateToCanonical={handleNavigateToCanonical} initialSearchId={chunksSearchId} onSearchIdCleared={() => setChunksSearchId('')} />;
			case 'logs':
				return <LogsPanel />;
			case 'pending':
				return <PendingKnowledgePanel />;
			case 'teach':
				return <TeachPanel initialData={teachPanelInitialData} />;
			default:
				return <CanonicalPanel onNavigateToChunks={handleNavigateToChunks} onNavigateToUpdate={handleNavigateToUpdate} initialSearchId={canonicalSearchId} onSearchIdCleared={() => setCanonicalSearchId('')} />;
		}
	};

	return (
		<div className="h-auto flex flex-col scroll -mt-12">
			<SidebarProvider>
				<Sidebar>
					<SidebarHeader className="border-b border-sidebar-border">
						<div className="flex items-center gap-2 px-2 py-4">
							<div className="bg-green-50 text-green-700 p-2 rounded-lg border border-green-100">
								<Brain className="size-5" />
							</div>
							<div className="flex-1 min-w-0">
								<h2 className="text-lg font-semibold truncate">Trustay AI</h2>
								<p className="text-xs text-muted-foreground truncate">Knowledge Management</p>
							</div>
						</div>
					</SidebarHeader>
					<SidebarContent className="flex flex-col">
						<SidebarGroup className="flex-1">
							<SidebarGroupLabel>Navigation</SidebarGroupLabel>
							<SidebarGroupContent>
								<SidebarMenu>
									{menuItems.map((item) => {
										const Icon = item.icon;
										return (
											<SidebarMenuItem key={item.value}>
												<SidebarMenuButton
													isActive={activePanel === item.value}
													onClick={() => setActivePanel(item.value)}
													tooltip={item.description}
												>
													<Icon />
													<span>{item.label}</span>
												</SidebarMenuButton>
											</SidebarMenuItem>
										);
									})}
								</SidebarMenu>
							</SidebarGroupContent>
						</SidebarGroup>
						<div className="px-2 py-2 ">
							<p className="text-xs text-muted-foreground text-center">From Zero to Golden </p>
						</div>
					</SidebarContent>
				</Sidebar>
				<SidebarInset>
					<div className="flex flex-1 flex-col gap-2 p-4 overflow-x-hidden overflow-y-auto relative">
						<SidebarTrigger className="sticky top-0 left-0 z-10 -ml-1" />
						{renderPanel()}
					</div>
				</SidebarInset>
			</SidebarProvider>
		</div>
	);
}

export default function AdminAIPage() {
	return (
		<Suspense fallback={
			<div className="h-screen flex items-center justify-center">
				<div className="text-center">
					<p className="text-muted-foreground">Loading...</p>
				</div>
			</div>
		}>
			<AdminAIPageContent />
		</Suspense>
	);
}
