import { create } from 'zustand';
import { getBuildings } from '@/actions/building.action';
import {
	getFeaturedRoomListings,
	getRoomById as getRoomByIdListing,
	searchRoomListings,
} from '@/actions/listings.action';
import {
	bulkUpdateRoomInstancesStatus,
	createRoom,
	deleteRoom,
	getMyRooms,
	getRoomById,
	getRoomInstancesByStatus,
	updateRoom,
	updateRoomInstanceStatus,
} from '@/actions/room.action';
import { TokenManager } from '@/lib/api-client';
import type {
	Building,
	BulkUpdateRoomInstancesRequest,
	CreateRoomRequest,
	Room,
	RoomDetail,
	RoomInstance,
	RoomListing,
	RoomSearchParams,
	UpdateRoomInstanceStatusRequest,
	UpdateRoomRequest,
} from '@/types/types';

interface RoomState {
	// Featured rooms for homepage
	featuredRooms: RoomListing[];
	featuredLoading: boolean;
	featuredError: string | null;

	// Search results
	searchResults: RoomListing[];
	searchLoading: boolean;
	searchError: string | null;
	searchPagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
		hasNext: boolean;
		hasPrev: boolean;
		itemCount: number;
	} | null;
	lastSearchParams?: string; // Track last search parameters to prevent duplicates

	// Room detail
	currentRoom: RoomDetail | null;
	roomLoading: boolean;
	roomError: string | null;

	// Saved rooms
	savedRooms: string[];

	// Landlord rooms management
	myRooms: Room[];
	myRoomsLoading: boolean;
	myRoomsError: string | null;
	myRoomsPagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	} | null;

	// Actions
	loadFeaturedRooms: (limit?: number) => Promise<void>;
	searchRooms: (params: RoomSearchParams, append?: boolean) => Promise<void>;
	loadRoomDetail: (slug: string) => Promise<void>;
	toggleSaveRoom: (roomId: string) => void;
	clearSearchResults: () => void;
	clearRoomDetail: () => void;
	clearErrors: () => void;

	// Landlord actions
	fetchMyRooms: (params?: { page?: number; limit?: number }) => Promise<void>;
	deleteMyRoom: (roomId: string) => Promise<boolean>;
	clearMyRooms: () => void;

	// Room CRUD operations
	loadRoomById: (roomId: string) => Promise<Room | null>;
	createNewRoom: (buildingId: string, data: CreateRoomRequest) => Promise<Room | null>;
	updateExistingRoom: (roomId: string, data: UpdateRoomRequest) => Promise<Room | null>;

	// Room instance management
	loadRoomInstances: (
		roomId: string,
		status?: string,
	) => Promise<{
		instances: RoomInstance[];
		statusCounts: {
			available: number;
			occupied: number;
			maintenance: number;
			reserved: number;
			unavailable: number;
		};
	} | null>;
	updateRoomInstance: (
		instanceId: string,
		data: UpdateRoomInstanceStatusRequest,
	) => Promise<boolean>;
	bulkUpdateRoomInstances: (
		roomId: string,
		data: BulkUpdateRoomInstancesRequest,
	) => Promise<boolean>;

	// Building operations
	loadBuildings: (params?: { limit?: number }) => Promise<Building[]>;
}

export const useRoomStore = create<RoomState>((set, get) => ({
	// Initial state
	featuredRooms: [],
	featuredLoading: false,
	featuredError: null,

	searchResults: [],
	searchLoading: false,
	searchError: null,
	searchPagination: null,

	currentRoom: null,
	roomLoading: false,
	roomError: null,

	savedRooms: [],

	// Landlord initial state
	myRooms: [],
	myRoomsLoading: false,
	myRoomsError: null,
	myRoomsPagination: null,

	// Load featured rooms for homepage
	loadFeaturedRooms: async (limit = 4) => {
		set({ featuredLoading: true, featuredError: null });

		try {
			const rooms = await getFeaturedRoomListings(limit);
			set({
				featuredRooms: rooms,
				featuredLoading: false,
				featuredError: null,
			});
		} catch (error: unknown) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to load featured rooms';
			set({
				featuredLoading: false,
				featuredError: errorMessage,
			});
			console.error('Failed to load featured rooms:', error);
		}
	},

	// Search rooms with filters
	searchRooms: async (params: RoomSearchParams, append = false) => {
		const currentState = get();
		console.log('Store searchRooms called with:', params, 'append:', append);

		// Prevent duplicate API calls for the same parameters
		const paramsKey = JSON.stringify(params);
		if (currentState.lastSearchParams === paramsKey && !append) {
			console.log('Skipping duplicate search request for:', paramsKey);
			return;
		}

		if (!append) {
			set({ searchLoading: true, searchError: null });
		}

		try {
			const response = await searchRoomListings(params);
			console.log('API response:', {
				dataLength: response.data.length,
				meta: response.meta,
				currentResultsLength: currentState.searchResults.length,
			});

			set({
				searchResults: append ? [...currentState.searchResults, ...response.data] : response.data,
				searchPagination: response.meta,
				searchLoading: false,
				searchError: null,
				lastSearchParams: paramsKey,
			});
		} catch (error: unknown) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to search rooms';
			set({
				searchLoading: false,
				searchError: errorMessage,
			});
			console.error('Failed to search rooms:', error);
		}
	},

	// Load room detail by id
	loadRoomDetail: async (id: string) => {
		set({ roomLoading: true, roomError: null });

		try {
			const room = await getRoomByIdListing(id);
			set({
				currentRoom: room,
				roomLoading: false,
				roomError: null,
			});
		} catch (error: unknown) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to load room detail';
			set({
				roomLoading: false,
				roomError: errorMessage,
			});
			console.error('Failed to load room detail:', error);
		}
	},

	// Toggle save room
	toggleSaveRoom: (roomId: string) => {
		const { savedRooms } = get();
		const newSavedRooms = savedRooms.includes(roomId)
			? savedRooms.filter((id) => id !== roomId)
			: [...savedRooms, roomId];

		set({ savedRooms: newSavedRooms });
	},

	// Clear search results
	clearSearchResults: () => {
		set({
			searchResults: [],
			searchPagination: null,
			searchError: null,
		});
	},

	// Clear room detail
	clearRoomDetail: () => {
		set({
			currentRoom: null,
			roomError: null,
		});
	},

	// Clear all errors
	clearErrors: () => {
		set({
			featuredError: null,
			searchError: null,
			roomError: null,
			myRoomsError: null,
		});
	},

	// Fetch landlord's rooms
	fetchMyRooms: async (params = {}) => {
		set({ myRoomsLoading: true, myRoomsError: null });

		try {
			const token = TokenManager.getAccessToken();
			const response = await getMyRooms(params, token);

			if (!response.success) {
				throw new Error(response.error || 'Failed to fetch rooms');
			}

			set({
				myRooms: response.data.rooms || [],
				myRoomsPagination: {
					page: response.data.page || 1,
					limit: response.data.limit || 12,
					total: response.data.total || 0,
					totalPages: response.data.totalPages || 1,
				},
				myRoomsLoading: false,
				myRoomsError: null,
			});
		} catch (error: unknown) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to fetch rooms';
			set({
				myRoomsLoading: false,
				myRoomsError: errorMessage,
			});
			console.error('Failed to fetch my rooms:', error);
		}
	},

	// Delete landlord's room
	deleteMyRoom: async (roomId: string): Promise<boolean> => {
		try {
			const token = TokenManager.getAccessToken();
			const response = await deleteRoom(roomId, token);

			if (!response.success) {
				throw new Error(response.error || 'Failed to delete room');
			}

			// Remove room from state
			const { myRooms } = get();
			set({
				myRooms: myRooms.filter((room) => room.id !== roomId),
			});

			return true;
		} catch (error: unknown) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to delete room';
			set({ myRoomsError: errorMessage });
			console.error('Failed to delete room:', error);
			return false;
		}
	},

	// Clear landlord rooms
	clearMyRooms: () => {
		set({
			myRooms: [],
			myRoomsPagination: null,
			myRoomsError: null,
		});
	},

	// Load room by ID
	loadRoomById: async (roomId: string): Promise<Room | null> => {
		try {
			const token = TokenManager.getAccessToken();
			const response = await getRoomById(roomId, token);

			if (!response.success) {
				console.error('Failed to load room:', response.error);
				return null;
			}

			return response.data.data;
		} catch (error: unknown) {
			console.error('Failed to load room:', error);
			return null;
		}
	},

	// Create new room
	createNewRoom: async (buildingId: string, data: CreateRoomRequest): Promise<Room | null> => {
		try {
			const token = TokenManager.getAccessToken();
			const response = await createRoom(buildingId, data, token);

			if (!response.success) {
				console.error('Failed to create room:', response.error);
				return null;
			}

			return response.data.data;
		} catch (error: unknown) {
			console.error('Failed to create room:', error);
			return null;
		}
	},

	// Update existing room
	updateExistingRoom: async (roomId: string, data: UpdateRoomRequest): Promise<Room | null> => {
		try {
			const token = TokenManager.getAccessToken();
			const response = await updateRoom(roomId, data, token);

			if (!response.success) {
				console.error('Failed to update room:', response.error);
				return null;
			}

			return response.data.data;
		} catch (error: unknown) {
			console.error('Failed to update room:', error);
			return null;
		}
	},

	// Load room instances by status
	loadRoomInstances: async (
		roomId: string,
		status = 'all',
	): Promise<{
		instances: RoomInstance[];
		statusCounts: {
			available: number;
			occupied: number;
			maintenance: number;
			reserved: number;
			unavailable: number;
		};
	} | null> => {
		try {
			const token = TokenManager.getAccessToken();
			const response = await getRoomInstancesByStatus(roomId, status, token);

			if (!response.success) {
				console.error('Failed to load room instances:', response.error);
				return null;
			}

			return response.data.data;
		} catch (error: unknown) {
			console.error('Failed to load room instances:', error);
			return null;
		}
	},

	// Update room instance status
	updateRoomInstance: async (
		instanceId: string,
		data: UpdateRoomInstanceStatusRequest,
	): Promise<boolean> => {
		try {
			const token = TokenManager.getAccessToken();
			const response = await updateRoomInstanceStatus(instanceId, data, token);

			return response.success;
		} catch (error: unknown) {
			console.error('Failed to update room instance:', error);
			return false;
		}
	},

	// Bulk update room instances
	bulkUpdateRoomInstances: async (
		roomId: string,
		data: BulkUpdateRoomInstancesRequest,
	): Promise<boolean> => {
		try {
			const token = TokenManager.getAccessToken();
			const response = await bulkUpdateRoomInstancesStatus(roomId, data, token);

			return response.success;
		} catch (error: unknown) {
			console.error('Failed to bulk update room instances:', error);
			return false;
		}
	},

	// Load buildings
	loadBuildings: async (params = {}): Promise<Building[]> => {
		try {
			const token = TokenManager.getAccessToken();
			const response = await getBuildings(params, token);

			if (!response.success) {
				console.error('Failed to load buildings:', response.error);
				return [];
			}

			return response.data.buildings || [];
		} catch (error: unknown) {
			console.error('Failed to load buildings:', error);
			return [];
		}
	},
}));
