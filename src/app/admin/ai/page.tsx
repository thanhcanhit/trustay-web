"use client";

import { useEffect, useState } from 'react';
import { Brain, BookOpenCheck, Database, ListChecks, Wand2 } from 'lucide-react';

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
import { getCanonicalChunkId, getChunkCanonicalId } from '@/actions/admin-ai.action';
import { toast } from 'sonner';

type PanelType = 'canonical' | 'chunks' | 'logs' | 'teach';

const menuItems = [
	{
		value: 'canonical' as PanelType,
		label: 'Canonical',
		icon: BookOpenCheck,
		description: 'SQL QA entries',
	},
	{
		value: 'chunks' as PanelType,
		label: 'Chunks',
		icon: Database,
		description: 'Vector store content',
	},
	{
		value: 'logs' as PanelType,
		label: 'Logs',
		icon: ListChecks,
		description: 'Processing logs',
	},
	{
		value: 'teach' as PanelType,
		label: 'Teach/Update',
		icon: Wand2,
		description: 'Add or update knowledge',
	},
];

export default function AdminAIPage() {
	const [isVerified, setIsVerified] = useState(false);
	const [activePanel, setActivePanel] = useState<PanelType>('canonical');
	const [canonicalSearchId, setCanonicalSearchId] = useState<string>('');
	const [chunksSearchId, setChunksSearchId] = useState<string>('');

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

	const renderPanel = () => {
		switch (activePanel) {
			case 'canonical':
				return <CanonicalPanel onNavigateToChunks={handleNavigateToChunks} initialSearchId={canonicalSearchId} onSearchIdCleared={() => setCanonicalSearchId('')} />;
			case 'chunks':
				return <ChunksPanel onNavigateToCanonical={handleNavigateToCanonical} initialSearchId={chunksSearchId} onSearchIdCleared={() => setChunksSearchId('')} />;
			case 'logs':
				return <LogsPanel />;
			case 'teach':
				return <TeachPanel />;
			default:
				return <CanonicalPanel onNavigateToChunks={handleNavigateToChunks} initialSearchId={canonicalSearchId} onSearchIdCleared={() => setCanonicalSearchId('')} />;
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
					<SidebarContent className='mt'>
						<SidebarGroup>
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
