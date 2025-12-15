"use client";

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
	getPendingKnowledge,
	approvePendingKnowledge,
	rejectPendingKnowledge,
} from '@/actions/admin-ai.action';
import type {
	PendingKnowledge,
	PendingKnowledgeStatus,
	AdminAIPaginatedResponse,
} from '@/types/admin-ai';
import { PaginationControls } from './pagination-controls';
import { PendingKnowledgePanelHeader } from './pending-knowledge/pending-knowledge-panel-header';
import { PendingKnowledgePanelSearch } from './pending-knowledge/pending-knowledge-panel-search';
import { PendingKnowledgePanelTable } from './pending-knowledge/pending-knowledge-panel-table';
import { PendingKnowledgePanelDialog } from './pending-knowledge/pending-knowledge-panel-dialog';

export function PendingKnowledgePanel() {
	const queryClient = useQueryClient();
	const [searchInput, setSearchInput] = useState('');
	const [search, setSearch] = useState('');
	const [status, setStatus] = useState<PendingKnowledgeStatus | 'all'>('all');
	const [limit, setLimit] = useState(20);
	const [offset, setOffset] = useState(0);
	const [selectedItem, setSelectedItem] = useState<PendingKnowledge | null>(null);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [actionNote, setActionNote] = useState('');

	const { data, isLoading, isFetching, isError, error, refetch } = useQuery<
		AdminAIPaginatedResponse<PendingKnowledge>,
		Error
	>({
		queryKey: ['admin-ai-pending-knowledge', search, status, limit, offset],
		queryFn: () =>
			getPendingKnowledge({
				search: search || undefined,
				status: status === 'all' ? undefined : status,
				limit,
				offset,
			}),
		placeholderData: (previousData) => previousData,
	});

	const approveMutation = useMutation({
		mutationFn: (id: string) => approvePendingKnowledge(id, { note: actionNote || undefined }),
		onSuccess: () => {
			toast.success('Đã approve thành công');
			setDialogOpen(false);
			setActionNote('');
			setSelectedItem(null);
			void queryClient.invalidateQueries({ queryKey: ['admin-ai-pending-knowledge'] });
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Không thể approve');
		},
	});

	const rejectMutation = useMutation({
		mutationFn: (id: string) => rejectPendingKnowledge(id, { reason: actionNote }),
		onSuccess: () => {
			toast.success('Đã reject thành công');
			setDialogOpen(false);
			setActionNote('');
			setSelectedItem(null);
			void queryClient.invalidateQueries({ queryKey: ['admin-ai-pending-knowledge'] });
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Không thể reject');
		},
	});

	const total = data?.total ?? 0;
	const isEmpty = !isLoading && !isError && (data?.items.length ?? 0) === 0;

	const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setOffset(0);
		setSearch(searchInput.trim());
	};

	const handleReset = () => {
		setSearch('');
		setSearchInput('');
		setStatus('all');
		setOffset(0);
		void refetch();
	};

	const handleOpenDialog = (item: PendingKnowledge) => {
		setSelectedItem(item);
		setActionNote('');
		setDialogOpen(true);
	};

	const handleApproveSubmit = () => {
		if (!selectedItem) return;
		approveMutation.mutate(selectedItem.id);
	};

	const handleRejectSubmit = () => {
		if (!selectedItem || !actionNote.trim()) {
			toast.error('Vui lòng nhập lý do reject');
			return;
		}
		rejectMutation.mutate(selectedItem.id);
	};

	return (
		<div className="flex flex-col gap-2">
			<PendingKnowledgePanelHeader
				limit={limit}
				onLimitChange={(newLimit) => {
					setLimit(newLimit);
					setOffset(0);
				}}
				onRefresh={() => void refetch()}
			/>

			<PendingKnowledgePanelSearch
				searchInput={searchInput}
				onSearchInputChange={setSearchInput}
				status={status}
				onStatusChange={(newStatus) => {
					setStatus(newStatus);
					setOffset(0);
				}}
				onSearch={handleSearch}
				onReset={handleReset}
			/>

			<PendingKnowledgePanelTable
				data={data?.items}
				isLoading={isLoading}
				isError={isError}
				errorMessage={error?.message}
				empty={isEmpty}
				onViewDetail={handleOpenDialog}
			/>

			<PaginationControls
				total={total}
				limit={limit}
				offset={offset}
				onPrev={() => setOffset(Math.max(0, offset - limit))}
				onNext={() => setOffset(offset + limit)}
				isLoading={isFetching}
			/>

			<PendingKnowledgePanelDialog
				open={dialogOpen}
				onOpenChange={setDialogOpen}
				selectedItem={selectedItem}
				actionNote={actionNote}
				onActionNoteChange={setActionNote}
				onApprove={handleApproveSubmit}
				onReject={handleRejectSubmit}
				isApproving={approveMutation.isPending}
				isRejecting={rejectMutation.isPending}
			/>
		</div>
	);
}
