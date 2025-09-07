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
	hasFetched: boolean; // Flag to prevent infinite loops

	// Actions
	fetchDashboardData: () => Promise<void>;
	fetchAllBuildings: () => Promise<void>; // Fetch all buildings for properties page
	clearError: () => void;
	reset: () => void;
	forceRefresh: () => Promise<void>; // Force refresh data
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
					const monthlyRevenue = parseFloat(room.pricing.basePriceMonthly) || 0;
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

export const useBuildingStore = create<BuildingState>((set, get) => ({
	buildings: [],
	buildingRooms: new Map(),
	dashboardData: null,
	isLoading: false,
	error: null,
	hasFetched: false,

	fetchDashboardData: async () => {
		const currentState = get();

		// Prevent multiple simultaneous fetches
		if (currentState.isLoading) {
			return;
		}

		set({ isLoading: true, error: null });

		try {
			// Only fetch 3 most recent/featured buildings for dashboard overview
			const buildingsResult = await getBuildings({ limit: 3 });
			if (!buildingsResult.success) {
				throw new Error(buildingsResult.error || 'Failed to fetch buildings');
			}

			const buildings = buildingsResult.data.buildings || [];
			const buildingRooms = new Map<string, Room[]>();

			// Only fetch rooms if there are buildings
			if (buildings.length > 0) {
				for (const building of buildings) {
					const roomsResult = await getRoomsByBuilding(building.id, { limit: 50 });
					if (roomsResult.success) {
						buildingRooms.set(building.id, roomsResult.data.rooms || []);
					} else {
						buildingRooms.set(building.id, []);
					}
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
				hasFetched: true,
			});
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : 'Failed to fetch dashboard data';

			set({
				buildings: [],
				buildingRooms: new Map(),
				dashboardData: null, // Set to null instead of empty data to properly handle empty state
				isLoading: false,
				error: errorMessage,
				hasFetched: true, // Mark as fetched even on error to prevent infinite retries
			});
		}
	},

	fetchAllBuildings: async () => {
		const currentState = get();

		// Prevent multiple simultaneous fetches
		if (currentState.isLoading) {
			return;
		}

		set({ isLoading: true, error: null });

		try {
			// Fetch all buildings for properties management page
			const buildingsResult = await getBuildings({ limit: 100 });
			if (!buildingsResult.success) {
				throw new Error(buildingsResult.error || 'Failed to fetch buildings');
			}

			const buildings = buildingsResult.data.buildings || [];
			const buildingRooms = new Map<string, Room[]>();

			// Only fetch rooms if there are buildings
			if (buildings.length > 0) {
				for (const building of buildings) {
					const roomsResult = await getRoomsByBuilding(building.id, { limit: 50 });
					if (roomsResult.success) {
						buildingRooms.set(building.id, roomsResult.data.rooms || []);
					} else {
						buildingRooms.set(building.id, []);
					}
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
				hasFetched: true,
			});
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : 'Failed to fetch dashboard data';

			set({
				buildings: [],
				buildingRooms: new Map(),
				dashboardData: null,
				isLoading: false,
				error: errorMessage,
				hasFetched: true,
			});
		}
	},

	clearError: () => set({ error: null }),

	forceRefresh: async () => {
		set({ hasFetched: false });
		await get().fetchDashboardData();
	},

	reset: () =>
		set({
			buildings: [],
			buildingRooms: new Map(),
			dashboardData: null,
			isLoading: false,
			error: null,
			hasFetched: false,
		}),
}));
