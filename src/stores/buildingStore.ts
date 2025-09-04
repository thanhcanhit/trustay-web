import { create } from 'zustand';
import { getBuildings } from '@/actions/building.action';
import { getRoomsByBuilding } from '@/actions/room.action';
import { Building, Room } from '@/types/types';

export interface DashboardData {
	buildings: Building[];
	buildingRooms: Map<string, Room[]>;
	stats: {
		totalRooms: number;
		occupiedRooms: number;
		totalRevenue: number;
		occupancyRate: number;
	};
}

interface BuildingState {
	buildings: Building[];
	buildingRooms: Map<string, Room[]>;
	dashboardData: DashboardData | null;
	isLoading: boolean;
	error: string | null;

	// Actions
	fetchDashboardData: () => Promise<void>;
	clearError: () => void;
	reset: () => void;
}

const calculateStats = (buildings: Building[], buildingRooms: Map<string, Room[]>) => {
	let totalRooms = 0;
	let occupiedRooms = 0;
	let totalRevenue = 0;

	for (const building of buildings) {
		const rooms = buildingRooms.get(building.id) || [];

		for (const room of rooms) {
			if (room.roomInstances && Array.isArray(room.roomInstances)) {
				totalRooms += room.roomInstances.length;

				const occupiedInstances = room.roomInstances.filter(
					(instance) => instance.status === 'occupied',
				);
				occupiedRooms += occupiedInstances.length;

				if (room.pricing && occupiedInstances.length > 0) {
					const monthlyRevenue = room.pricing.basePriceMonthly || 0;
					totalRevenue += monthlyRevenue * occupiedInstances.length;
				}
			}
		}
	}

	const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

	return {
		totalRooms,
		occupiedRooms,
		totalRevenue,
		occupancyRate,
	};
};

export const useBuildingStore = create<BuildingState>((set) => ({
	buildings: [],
	buildingRooms: new Map(),
	dashboardData: null,
	isLoading: false,
	error: null,

	fetchDashboardData: async () => {
		set({ isLoading: true, error: null });

		try {
			const buildingsResult = await getBuildings({ limit: 100 });
			if (!buildingsResult.success) {
				throw new Error(buildingsResult.error || 'Failed to fetch buildings');
			}

			const buildings = buildingsResult.data.buildings;
			const buildingRooms = new Map<string, Room[]>();

			for (const building of buildings) {
				const roomsResult = await getRoomsByBuilding(building.id, { limit: 100 });
				if (roomsResult.success) {
					buildingRooms.set(building.id, roomsResult.data.rooms);
				} else {
					buildingRooms.set(building.id, []);
				}
			}

			const stats = calculateStats(buildings, buildingRooms);

			const dashboardData: DashboardData = {
				buildings,
				buildingRooms,
				stats,
			};

			set({
				buildings,
				buildingRooms,
				dashboardData,
				isLoading: false,
				error: null,
			});
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : 'Failed to fetch dashboard data';

			set({
				buildings: [],
				buildingRooms: new Map(),
				dashboardData: {
					buildings: [],
					buildingRooms: new Map(),
					stats: { totalRooms: 0, occupiedRooms: 0, totalRevenue: 0, occupancyRate: 0 },
				},
				isLoading: false,
				error: errorMessage,
			});
		}
	},

	clearError: () => set({ error: null }),

	reset: () =>
		set({
			buildings: [],
			buildingRooms: new Map(),
			dashboardData: null,
			isLoading: false,
			error: null,
		}),
}));
