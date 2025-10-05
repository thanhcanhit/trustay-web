import { create } from 'zustand';
import {
	createBuilding as createBuildingAction,
	deleteBuilding as deleteBuildingAction,
	getBuildingById,
	getBuildings,
	updateBuilding as updateBuildingAction,
} from '@/actions/building.action';
import { getRoomsByBuilding } from '@/actions/room.action';
import { TokenManager } from '@/lib/api-client';
import { Building, CreateBuildingRequest, Room, UpdateBuildingRequest } from '@/types/types';

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
	currentBuilding: Building | null;
	isLoading: boolean;
	error: string | null;
	hasFetched: boolean; // Flag to prevent infinite loops

	// Actions
	fetchDashboardData: () => Promise<void>;
	fetchAllBuildings: () => Promise<void>; // Fetch all buildings for properties page
	deleteBuilding: (id: string) => Promise<boolean>; // Delete building and refresh
	clearError: () => void;
	reset: () => void;
	forceRefresh: () => Promise<void>; // Force refresh data

	// Building CRUD operations
	loadBuildingById: (id: string) => Promise<Building | null>;
	createBuilding: (data: CreateBuildingRequest) => Promise<Building | null>;
	updateBuilding: (id: string, data: UpdateBuildingRequest) => Promise<Building | null>;
	createNewBuilding: (data: CreateBuildingRequest) => Promise<Building | null>;
	updateExistingBuilding: (id: string, data: UpdateBuildingRequest) => Promise<Building | null>;
	loadRoomsByBuilding: (buildingId: string, params?: { limit?: number }) => Promise<Room[]>;
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
	currentBuilding: null,
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
			// Get token from localStorage
			const token = TokenManager.getAccessToken();

			// Only fetch 3 most recent/featured buildings for dashboard overview
			const buildingsResult = await getBuildings({ limit: 3 }, token);
			if (!buildingsResult.success) {
				throw new Error(buildingsResult.error || 'Failed to fetch buildings');
			}

			const buildings = buildingsResult.data.buildings || [];
			const buildingRooms = new Map<string, Room[]>();

			// Only fetch rooms if there are buildings
			if (buildings.length > 0) {
				for (const building of buildings) {
					const roomsResult = await getRoomsByBuilding(building.id, { limit: 50 }, token);
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
			// Get token from localStorage
			const token = TokenManager.getAccessToken();

			// Fetch all buildings for properties management page
			const buildingsResult = await getBuildings({ limit: 100 }, token);
			if (!buildingsResult.success) {
				throw new Error(buildingsResult.error || 'Failed to fetch buildings');
			}

			const buildings = buildingsResult.data.buildings || [];
			const buildingRooms = new Map<string, Room[]>();

			// Only fetch rooms if there are buildings
			if (buildings.length > 0) {
				for (const building of buildings) {
					const roomsResult = await getRoomsByBuilding(building.id, { limit: 50 }, token);
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

	deleteBuilding: async (id: string) => {
		const token = TokenManager.getAccessToken();

		try {
			const result = await deleteBuildingAction(id, token);
			if (result.success) {
				// Remove building from current state
				const currentState = get();
				const updatedBuildings = currentState.buildings.filter((b) => b.id !== id);
				const updatedBuildingRooms = new Map(currentState.buildingRooms);
				updatedBuildingRooms.delete(id);

				const stats = calculateStats(updatedBuildings, updatedBuildingRooms);

				const dashboardData: DashboardData = {
					buildings: updatedBuildings,
					buildingRooms: updatedBuildingRooms,
					stats,
				};

				set({
					buildings: updatedBuildings,
					buildingRooms: updatedBuildingRooms,
					dashboardData,
				});

				return true;
			} else {
				set({ error: result.error });
				return false;
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to delete building';
			set({ error: errorMessage });
			return false;
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
			currentBuilding: null,
			isLoading: false,
			error: null,
			hasFetched: false,
		}),

	// Load building by ID
	loadBuildingById: async (id: string): Promise<Building | null> => {
		try {
			const token = TokenManager.getAccessToken();
			const response = await getBuildingById(id, token);

			if (!response.success) {
				console.error('Failed to load building:', response.error);
				return null;
			}

			const building = response.data.data;
			set({ currentBuilding: building });
			return building;
		} catch (error: unknown) {
			console.error('Failed to load building:', error);
			return null;
		}
	},

	// Create new building (alias for backward compatibility)
	createBuilding: async (data: CreateBuildingRequest): Promise<Building | null> => {
		try {
			const token = TokenManager.getAccessToken();
			const response = await createBuildingAction(data, token);

			if (!response.success) {
				console.error('Failed to create building:', response.error);
				return null;
			}

			// Add to current buildings list
			const currentState = get();
			const updatedBuildings = [response.data.data, ...currentState.buildings];
			set({ buildings: updatedBuildings });

			return response.data.data;
		} catch (error: unknown) {
			console.error('Failed to create building:', error);
			return null;
		}
	},

	// Update building (alias for backward compatibility)
	updateBuilding: async (id: string, data: UpdateBuildingRequest): Promise<Building | null> => {
		try {
			const token = TokenManager.getAccessToken();
			const response = await updateBuildingAction(id, data, token);

			if (!response.success) {
				console.error('Failed to update building:', response.error);
				return null;
			}

			// Update in current buildings list
			const currentState = get();
			const updatedBuildings = currentState.buildings.map((b) =>
				b.id === id ? response.data.data : b,
			);
			set({ buildings: updatedBuildings });

			return response.data.data;
		} catch (error: unknown) {
			console.error('Failed to update building:', error);
			return null;
		}
	},

	// Create new building
	createNewBuilding: async (data: CreateBuildingRequest): Promise<Building | null> => {
		return get().createBuilding(data);
	},

	// Update existing building
	updateExistingBuilding: async (
		id: string,
		data: UpdateBuildingRequest,
	): Promise<Building | null> => {
		return get().updateBuilding(id, data);
	},

	// Load rooms by building
	loadRoomsByBuilding: async (buildingId: string, params = {}): Promise<Room[]> => {
		try {
			const token = TokenManager.getAccessToken();
			const response = await getRoomsByBuilding(buildingId, params, token);

			if (!response.success) {
				console.error('Failed to load rooms:', response.error);
				return [];
			}

			return response.data.rooms || [];
		} catch (error: unknown) {
			console.error('Failed to load rooms:', error);
			return [];
		}
	},
}));
