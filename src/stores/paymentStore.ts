import { create } from 'zustand';
import {
	createPayment,
	createPaymentReceipt,
	generatePaymentQRCode,
	getPaymentById,
	getPaymentHistory,
	getPaymentStatistics,
	getPayments,
	processRefund,
	updatePayment,
} from '@/actions/payment.action';
import { TokenManager } from '@/lib/api-client';
import type {
	CreatePaymentReceiptRequest,
	CreatePaymentRequest,
	Payment,
	PaymentListResponse,
	PaymentStatistics,
	ProcessRefundRequest,
	UpdatePaymentRequest,
} from '@/types/types';

interface PaymentState {
	// Data
	payments: Payment[];
	paymentHistory: Payment[];
	current: Payment | null;
	statistics: PaymentStatistics | null;
	qrCodeUrl: string | null;

	// Loading states
	loading: boolean;
	loadingHistory: boolean;
	loadingCurrent: boolean;
	loadingStats: boolean;
	submitting: boolean;
	generating: boolean;

	// Error states
	error: string | null;
	errorHistory: string | null;
	errorCurrent: string | null;
	errorStats: string | null;
	submitError: string | null;
	generateError: string | null;

	// Metadata
	meta: PaymentListResponse['meta'] | null;
	historyMeta: PaymentListResponse['meta'] | null;

	// Actions
	loadPayments: (params?: {
		page?: number;
		limit?: number;
		status?: string;
		paymentType?: string;
		contractId?: string;
		rentalId?: string;
	}) => Promise<void>;
	loadPaymentHistory: (params?: {
		contractId?: string;
		rentalId?: string;
		startDate?: string;
		endDate?: string;
		page?: number;
		limit?: number;
	}) => Promise<void>;
	loadById: (id: string) => Promise<void>;
	loadStatistics: (params?: {
		contractId?: string;
		rentalId?: string;
		year?: number;
		month?: number;
	}) => Promise<void>;
	create: (data: CreatePaymentRequest) => Promise<boolean>;
	update: (id: string, data: UpdatePaymentRequest) => Promise<boolean>;
	createReceipt: (
		paymentId: string,
		data: Omit<CreatePaymentReceiptRequest, 'paymentId'>,
	) => Promise<boolean>;
	refund: (data: ProcessRefundRequest) => Promise<boolean>;
	generateQR: (id: string) => Promise<boolean>;
	clearCurrent: () => void;
	clearErrors: () => void;
	clearQRCode: () => void;
}

export const usePaymentStore = create<PaymentState>((set, get) => ({
	// Initial state
	payments: [],
	paymentHistory: [],
	current: null,
	statistics: null,
	qrCodeUrl: null,

	loading: false,
	loadingHistory: false,
	loadingCurrent: false,
	loadingStats: false,
	submitting: false,
	generating: false,

	error: null,
	errorHistory: null,
	errorCurrent: null,
	errorStats: null,
	submitError: null,
	generateError: null,

	meta: null,
	historyMeta: null,

	// Load payments with filtering
	loadPayments: async (params) => {
		set({ loading: true, error: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await getPayments(params, token);
			if (result.success) {
				set({
					payments: result.data.data,
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

	// Load payment history
	loadPaymentHistory: async (params) => {
		set({ loadingHistory: true, errorHistory: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await getPaymentHistory(params, token);
			if (result.success) {
				set({
					paymentHistory: result.data.data,
					historyMeta: result.data.meta,
					loadingHistory: false,
				});
			} else {
				set({
					errorHistory: result.error,
					loadingHistory: false,
				});
			}
		} catch (error) {
			set({
				errorHistory: error instanceof Error ? error.message : 'Đã có lỗi xảy ra',
				loadingHistory: false,
			});
		}
	},

	// Load payment by ID
	loadById: async (id) => {
		set({ loadingCurrent: true, errorCurrent: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await getPaymentById(id, token);
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

	// Load payment statistics
	loadStatistics: async (params) => {
		set({ loadingStats: true, errorStats: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await getPaymentStatistics(params, token);
			if (result.success) {
				set({
					statistics: result.data,
					loadingStats: false,
				});
			} else {
				set({
					errorStats: result.error,
					loadingStats: false,
				});
			}
		} catch (error) {
			set({
				errorStats: error instanceof Error ? error.message : 'Đã có lỗi xảy ra',
				loadingStats: false,
			});
		}
	},

	// Create payment
	create: async (data) => {
		set({ submitting: true, submitError: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await createPayment(data, token);
			if (result.success) {
				set({
					current: result.data.data,
					submitting: false,
				});
				// Reload payments list
				await get().loadPayments();
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

	// Update payment
	update: async (id, data) => {
		set({ submitting: true, submitError: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await updatePayment(id, data, token);
			if (result.success) {
				set({
					current: result.data.data,
					submitting: false,
				});
				// Reload payments list
				await get().loadPayments();
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

	// Create payment receipt
	createReceipt: async (paymentId, data) => {
		set({ submitting: true, submitError: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await createPaymentReceipt(paymentId, data, token);
			if (result.success) {
				set({ submitting: false });
				// Reload current payment to get updated receipt info
				await get().loadById(paymentId);
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

	// Process refund
	refund: async (data) => {
		set({ submitting: true, submitError: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await processRefund(data, token);
			if (result.success) {
				set({
					current: result.data.data,
					submitting: false,
				});
				// Reload payments list
				await get().loadPayments();
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

	// Generate QR code
	generateQR: async (id) => {
		set({ generating: true, generateError: null });
		try {
			const token = TokenManager.getAccessToken();
			const result = await generatePaymentQRCode(id, token);
			if (result.success) {
				set({
					qrCodeUrl: result.data.qrCodeUrl,
					generating: false,
				});
				return true;
			} else {
				set({
					generateError: result.error,
					generating: false,
				});
				return false;
			}
		} catch (error) {
			set({
				generateError: error instanceof Error ? error.message : 'Đã có lỗi xảy ra',
				generating: false,
			});
			return false;
		}
	},

	// Clear current payment
	clearCurrent: () => {
		set({ current: null, errorCurrent: null });
	},

	// Clear all errors
	clearErrors: () => {
		set({
			error: null,
			errorHistory: null,
			errorCurrent: null,
			errorStats: null,
			submitError: null,
			generateError: null,
		});
	},

	// Clear QR code
	clearQRCode: () => {
		set({ qrCodeUrl: null, generateError: null });
	},
}));
