import { create } from 'zustand';
import {
	createRental,
	getLandlordRentals,
	getMyRentals,
	getRentalById,
	getTenantRentals,
	renewRental,
	terminateRental,
	updateRental,
} from '@/actions/rental.action';
import { TokenManager } from '@/lib/api-client';
import type {
	CreateRentalRequest,
	RenewRentalRequest,
	Rental,
	RentalListResponse,
	TerminateRentalRequest,
	UpdateRentalRequest,
} from '@/types/types';

interface RentalState {
	// Data
	rentals: Rental[];
	landlordRentals: Rental[];
	tenantRentals: Rental[];
	current: Rental | null;

	// Loading states
	loading: boolean;
	loadingLandlord: boolean;
	loadingTenant: boolean;
	loadingCurrent: boolean;
	submitting: boolean;

	// Error states
	error: string | null;
	errorLandlord: string | null;
	errorTenant: string | null;
	errorCurrent: string | null;
	submitError: string | null;

	// Metadata
	meta: RentalListResponse['meta'] | null;
	landlordMeta: RentalListResponse['meta'] | null;
	tenantMeta: RentalListResponse['meta'] | null;

	// Actions
	loadRentals: (params?: { page?: number; limit?: number; status?: string }) => Promise<void>;
	loadLandlordRentals: (params?: { page?: number; limit?: number }) => Promise<void>;
	loadTenantRentals: (params?: { page?: number; limit?: number }) => Promise<void>;
	loadById: (id: string) => Promise<void>;
	create: (data: CreateRentalRequest) => Promise<boolean>;
	update: (id: string, data: UpdateRentalRequest) => Promise<boolean>;
	terminate: (id: string, data: TerminateRentalRequest) => Promise<boolean>;
	renew: (id: string, data: RenewRentalRequest) => Promise<boolean>;
	clearCurrent: () => void;
	clearErrors: () => void;
}

export const useRentalStore = create<RentalState>((set, get) => ({
	// Initial state
	rentals: [],
	landlordRentals: [],
	tenantRentals: [],
	current: null,

	loading: false,
	loadingLandlord: false,
	loadingTenant: false,
	loadingCurrent: false,
	submitting: false,

	error: null,
	errorLandlord: null,
	errorTenant: null,
	errorCurrent: null,
	submitError: null,

	meta: null,
	landlordMeta: null,
	tenantMeta: null,

	// Load general rentals
	loadRentals: async (params) => {
		set({ loading: true, error: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await getMyRentals(params, token);
			if (result.success) {
				set({
					rentals: result.data.data,
					meta: result.data.meta,
					loading: false,
				});
			} else {
				set({
					error: result.error,
					loading: false,
				});
			}
		} catch (error) {
			set({
				error: error instanceof Error ? error.message : 'Đã có lỗi xảy ra',
				loading: false,
			});
		}
	},

	// Load landlord rentals
	loadLandlordRentals: async (params) => {
		set({ loadingLandlord: true, errorLandlord: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await getLandlordRentals(params, token);
			if (result.success) {
				set({
					landlordRentals: result.data.data,
					landlordMeta: result.data.meta,
					loadingLandlord: false,
				});
			} else {
				set({
					errorLandlord: result.error,
					loadingLandlord: false,
				});
			}
		} catch (error) {
			set({
				errorLandlord: error instanceof Error ? error.message : 'Đã có lỗi xảy ra',
				loadingLandlord: false,
			});
		}
	},

	// Load tenant rentals
	loadTenantRentals: async (params) => {
		set({ loadingTenant: true, errorTenant: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await getTenantRentals(params, token);
			if (result.success) {
				set({
					tenantRentals: result.data.data,
					tenantMeta: result.data.meta,
					loadingTenant: false,
				});
			} else {
				set({
					errorTenant: result.error,
					loadingTenant: false,
				});
			}
		} catch (error) {
			set({
				errorTenant: error instanceof Error ? error.message : 'Đã có lỗi xảy ra',
				loadingTenant: false,
			});
		}
	},

	// Load rental by ID
	loadById: async (id) => {
		set({ loadingCurrent: true, errorCurrent: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await getRentalById(id, token);
			if (result.success) {
				set({
					current: result.data.data,
					loadingCurrent: false,
				});
			} else {
				set({
					errorCurrent: result.error,
					loadingCurrent: false,
				});
			}
		} catch (error) {
			set({
				errorCurrent: error instanceof Error ? error.message : 'Đã có lỗi xảy ra',
				loadingCurrent: false,
			});
		}
	},

	// Create rental
	create: async (data) => {
		set({ submitting: true, submitError: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await createRental(data, token);
			if (result.success) {
				set({
					current: result.data.data,
					submitting: false,
				});
				// Reload rentals lists
				await get().loadRentals();
				return true;
			} else {
				set({
					submitError: result.error,
					submitting: false,
				});
				return false;
			}
		} catch (error) {
			set({
				submitError: error instanceof Error ? error.message : 'Đã có lỗi xảy ra',
				submitting: false,
			});
			return false;
		}
	},

	// Update rental
	update: async (id, data) => {
		set({ submitting: true, submitError: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await updateRental(id, data, token);
			if (result.success) {
				set({
					current: result.data.data,
					submitting: false,
				});
				// Reload rentals lists
				await get().loadRentals();
				return true;
			} else {
				set({
					submitError: result.error,
					submitting: false,
				});
				return false;
			}
		} catch (error) {
			set({
				submitError: error instanceof Error ? error.message : 'Đã có lỗi xảy ra',
				submitting: false,
			});
			return false;
		}
	},

	// Terminate rental
	terminate: async (id, data) => {
		set({ submitting: true, submitError: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await terminateRental(id, data, token);
			if (result.success) {
				set({
					current: result.data.data,
					submitting: false,
				});
				// Reload rentals lists
				await get().loadRentals();
				return true;
			} else {
				set({
					submitError: result.error,
					submitting: false,
				});
				return false;
			}
		} catch (error) {
			set({
				submitError: error instanceof Error ? error.message : 'Đã có lỗi xảy ra',
				submitting: false,
			});
			return false;
		}
	},

	// Renew rental
	renew: async (id, data) => {
		set({ submitting: true, submitError: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await renewRental(id, data, token);
			if (result.success) {
				set({
					current: result.data.data,
					submitting: false,
				});
				// Reload rentals lists
				await get().loadRentals();
				return true;
			} else {
				set({
					submitError: result.error,
					submitting: false,
				});
				return false;
			}
		} catch (error) {
			set({
				submitError: error instanceof Error ? error.message : 'Đã có lỗi xảy ra',
				submitting: false,
			});
			return false;
		}
	},

	// Clear current rental
	clearCurrent: () => {
		set({ current: null, errorCurrent: null });
	},

	// Clear all errors
	clearErrors: () => {
		set({
			error: null,
			errorLandlord: null,
			errorTenant: null,
			errorCurrent: null,
			submitError: null,
		});
	},
}));
