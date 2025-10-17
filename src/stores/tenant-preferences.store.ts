import { create } from 'zustand';
import {
	CreateRoommatePreferencesRequest,
	CreateRoomPreferencesRequest,
	createOrUpdateRoommatePreferences,
	createOrUpdateRoomPreferences,
	deleteRoommatePreferences,
	deleteRoomPreferences,
	getAllPreferences,
	getRoommatePreferences,
	getRoomPreferences,
	RoommatePreferences,
	RoomPreferences,
	UpdateRoommatePreferencesRequest,
	UpdateRoomPreferencesRequest,
	updateRoommatePreferences,
	updateRoomPreferences,
} from '../actions/tenant-preferences.action';
import { TokenManager } from '../lib/api-client';

interface TenantPreferencesState {
	// State
	roomPreferences: RoomPreferences | null;
	roommatePreferences: RoommatePreferences | null;
	isLoading: boolean;
	error: string | null;

	// Actions
	setLoading: (loading: boolean) => void;
	setError: (error: string | null) => void;

	// Room Preferences API Actions
	fetchRoomPreferences: () => Promise<void>;
	saveRoomPreferences: (data: CreateRoomPreferencesRequest) => Promise<boolean>;
	updateRoomPrefs: (data: UpdateRoomPreferencesRequest) => Promise<boolean>;
	removeRoomPreferences: () => Promise<boolean>;

	// Roommate Preferences API Actions
	fetchRoommatePreferences: () => Promise<void>;
	saveRoommatePreferences: (data: CreateRoommatePreferencesRequest) => Promise<boolean>;
	updateRoommatePrefs: (data: UpdateRoommatePreferencesRequest) => Promise<boolean>;
	removeRoommatePreferences: () => Promise<boolean>;

	// Combined Actions
	fetchAllPreferences: () => Promise<void>;

	// Helpers
	hasRoomPreferences: () => boolean;
	hasRoommatePreferences: () => boolean;
	clearError: () => void;
	reset: () => void;
}

export const useTenantPreferencesStore = create<TenantPreferencesState>((set, get) => ({
	// Initial state
	roomPreferences: null,
	roommatePreferences: null,
	isLoading: false,
	error: null,

	// Simple setters
	setLoading: (loading) => set({ isLoading: loading }),
	setError: (error) => set({ error }),

	// Fetch room preferences
	fetchRoomPreferences: async () => {
		set({ isLoading: true, error: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await getRoomPreferences(token);

			if (result.success) {
				set({ roomPreferences: result.data, isLoading: false });
			} else {
				// If no preferences found (404), set to null without showing error
				if (result.status === 404) {
					set({ roomPreferences: null, isLoading: false });
				} else {
					set({ error: result.error, isLoading: false });
				}
			}
		} catch (error) {
			console.error('Failed to fetch room preferences:', error);
			set({ error: 'Không thể tải sở thích về phòng', isLoading: false });
		}
	},

	// Save room preferences (create or update)
	saveRoomPreferences: async (data) => {
		set({ isLoading: true, error: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await createOrUpdateRoomPreferences(data, token);

			if (result.success) {
				set({ roomPreferences: result.data, isLoading: false });
				return true;
			} else {
				set({ error: result.error, isLoading: false });
				return false;
			}
		} catch (error) {
			console.error('Failed to save room preferences:', error);
			set({ error: 'Không thể lưu sở thích về phòng', isLoading: false });
			return false;
		}
	},

	// Update room preferences
	updateRoomPrefs: async (data) => {
		set({ isLoading: true, error: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await updateRoomPreferences(data, token);

			if (result.success) {
				set({ roomPreferences: result.data, isLoading: false });
				return true;
			} else {
				set({ error: result.error, isLoading: false });
				return false;
			}
		} catch (error) {
			console.error('Failed to update room preferences:', error);
			set({ error: 'Không thể cập nhật sở thích về phòng', isLoading: false });
			return false;
		}
	},

	// Delete room preferences
	removeRoomPreferences: async () => {
		set({ isLoading: true, error: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await deleteRoomPreferences(token);

			if (result.success) {
				set({ roomPreferences: null, isLoading: false });
				return true;
			} else {
				set({ error: result.error, isLoading: false });
				return false;
			}
		} catch (error) {
			console.error('Failed to delete room preferences:', error);
			set({ error: 'Không thể xóa sở thích về phòng', isLoading: false });
			return false;
		}
	},

	// Fetch roommate preferences
	fetchRoommatePreferences: async () => {
		set({ isLoading: true, error: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await getRoommatePreferences(token);

			if (result.success) {
				set({ roommatePreferences: result.data, isLoading: false });
			} else {
				// If no preferences found (404), set to null without showing error
				if (result.status === 404) {
					set({ roommatePreferences: null, isLoading: false });
				} else {
					set({ error: result.error, isLoading: false });
				}
			}
		} catch (error) {
			console.error('Failed to fetch roommate preferences:', error);
			set({ error: 'Không thể tải sở thích về bạn cùng phòng', isLoading: false });
		}
	},

	// Save roommate preferences (create or update)
	saveRoommatePreferences: async (data) => {
		set({ isLoading: true, error: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await createOrUpdateRoommatePreferences(data, token);

			if (result.success) {
				set({ roommatePreferences: result.data, isLoading: false });
				return true;
			} else {
				set({ error: result.error, isLoading: false });
				return false;
			}
		} catch (error) {
			console.error('Failed to save roommate preferences:', error);
			set({ error: 'Không thể lưu sở thích về bạn cùng phòng', isLoading: false });
			return false;
		}
	},

	// Update roommate preferences
	updateRoommatePrefs: async (data) => {
		set({ isLoading: true, error: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await updateRoommatePreferences(data, token);

			if (result.success) {
				set({ roommatePreferences: result.data, isLoading: false });
				return true;
			} else {
				set({ error: result.error, isLoading: false });
				return false;
			}
		} catch (error) {
			console.error('Failed to update roommate preferences:', error);
			set({ error: 'Không thể cập nhật sở thích về bạn cùng phòng', isLoading: false });
			return false;
		}
	},

	// Delete roommate preferences
	removeRoommatePreferences: async () => {
		set({ isLoading: true, error: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await deleteRoommatePreferences(token);

			if (result.success) {
				set({ roommatePreferences: null, isLoading: false });
				return true;
			} else {
				set({ error: result.error, isLoading: false });
				return false;
			}
		} catch (error) {
			console.error('Failed to delete roommate preferences:', error);
			set({ error: 'Không thể xóa sở thích về bạn cùng phòng', isLoading: false });
			return false;
		}
	},

	// Fetch all preferences
	fetchAllPreferences: async () => {
		set({ isLoading: true, error: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await getAllPreferences(token);

			if (result.success) {
				set({
					roomPreferences: result.data.roomPreferences,
					roommatePreferences: result.data.roommatePreferences,
					isLoading: false,
				});
			} else {
				set({ error: result.error, isLoading: false });
			}
		} catch (error) {
			console.error('Failed to fetch all preferences:', error);
			set({ error: 'Không thể tải tất cả sở thích', isLoading: false });
		}
	},

	// Helpers
	hasRoomPreferences: () => {
		return get().roomPreferences !== null;
	},

	hasRoommatePreferences: () => {
		return get().roommatePreferences !== null;
	},

	clearError: () => set({ error: null }),

	reset: () =>
		set({
			roomPreferences: null,
			roommatePreferences: null,
			isLoading: false,
			error: null,
		}),
}));
