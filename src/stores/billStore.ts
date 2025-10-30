import { create } from 'zustand';
import {
	createBillForRoom,
	deleteBill,
	getBillById,
	getBills,
	markBillAsPaid,
	previewBillsForBuilding,
	updateBill,
	updateMeterData,
} from '@/actions/bill.action';
import { TokenManager } from '@/lib/api-client';
import type {
	Bill,
	BillQueryParams,
	CreateBillRequest,
	PaginatedBillResponse,
	PreviewBillForBuildingRequest,
	UpdateBillRequest,
	UpdateMeterDataRequest,
} from '@/types/bill.types';

interface BillState {
	// Data
	bills: Bill[];
	current: Bill | null;
	previewData: unknown | null;

	// Loading states
	loading: boolean;
	loadingCurrent: boolean;
	submitting: boolean;
	deleting: boolean;
	markingPaid: boolean;
	updatingMeter: boolean;
	previewing: boolean;

	// Error states
	error: string | null;
	errorCurrent: string | null;
	submitError: string | null;
	deleteError: string | null;
	markPaidError: string | null;
	meterError: string | null;
	previewError: string | null;

	// Metadata
	meta: PaginatedBillResponse['meta'] | null;

	// Actions
	loadBills: (params?: BillQueryParams) => Promise<void>;
	loadAll: () => Promise<void>;
	loadById: (id: string) => Promise<void>;
	loadBillById: (id: string) => Promise<Bill | null>;
	create: (data: CreateBillRequest) => Promise<boolean>;
	update: (id: string, data: UpdateBillRequest) => Promise<boolean>;
	remove: (id: string) => Promise<boolean>;
	markPaid: (id: string) => Promise<boolean>;
	updateMeter: (id: string, data: UpdateMeterDataRequest) => Promise<boolean>;
	preview: (data: PreviewBillForBuildingRequest) => Promise<boolean>;
	clearCurrent: () => void;
	clearErrors: () => void;
}

export const useBillStore = create<BillState>((set, get) => ({
	// Initial state
	bills: [],
	current: null,
	previewData: null,

	loading: false,
	loadingCurrent: false,
	submitting: false,
	deleting: false,
	markingPaid: false,
	updatingMeter: false,
	previewing: false,

	error: null,
	errorCurrent: null,
	submitError: null,
	deleteError: null,
	markPaidError: null,
	meterError: null,
	previewError: null,

	meta: null,

	// Load all bills (shorthand for loadBills without params)
	loadAll: async () => {
		return get().loadBills();
	},

	// Load bills list
	loadBills: async (params) => {
		set({ loading: true, error: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await getBills(params, token);
			if (result.success) {
				set({
					bills: result.data.data,
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

	// Load bill by ID
	loadById: async (id) => {
		set({ loadingCurrent: true, errorCurrent: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await getBillById(id, token);
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

	// Load bill by ID and return it
	loadBillById: async (id) => {
		set({ loading: true, error: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await getBillById(id, token);
			if (result.success) {
				set({ loading: false });
				return result.data.data;
			} else {
				set({
					error: result.error,
					loading: false,
				});
				return null;
			}
		} catch (error) {
			set({
				error: error instanceof Error ? error.message : 'Đã có lỗi xảy ra',
				loading: false,
			});
			return null;
		}
	},

	// Create bill for room
	create: async (data) => {
		set({ submitting: true, submitError: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await createBillForRoom(data, token);
			if (result.success) {
				set({
					current: result.data.data,
					submitting: false,
				});
				// Reload bills list
				await get().loadBills();
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

	// Update bill
	update: async (id, data) => {
		set({ submitting: true, submitError: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await updateBill(id, data, token);
			if (result.success) {
				set({
					current: result.data.data,
					submitting: false,
				});
				// Reload bills list
				await get().loadBills();
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

	// Delete bill
	remove: async (id) => {
		set({ deleting: true, deleteError: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await deleteBill(id, token);
			if (result.success) {
				set({ deleting: false });
				// Reload bills list
				await get().loadBills();
				return true;
			} else {
				set({
					deleteError: result.error,
					deleting: false,
				});
				return false;
			}
		} catch (error) {
			set({
				deleteError: error instanceof Error ? error.message : 'Đã có lỗi xảy ra',
				deleting: false,
			});
			return false;
		}
	},

	// Mark bill as paid
	markPaid: async (id) => {
		set({ markingPaid: true, markPaidError: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await markBillAsPaid(id, token);
			if (result.success) {
				set({
					current: result.data.data,
					markingPaid: false,
				});
				// Reload bills list
				await get().loadBills();
				return true;
			} else {
				set({
					markPaidError: result.error,
					markingPaid: false,
				});
				return false;
			}
		} catch (error) {
			set({
				markPaidError: error instanceof Error ? error.message : 'Đã có lỗi xảy ra',
				markingPaid: false,
			});
			return false;
		}
	},

	// Update meter data
	updateMeter: async (id, data) => {
		set({ updatingMeter: true, meterError: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await updateMeterData(id, data, token);
			if (result.success) {
				set({
					current: result.data.data,
					updatingMeter: false,
				});
				// Reload bills list
				await get().loadBills();
				return true;
			} else {
				set({
					meterError: result.error,
					updatingMeter: false,
				});
				return false;
			}
		} catch (error) {
			set({
				meterError: error instanceof Error ? error.message : 'Đã có lỗi xảy ra',
				updatingMeter: false,
			});
			return false;
		}
	},

	// Preview bills for building
	preview: async (data) => {
		set({ previewing: true, previewError: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await previewBillsForBuilding(data, token);
			if (result.success) {
				set({
					previewData: result.data,
					previewing: false,
				});
				return true;
			} else {
				set({
					previewError: result.error,
					previewing: false,
				});
				return false;
			}
		} catch (error) {
			set({
				previewError: error instanceof Error ? error.message : 'Đã có lỗi xảy ra',
				previewing: false,
			});
			return false;
		}
	},

	// Clear current bill
	clearCurrent: () => {
		set({
			current: null,
			errorCurrent: null,
			previewData: null,
		});
	},

	// Clear all errors
	clearErrors: () => {
		set({
			error: null,
			errorCurrent: null,
			submitError: null,
			deleteError: null,
			markPaidError: null,
			meterError: null,
			previewError: null,
		});
	},
}));
