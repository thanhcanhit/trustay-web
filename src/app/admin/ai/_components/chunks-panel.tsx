"use client";

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { getAIChunks, deleteChunk, getChunkCanonicalId, getCanonicalEntries } from '@/actions/admin-ai.action';
import type { AIChunk, AICollection, AdminAIPaginatedResponse, AICanonicalEntry } from '@/types/admin-ai';
import { PaginationControls } from './pagination-controls';
import { toast } from 'sonner';
import { ChunksPanelHeader } from './chunks/chunks-panel-header';
import { ChunksPanelSearch } from './chunks/chunks-panel-search';
import { ChunksPanelTable } from './chunks/chunks-panel-table';
import { ChunksPanelDialogs } from './chunks/chunks-panel-dialogs';

type ChunkCellType = 'id' | 'collection' | 'content' | 'created';

interface ChunksPanelProps {
	onNavigateToCanonical?: (chunkId: number) => Promise<void>;
	initialSearchId?: string;
	onSearchIdCleared?: () => void;
}

export function ChunksPanel({  initialSearchId, onSearchIdCleared }: ChunksPanelProps = {}) {
	const queryClient = useQueryClient();
	const [searchInput, setSearchInput] = useState('');
	const [search, setSearch] = useState('');
	const [collection, setCollection] = useState<AICollection | 'all'>('all');
	const [limit, setLimit] = useState(20);
	const [offset, setOffset] = useState(0);
	const [selectedItem, setSelectedItem] = useState<AIChunk | null>(null);
	const [selectedCell, setSelectedCell] = useState<ChunkCellType | null>(null);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
	const [chunkToDelete, setChunkToDelete] = useState<AIChunk | null>(null);
	const [canonicalDialogOpen, setCanonicalDialogOpen] = useState(false);
	const [relatedCanonical, setRelatedCanonical] = useState<AICanonicalEntry | null>(null);
	const [isLoadingCanonical, setIsLoadingCanonical] = useState(false);

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
		AdminAIPaginatedResponse<AIChunk>,
		Error
	>({
		queryKey: ['admin-ai-chunks', search, collection, limit, offset],
		queryFn: () =>
			getAIChunks({
				search: search || undefined,
				collection: collection === 'all' ? undefined : collection,
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
		setCollection('all');
		setOffset(0);
		void refetch();
	};

	const handleCellClick = (item: AIChunk, cellType: ChunkCellType) => {
		setSelectedItem(item);
		setSelectedCell(cellType);
		setDialogOpen(true);
	};

	const deleteMutation = useMutation({
		mutationFn: (chunkId: number) => deleteChunk(chunkId),
		onSuccess: () => {
			toast.success('Đã xóa chunk thành công');
			void queryClient.invalidateQueries({ queryKey: ['admin-ai-chunks'] });
			setChunkToDelete(null);
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Không thể xóa chunk');
		},
	});

	const handleDeleteClick = (item: AIChunk, e: React.MouseEvent) => {
		e.stopPropagation();
		setChunkToDelete(item);
		setDeleteConfirmOpen(true);
	};

	const handleConfirmDelete = () => {
		if (chunkToDelete) {
			deleteMutation.mutate(chunkToDelete.id);
		}
	};

	const handleViewCanonical = async (item: AIChunk, e: React.MouseEvent) => {
		e.stopPropagation();
		setIsLoadingCanonical(true);
		setRelatedCanonical(null);
		try {
			const response = await getChunkCanonicalId(item.id);
			if (response.sqlQAId) {
				// Fetch canonical details
				const canonicalResponse = await getCanonicalEntries({ search: response.sqlQAId.toString(), limit: 1 });
				if (canonicalResponse.items.length > 0) {
					setRelatedCanonical(canonicalResponse.items[0]);
					setCanonicalDialogOpen(true);
				} else {
					toast.error('Không tìm thấy canonical entry với ID này');
				}
			} else {
				toast.error('Chunk này chưa có canonical entry liên kết');
			}
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Không thể tải canonical entry liên quan';
			toast.error(message);
		} finally {
			setIsLoadingCanonical(false);
		}
	};


	return (
		<div className="flex flex-col gap-2">
			<ChunksPanelHeader
				limit={limit}
				onLimitChange={(newLimit) => {
					setLimit(newLimit);
					setOffset(0);
				}}
				onRefresh={() => void refetch()}
			/>

			<ChunksPanelSearch
				searchInput={searchInput}
				onSearchInputChange={setSearchInput}
				collection={collection}
				onCollectionChange={(newCollection) => {
					setCollection(newCollection);
					setOffset(0);
				}}
				onSearch={handleSearch}
				onReset={handleReset}
			/>

			<ChunksPanelTable
				data={data?.items}
				isLoading={isLoading}
				isError={isError}
				errorMessage={error?.message}
				empty={isEmpty}
				onCellClick={handleCellClick}
				onViewCanonical={handleViewCanonical}
				onDelete={handleDeleteClick}
				isLoadingCanonical={isLoadingCanonical}
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

			<ChunksPanelDialogs
				cellDialogOpen={dialogOpen}
				onCellDialogOpenChange={setDialogOpen}
				selectedItem={selectedItem}
				selectedCell={selectedCell}
				deleteConfirmOpen={deleteConfirmOpen}
				onDeleteConfirmOpenChange={setDeleteConfirmOpen}
				chunkToDelete={chunkToDelete}
				onConfirmDelete={handleConfirmDelete}
				canonicalDialogOpen={canonicalDialogOpen}
				onCanonicalDialogOpenChange={setCanonicalDialogOpen}
				relatedCanonical={relatedCanonical}
			/>
		</div>
	);
}
