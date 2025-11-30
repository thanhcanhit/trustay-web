'use client';

import { useState, useEffect } from 'react';
import { useRoomStore } from '@/stores/roomStore';
import { useBuildingStore } from '@/stores/buildingStore';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Building2, Users, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { RoomInstanceSearchResult, RoomStatus } from '@/types/types';

interface RoomInstanceSearchDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSelect: (instance: RoomInstanceSearchResult) => void;
	title?: string;
	description?: string;
	defaultBuildingId?: string;
	filterStatus?: RoomStatus;
}

const statusColors = {
	available: 'bg-green-100 text-green-700 border-green-300',
	occupied: 'bg-blue-100 text-blue-700 border-blue-300',
	maintenance: 'bg-yellow-100 text-yellow-700 border-yellow-300',
	reserved: 'bg-purple-100 text-purple-700 border-purple-300',
	unavailable: 'bg-gray-100 text-gray-700 border-gray-300',
};

const statusLabels = {
	available: 'Trống',
	occupied: 'Đang thuê',
	maintenance: 'Bảo trì',
	reserved: 'Đã đặt',
	unavailable: 'Không khả dụng',
};

export function RoomInstanceSearchDialog({
	open,
	onOpenChange,
	onSelect,
	title = 'Tìm kiếm phòng',
	description = 'Tìm kiếm phòng theo tenant, địa chỉ, ghi chú hoặc trạng thái',
	defaultBuildingId,
	filterStatus,
}: RoomInstanceSearchDialogProps) {
	const {
		searchInstances,
		instanceSearchResults,
		instanceSearchLoading,
		clearInstanceSearch,
	} = useRoomStore();
	const { buildings, fetchAllBuildings } = useBuildingStore();

	const [searchTerm, setSearchTerm] = useState('');
	const [buildingId, setBuildingId] = useState(defaultBuildingId || 'all');
	const [statusFilter, setStatusFilter] = useState<RoomStatus | 'all'>(
		filterStatus || 'all',
	);

	// Load buildings on mount
	useEffect(() => {
		if (open) {
			fetchAllBuildings();
		}
	}, [open, fetchAllBuildings]);

	// Auto search on open if default building is provided
	useEffect(() => {
		if (open && defaultBuildingId) {
			handleSearch();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open, defaultBuildingId]);

	// Clear search when dialog closes
	useEffect(() => {
		if (!open) {
			clearInstanceSearch();
			setSearchTerm('');
		}
	}, [open, clearInstanceSearch]);

	const handleSearch = async () => {
		const params: {
			buildingId?: string;
			search?: string;
			status?: RoomStatus;
		} = {};

		if (buildingId !== 'all') {
			params.buildingId = buildingId;
		}
		if (searchTerm.trim()) {
			params.search = searchTerm.trim();
		}
		if (statusFilter !== 'all') {
			params.status = statusFilter;
		}

		// Ensure at least one parameter is provided
		if (!params.buildingId && !params.search && !params.status) {
			return;
		}

		await searchInstances(params);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			handleSearch();
		}
	};

	const handleSelectInstance = (instance: RoomInstanceSearchResult) => {
		onSelect(instance);
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					{/* Filters */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="space-y-2">
							<Label htmlFor="building">Toà nhà</Label>
							<Select value={buildingId} onValueChange={setBuildingId}>
								<SelectTrigger id="building">
									<SelectValue placeholder="Tất cả toà nhà" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">Tất cả toà nhà</SelectItem>
									{buildings.map((building) => (
										<SelectItem key={building.id} value={building.id}>
											{building.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="status">Trạng thái</Label>
							<Select
								value={statusFilter}
								onValueChange={(value) =>
									setStatusFilter(value as RoomStatus | 'all')
								}
							>
								<SelectTrigger id="status">
									<SelectValue placeholder="Tất cả trạng thái" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">Tất cả</SelectItem>
									<SelectItem value="occupied">Đang thuê</SelectItem>
									<SelectItem value="available">Trống</SelectItem>
									<SelectItem value="maintenance">Bảo trì</SelectItem>
									<SelectItem value="reserved">Đã đặt</SelectItem>
									<SelectItem value="unavailable">Không khả dụng</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="search">Tìm kiếm</Label>
							<div className="relative">
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<Input
									id="search"
									placeholder="Tên, email, SĐT tenant..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									onKeyDown={handleKeyDown}
									className="pl-9"
								/>
							</div>
						</div>
					</div>

					<Button onClick={handleSearch} disabled={instanceSearchLoading} className="w-full">
						{instanceSearchLoading ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Đang tìm kiếm...
							</>
						) : (
							<>
								<Search className="mr-2 h-4 w-4" />
								Tìm kiếm
							</>
						)}
					</Button>

					{/* Results */}
					<div className="space-y-2">
						{instanceSearchLoading ? (
							<div className="flex items-center justify-center py-8">
								<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
							</div>
						) : instanceSearchResults.length > 0 ? (
							<>
								<div className="text-sm text-muted-foreground mb-2">
									Tìm thấy {instanceSearchResults.length} phòng
								</div>
								<div className="space-y-2 max-h-[400px] overflow-y-auto">
									{instanceSearchResults.map((instance) => (
										<Card
											key={instance.id}
											className="cursor-pointer hover:bg-accent transition-colors"
											onClick={() => handleSelectInstance(instance)}
										>
											<CardContent className="p-4">
												<div className="flex items-start justify-between gap-4">
													<div className="flex-1 space-y-1">
														<div className="flex items-center gap-2">
															<h4 className="font-semibold">
																Phòng {instance.roomNumber}
															</h4>
															{instance.status && (
																<Badge
																	variant="outline"
																	className={
																		statusColors[instance.status] ||
																		statusColors.unavailable
																	}
																>
																	{statusLabels[instance.status] ||
																		instance.status}
																</Badge>
															)}
														</div>
														<div className="flex items-center gap-2 text-sm text-muted-foreground">
															<Building2 className="h-3 w-3" />
															<span>{instance.buildingName}</span>
														</div>
														<div className="flex items-center gap-2 text-sm text-muted-foreground">
															<Users className="h-3 w-3" />
															<span>{instance.roomName}</span>
														</div>
														{instance.notes && (
															<div className="text-sm text-muted-foreground">
																<span className="font-medium">Ghi chú:</span>{' '}
																{instance.notes}
															</div>
														)}
													</div>
													{instance.floorNumber !== undefined && (
														<div className="text-sm text-muted-foreground">
															Tầng {instance.floorNumber}
														</div>
													)}
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							</>
						) : searchTerm || buildingId !== 'all' || statusFilter !== 'all' ? (
							<div className="text-center py-8 text-muted-foreground">
								Không tìm thấy phòng nào
							</div>
						) : (
							<div className="text-center py-8 text-muted-foreground">
								Nhập từ khóa hoặc chọn bộ lọc để tìm kiếm
							</div>
						)}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
