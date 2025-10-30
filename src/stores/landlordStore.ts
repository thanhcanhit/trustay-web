import { create } from 'zustand';
import { listMyRoomsWithOccupants, listMyTenants } from '@/actions/landlord.action';
import { TokenManager } from '@/lib/api-client';
import type { RoomWithOccupants, TenantInfo } from '@/types/types';

interface LandlordState {
	// Data
	tenants: TenantInfo[];
	rooms: RoomWithOccupants[];

	// Loading states
	loadingTenants: boolean;
	loadingRooms: boolean;

	// Error states
	errorTenants: string | null;
	errorRooms: string | null;

	// Metadata
	tenantsMeta: { page: number; limit: number; total: number; totalPages: number } | null;
	roomsMeta: { page: number; limit: number; total: number; totalPages: number } | null;

	// Actions
	loadTenants: (params?: {
		page?: number;
		limit?: number;
		buildingId?: string;
		roomId?: string;
		search?: string;
	}) => Promise<void>;
	loadRooms: (params?: {
		page?: number;
		limit?: number;
		buildingId?: string;
		status?: string;
		occupancyStatus?: 'occupied' | 'vacant' | 'all';
	}) => Promise<void>;
	clearErrors: () => void;
}

export const useLandlordStore = create<LandlordState>((set) => ({
	// Initial state
	tenants: [],
	rooms: [],

	loadingTenants: false,
	loadingRooms: false,

	errorTenants: null,
	errorRooms: null,

	tenantsMeta: null,
	roomsMeta: null,

	// Load tenants
	loadTenants: async (params) => {
		set({ loadingTenants: true, errorTenants: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await listMyTenants(params, token);
			if (result.success) {
				set({
					tenants: result.data.data || [],
					tenantsMeta: {
						page: result.data.page || 1,
						limit: result.data.limit || 10,
						total: result.data.total || 0,
						totalPages: Math.ceil((result.data.total || 0) / (result.data.limit || 10)),
					},
					loadingTenants: false,
				});
			} else {
				set({
					errorTenants: result.error,
					loadingTenants: false,
				});
			}
		} catch (error) {
			set({
				errorTenants: error instanceof Error ? error.message : 'Đã có lỗi xảy ra',
				loadingTenants: false,
			});
		}
	},

	// Load rooms with occupants
	loadRooms: async (params) => {
		set({ loadingRooms: true, errorRooms: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await listMyRoomsWithOccupants(params, token);
			if (result.success) {
				set({
					rooms: result.data.data || [],
					roomsMeta: {
						page: result.data.page || 1,
						limit: result.data.limit || 10,
						total: result.data.total || 0,
						totalPages: Math.ceil((result.data.total || 0) / (result.data.limit || 10)),
					},
					loadingRooms: false,
				});
			} else {
				set({
					errorRooms: result.error,
					loadingRooms: false,
				});
			}
		} catch (error) {
			set({
				errorRooms: error instanceof Error ? error.message : 'Đã có lỗi xảy ra',
				loadingRooms: false,
			});
		}
	},

	// Clear all errors
	clearErrors: () => {
		set({
			errorTenants: null,
			errorRooms: null,
		});
	},
}));
