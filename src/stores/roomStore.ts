import { create } from 'zustand';
import {
	getFeaturedRoomListings,
	getRoomBySlug,
	searchRoomListings,
} from '@/actions/listings.action';
import type { RoomDetail, RoomListing, RoomSearchParams } from '@/types/types';

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

	// Room detail
	currentRoom: RoomDetail | null;
	roomLoading: boolean;
	roomError: string | null;

	// Saved rooms
	savedRooms: string[];

	// Actions
	loadFeaturedRooms: (limit?: number) => Promise<void>;
	searchRooms: (params: RoomSearchParams, append?: boolean) => Promise<void>;
	loadRoomDetail: (slug: string) => Promise<void>;
	toggleSaveRoom: (roomId: string) => void;
	clearSearchResults: () => void;
	clearRoomDetail: () => void;
	clearErrors: () => void;
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

	// Load room detail by slug
	loadRoomDetail: async (slug: string) => {
		set({ roomLoading: true, roomError: null });

		try {
			const room = await getRoomBySlug(slug);
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
		});
	},
}));
