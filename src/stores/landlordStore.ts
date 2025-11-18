import { create } from 'zustand';
import {
	getDashboardFinance,
	getDashboardOperations,
	getDashboardOverview,
	listMyRoomsWithOccupants,
	listMyTenants,
} from '@/actions/landlord.action';
import { TokenManager } from '@/lib/api-client';
import type {
	DashboardFinanceResponseDto,
	DashboardOperationsResponseDto,
	DashboardOverviewResponseDto,
	RoomWithOccupants,
	TenantInfo,
} from '@/types/types';

interface LandlordState {
	// Data
	tenants: TenantInfo[];
	rooms: RoomWithOccupants[];
	dashboardOverview: DashboardOverviewResponseDto | null;
	dashboardOperations: DashboardOperationsResponseDto | null;
	dashboardFinance: DashboardFinanceResponseDto | null;

	// Loading states
	loadingTenants: boolean;
	loadingRooms: boolean;
	loadingDashboardOverview: boolean;
	loadingDashboardOperations: boolean;
	loadingDashboardFinance: boolean;

	// Error states
	errorTenants: string | null;
	errorRooms: string | null;
	errorDashboardOverview: string | null;
	errorDashboardOperations: string | null;
	errorDashboardFinance: string | null;

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
	loadDashboardOverview: (params?: { buildingId?: string }) => Promise<void>;
	loadDashboardOperations: (params?: { buildingId?: string }) => Promise<void>;
	loadDashboardFinance: (params?: {
		buildingId?: string;
		referenceMonth?: string;
	}) => Promise<void>;
	clearErrors: () => void;
}

export const useLandlordStore = create<LandlordState>((set) => ({
	// Initial state
	tenants: [],
	rooms: [],
	dashboardOverview: null,
	dashboardOperations: null,
	dashboardFinance: null,

	loadingTenants: false,
	loadingRooms: false,
	loadingDashboardOverview: false,
	loadingDashboardOperations: false,
	loadingDashboardFinance: false,

	errorTenants: null,
	errorRooms: null,
	errorDashboardOverview: null,
	errorDashboardOperations: null,
	errorDashboardFinance: null,

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

	// Load dashboard overview
	loadDashboardOverview: async (params) => {
		set({ loadingDashboardOverview: true, errorDashboardOverview: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await getDashboardOverview(params, token);
			if (result.success) {
				set({
					dashboardOverview: result.data,
					loadingDashboardOverview: false,
				});
			} else {
				set({
					errorDashboardOverview: result.error,
					loadingDashboardOverview: false,
				});
			}
		} catch (error) {
			set({
				errorDashboardOverview: error instanceof Error ? error.message : 'Đã có lỗi xảy ra',
				loadingDashboardOverview: false,
			});
		}
	},

	// Load dashboard operations
	loadDashboardOperations: async (params) => {
		set({ loadingDashboardOperations: true, errorDashboardOperations: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await getDashboardOperations(params, token);
			if (result.success) {
				set({
					dashboardOperations: result.data,
					loadingDashboardOperations: false,
				});
			} else {
				set({
					errorDashboardOperations: result.error,
					loadingDashboardOperations: false,
				});
			}
		} catch (error) {
			set({
				errorDashboardOperations: error instanceof Error ? error.message : 'Đã có lỗi xảy ra',
				loadingDashboardOperations: false,
			});
		}
	},

	// Load dashboard finance
	loadDashboardFinance: async (params) => {
		set({ loadingDashboardFinance: true, errorDashboardFinance: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await getDashboardFinance(params, token);
			if (result.success) {
				set({
					dashboardFinance: result.data,
					loadingDashboardFinance: false,
				});
			} else {
				set({
					errorDashboardFinance: result.error,
					loadingDashboardFinance: false,
				});
			}
		} catch (error) {
			set({
				errorDashboardFinance: error instanceof Error ? error.message : 'Đã có lỗi xảy ra',
				loadingDashboardFinance: false,
			});
		}
	},

	// Clear all errors
	clearErrors: () => {
		set({
			errorTenants: null,
			errorRooms: null,
			errorDashboardOverview: null,
			errorDashboardOperations: null,
			errorDashboardFinance: null,
		});
	},
}));
