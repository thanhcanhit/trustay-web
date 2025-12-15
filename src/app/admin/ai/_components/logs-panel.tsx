"use client";

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { getAILogs } from '@/actions/admin-ai.action';
import type { AILogEntry, AILogStatus, AdminAIPaginatedResponse } from '@/types/admin-ai';
import { PaginationControls } from './pagination-controls';
import { LogsPanelHeader } from './logs/logs-panel-header';
import { LogsPanelSearch } from './logs/logs-panel-search';
import { LogsPanelTable } from './logs/logs-panel-table';
import { LogsPanelDialogs } from './logs/logs-panel-dialogs';

type LogCellType = 'id' | 'question' | 'status' | 'error' | 'duration' | 'created' | 'orchestrator' | 'sqlGeneration' | 'validator' | 'ragContext' | 'tokenUsage' | 'stepsLog';

export function LogsPanel() {
	const [searchInput, setSearchInput] = useState('');
	const [search, setSearch] = useState('');
	const [status, setStatus] = useState<AILogStatus | 'all'>('all');
	const [limit, setLimit] = useState(20);
	const [offset, setOffset] = useState(0);
	const [selectedItem, setSelectedItem] = useState<AILogEntry | null>(null);
	const [selectedCell, setSelectedCell] = useState<LogCellType | null>(null);
	const [dialogOpen, setDialogOpen] = useState(false);

	const { data, isLoading, isFetching, isError, error, refetch } = useQuery<
		AdminAIPaginatedResponse<AILogEntry>,
		Error
	>({
		queryKey: ['admin-ai-logs', search, status, limit, offset],
		queryFn: () =>
			getAILogs({
				search: search || undefined,
				status: status === 'all' ? undefined : status,
				limit,
				offset,
			}),
		placeholderData: (previousData) => previousData,
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

	const handleCellClick = (item: AILogEntry, cellType: LogCellType) => {
		setSelectedItem(item);
		setSelectedCell(cellType);
		setDialogOpen(true);
	};

	const handleViewAll = (item: AILogEntry) => {
		setSelectedItem(item);
		setSelectedCell('question');
		setDialogOpen(true);
	};

	return (
		<div className="flex flex-col gap-2">
			<LogsPanelHeader
				limit={limit}
				onLimitChange={(newLimit) => {
					setLimit(newLimit);
					setOffset(0);
				}}
				onRefresh={() => void refetch()}
			/>

			<LogsPanelSearch
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

			<LogsPanelTable
				data={data?.items}
				isLoading={isLoading}
				isError={isError}
				errorMessage={error?.message}
				empty={isEmpty}
				onCellClick={handleCellClick}
				onViewAll={handleViewAll}
			/>

			<PaginationControls
				total={total}
				limit={limit}
				offset={offset}
				onPrev={() => setOffset(Math.max(0, offset - limit))}
				onNext={() => setOffset(offset + limit)}
				isLoading={isFetching}
			/>

			<LogsPanelDialogs
				dialogOpen={dialogOpen}
				onDialogOpenChange={setDialogOpen}
				selectedItem={selectedItem}
				selectedCell={selectedCell}
			/>
		</div>
	);
}
