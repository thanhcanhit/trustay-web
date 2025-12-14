"use client";

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { getCanonicalEntries, deleteSQLQA, exportGoldenData, getCanonicalChunkId, getAIChunks } from '@/actions/admin-ai.action';
import type { AICanonicalEntry, AdminAIPaginatedResponse, AIChunk } from '@/types/admin-ai';
import { PaginationControls } from './pagination-controls';
import { toast } from 'sonner';
import { CanonicalPanelHeader } from './canonical/canonical-panel-header';
import { CanonicalPanelSearch } from './canonical/canonical-panel-search';
import { CanonicalPanelTable } from './canonical/canonical-panel-table';
import { CanonicalPanelDialogs } from './canonical/canonical-panel-dialogs';

type CellType = 'id' | 'question' | 'sql' | 'created' | 'lastUsed';

interface CanonicalPanelProps {
	onNavigateToChunks?: (canonicalId: number) => Promise<void>;
	onNavigateToUpdate?: (item: AICanonicalEntry) => void;
	initialSearchId?: string;
	onSearchIdCleared?: () => void;
}

export function CanonicalPanel({ onNavigateToChunks, onNavigateToUpdate, initialSearchId, onSearchIdCleared }: CanonicalPanelProps = {}) {
	const queryClient = useQueryClient();
	const [searchInput, setSearchInput] = useState('');
	const [search, setSearch] = useState('');
	const [limit, setLimit] = useState(20);
	const [offset, setOffset] = useState(0);
	const [selectedItem, setSelectedItem] = useState<AICanonicalEntry | null>(null);
	const [selectedCell, setSelectedCell] = useState<CellType | null>(null);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
	const [sqlQAToDelete, setSqlQAToDelete] = useState<AICanonicalEntry | null>(null);
	const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');
	const [isExporting, setIsExporting] = useState(false);
	const [chunkDialogOpen, setChunkDialogOpen] = useState(false);
	const [relatedChunk, setRelatedChunk] = useState<AIChunk | null>(null);
	const [isLoadingChunk, setIsLoadingChunk] = useState(false);

	useEffect(() => {
		if (initialSearchId) {
			setSearchInput(initialSearchId);
			setSearch(initialSearchId);
			setOffset(0);
			if (onSearchIdCleared) {
				onSearchIdCleared();
			}
		}
	}, [initialSearchId, onSearchIdCleared]);

	const { data, isLoading, isFetching, isError, error, refetch } = useQuery<
		AdminAIPaginatedResponse<AICanonicalEntry>,
		Error
	>({
		queryKey: ['admin-ai-canonical', search, limit, offset],
		queryFn: () =>
			getCanonicalEntries({
				search: search || undefined,
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
		setOffset(0);
		void refetch();
	};

	const handleCellClick = (item: AICanonicalEntry, cellType: CellType) => {
		setSelectedItem(item);
		setSelectedCell(cellType);
		setDialogOpen(true);
	};

	const deleteMutation = useMutation({
		mutationFn: (sqlQAId: number) => deleteSQLQA(sqlQAId),
		onSuccess: () => {
			toast.success('Đã xóa SQL QA thành công (bao gồm cả chunks liên kết)');
			void queryClient.invalidateQueries({ queryKey: ['admin-ai-canonical'] });
			void queryClient.invalidateQueries({ queryKey: ['admin-ai-chunks'] });
			setSqlQAToDelete(null);
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Không thể xóa SQL QA');
		},
	});

	const handleDeleteClick = (item: AICanonicalEntry, e: React.MouseEvent) => {
		e.stopPropagation();
		setSqlQAToDelete(item);
		setDeleteConfirmOpen(true);
	};

	const handleConfirmDelete = () => {
		if (sqlQAToDelete) {
			deleteMutation.mutate(sqlQAToDelete.id);
		}
	};

	const handleViewChunks = async (item: AICanonicalEntry, e: React.MouseEvent) => {
		e.stopPropagation();
		setIsLoadingChunk(true);
		setRelatedChunk(null);
		try {
			const response = await getCanonicalChunkId(item.id);
			if (response.chunkId) {
				// Fetch chunk details
				const chunksResponse = await getAIChunks({ search: response.chunkId.toString(), limit: 1 });
				if (chunksResponse.items.length > 0) {
					setRelatedChunk(chunksResponse.items[0]);
					setChunkDialogOpen(true);
				} else {
					toast.error('Không tìm thấy chunk với ID này');
				}
			} else {
				toast.error('Canonical entry này chưa có chunk liên kết');
			}
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Không thể tải chunk liên quan';
			toast.error(message);
		} finally {
			setIsLoadingChunk(false);
		}
	};

	const handleExport = async (format: 'json' | 'csv' = exportFormat) => {
		setIsExporting(true);
		try {
			const blob = await exportGoldenData({
				format: format,
				search: search || undefined,
				limit: undefined, // Export all, không giới hạn
			});

			// Create download link
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			const timestamp = new Date().toISOString().split('T')[0];
			const searchSuffix = search ? `_${search.replace(/\s+/g, '_')}` : '';
			link.download = `golden-data${searchSuffix}_${timestamp}.${format}`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);

			toast.success(`Đã export thành công (${format.toUpperCase()})`);
			setExportFormat(format); // Update state for next time
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Không thể export golden data';
			toast.error(message);
		} finally {
			setIsExporting(false);
		}
	};


	return (
		<div className="flex flex-col gap-2">
			<CanonicalPanelHeader
				limit={limit}
				onLimitChange={(newLimit) => {
					setLimit(newLimit);
					setOffset(0);
				}}
				onRefresh={() => void refetch()}
				onExport={handleExport}
				isExporting={isExporting}
			/>

			<CanonicalPanelSearch
				searchInput={searchInput}
				onSearchInputChange={setSearchInput}
				onSearch={handleSearch}
				onReset={handleReset}
			/>

			<CanonicalPanelTable
				data={data?.items}
				isLoading={isLoading}
				isError={isError}
				errorMessage={error?.message}
				empty={isEmpty}
				onCellClick={handleCellClick}
				onNavigateToUpdate={onNavigateToUpdate}
				onViewChunks={handleViewChunks}
				onDelete={handleDeleteClick}
				isLoadingChunk={isLoadingChunk}
				isDeleting={deleteMutation.isPending}
			/>

			<PaginationControls
				total={total}
				limit={limit}
				offset={offset}
				onPrev={() => setOffset(Math.max(0, offset - limit))}
				onNext={() => setOffset(offset + limit)}
				isLoading={isFetching}
			/>

			<CanonicalPanelDialogs
				cellDialogOpen={dialogOpen}
				onCellDialogOpenChange={setDialogOpen}
				selectedItem={selectedItem}
				selectedCell={selectedCell}
				deleteConfirmOpen={deleteConfirmOpen}
				onDeleteConfirmOpenChange={setDeleteConfirmOpen}
				sqlQAToDelete={sqlQAToDelete}
				onConfirmDelete={handleConfirmDelete}
				chunkDialogOpen={chunkDialogOpen}
				onChunkDialogOpenChange={setChunkDialogOpen}
				relatedChunk={relatedChunk}
			/>
		</div>
	);
}
