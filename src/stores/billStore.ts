import { create } from 'zustand';
import {
	createBillByRoomInstance,
	createBillForRoom,
	deleteBill,
	generateMonthlyBillsForBuilding,
	getBillById,
	getBills,
	getLandlordBillsByMonth,
	getTenantBills,
	markBillAsPaid,
	previewBillsForBuilding,
	updateBill,
	updateBillWithMeterData,
} from '@/actions/bill.action';
import { TokenManager } from '@/lib/api-client';
import type {
	Bill,
	BillQueryParams,
	CreateBillForRoomRequest,
	CreateBillRequest,
	GenerateMonthlyBillsRequest,
	GenerateMonthlyBillsResponse,
	LandlordBillQueryParams,
	PaginatedBillResponse,
	PreviewBillForBuildingRequest,
	UpdateBillRequest,
	UpdateBillWithMeterDataRequest,
} from '@/types/bill.types';

interface BillState {
	// Data
	bills: Bill[];
	current: Bill | null;
	previewData: unknown | null;
	generateResult: GenerateMonthlyBillsResponse | null;

	// Loading states
	loading: boolean;
	loadingCurrent: boolean;
	submitting: boolean;
	deleting: boolean;
	markingPaid: boolean;
	updatingMeter: boolean;
	previewing: boolean;
	generating: boolean;

	// Error states
	error: string | null;
	errorCurrent: string | null;
	submitError: string | null;
	deleteError: string | null;
	markPaidError: string | null;
	meterError: string | null;
	previewError: string | null;
	generateError: string | null;

	// Metadata
	meta: PaginatedBillResponse['meta'] | null;

	// Actions
	loadBills: (params?: BillQueryParams) => Promise<void>;
	loadLandlordBills: (params?: LandlordBillQueryParams) => Promise<void>;
	loadTenantBills: (params?: BillQueryParams) => Promise<void>;
	loadAll: () => Promise<void>;
	loadById: (id: string) => Promise<void>;
	loadBillById: (id: string) => Promise<Bill | null>;
	create: (data: CreateBillRequest) => Promise<boolean>;
	createForRoomInstance: (data: CreateBillForRoomRequest) => Promise<boolean>;
	update: (id: string, data: UpdateBillRequest) => Promise<boolean>;
	remove: (id: string) => Promise<boolean>;
	markPaid: (id: string) => Promise<boolean>;
	updateWithMeterData: (data: UpdateBillWithMeterDataRequest) => Promise<boolean>;
	preview: (data: PreviewBillForBuildingRequest) => Promise<boolean>;
	generateMonthlyBills: (
		data: GenerateMonthlyBillsRequest,
	) => Promise<GenerateMonthlyBillsResponse | null>;
	clearCurrent: () => void;
	clearErrors: () => void;
}

export const useBillStore = create<BillState>((set, get) => ({
	// Initial state
	bills: [],
	current: null,
	previewData: null,
	generateResult: null,

	loading: false,
	loadingCurrent: false,
	submitting: false,
	deleting: false,
	markingPaid: false,
	updatingMeter: false,
	previewing: false,
	generating: false,

	error: null,
	errorCurrent: null,
	submitError: null,
	deleteError: null,
	markPaidError: null,
	meterError: null,
	previewError: null,
	generateError: null,

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

	// Create bill for room (original API)
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

	// Create bill for room instance (new enhanced API with roomInstanceId)
	createForRoomInstance: async (data) => {
		set({ submitting: true, submitError: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await createBillByRoomInstance(data, token);
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

	// Load bills for landlord by month
	loadLandlordBills: async (params) => {
		set({ loading: true, error: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await getLandlordBillsByMonth(params, token);
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

	// Load bills for tenant
	loadTenantBills: async (params) => {
		set({ loading: true, error: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await getTenantBills(params, token);
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

	// Update bill with meter data and occupancy
	updateWithMeterData: async (data) => {
		set({ updatingMeter: true, meterError: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await updateBillWithMeterData(data, token);
			if (result.success) {
				set({
					current: result.data.data,
					updatingMeter: false,
				});
				// Note: Bills will be reloaded by the component
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

	// Generate monthly bills for building
	generateMonthlyBills: async (data) => {
		set({ generating: true, generateError: null, generateResult: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await generateMonthlyBillsForBuilding(data, token);
			if (result.success) {
				set({
					generateResult: result.data,
					generating: false,
				});
				// Reload bills list
				await get().loadBills();
				return result.data;
			} else {
				set({
					generateError: result.error,
					generating: false,
				});
				return null;
			}
		} catch (error) {
			set({
				generateError: error instanceof Error ? error.message : 'Đã có lỗi xảy ra',
				generating: false,
			});
			return null;
		}
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
			generateError: null,
		});
	},
}));
