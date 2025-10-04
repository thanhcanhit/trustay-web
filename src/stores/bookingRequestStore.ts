import { create } from 'zustand';
import {
	approveBookingRequestAndCreateRental,
	cancelMyBookingRequest,
	confirmBookingRequest,
	createBookingRequest,
	getBookingRequestById,
	getMyBookingRequests,
	getReceivedBookingRequests,
	updateBookingRequestAsOwner,
} from '@/actions/booking-request.action';
import { TokenManager } from '@/lib/api-client';
import type {
	BookingRequest,
	BookingRequestListResponse,
	CancelBookingRequestRequest,
	ConfirmBookingRequestRequest,
	CreateBookingRequestRequest,
	UpdateBookingRequestRequest,
} from '@/types/types';

interface BookingRequestState {
	received: BookingRequest[];
	mine: BookingRequest[];
	current: BookingRequest | null;

	loadingReceived: boolean;
	loadingMine: boolean;
	loadingCurrent: boolean;
	submitting: boolean;

	errorReceived: string | null;
	errorMine: string | null;
	errorCurrent: string | null;
	submitError: string | null;

	receivedMeta: BookingRequestListResponse['meta'] | null;
	mineMeta: BookingRequestListResponse['meta'] | null;

	loadReceived: (params?: {
		page?: number;
		limit?: number;
		status?: string;
		buildingId?: string;
		roomId?: string;
	}) => Promise<void>;
	loadMine: (params?: { page?: number; limit?: number; status?: string }) => Promise<void>;
	loadById: (id: string) => Promise<void>;
	create: (data: CreateBookingRequestRequest) => Promise<boolean>;
	ownerUpdate: (id: string, data: UpdateBookingRequestRequest) => Promise<boolean>;
	confirm: (id: string, data: ConfirmBookingRequestRequest) => Promise<boolean>;
	approveAndCreateRental: (
		id: string,
		ownerNotes?: string,
	) => Promise<{ rentalId: string; contractId: string } | null>;
	cancelMine: (id: string, data: CancelBookingRequestRequest) => Promise<boolean>;
	clearCurrent: () => void;
	clearErrors: () => void;
}

export const useBookingRequestStore = create<BookingRequestState>((set, get) => ({
	received: [],
	mine: [],
	current: null,

	loadingReceived: false,
	loadingMine: false,
	loadingCurrent: false,
	submitting: false,

	errorReceived: null,
	errorMine: null,
	errorCurrent: null,
	submitError: null,

	receivedMeta: null,
	mineMeta: null,

	loadReceived: async (params = {}) => {
		set({ loadingReceived: true, errorReceived: null });
		const token = TokenManager.getAccessToken();
		const res = await getReceivedBookingRequests(params, token);
		if (res.success) {
			set({ received: res.data.data, receivedMeta: res.data.meta, loadingReceived: false });
		} else {
			set({ loadingReceived: false, errorReceived: res.error });
		}
	},

	loadMine: async (params = {}) => {
		set({ loadingMine: true, errorMine: null });
		const token = TokenManager.getAccessToken();
		const res = await getMyBookingRequests(params, token);
		if (res.success) {
			set({ mine: res.data.data, mineMeta: res.data.meta, loadingMine: false });
		} else {
			set({ loadingMine: false, errorMine: res.error });
		}
	},

	loadById: async (id: string) => {
		set({ loadingCurrent: true, errorCurrent: null });
		const token = TokenManager.getAccessToken();
		const res = await getBookingRequestById(id, token);
		if (res.success) {
			set({ current: res.data.data, loadingCurrent: false });
		} else {
			set({ loadingCurrent: false, errorCurrent: res.error });
		}
	},

	create: async (data: CreateBookingRequestRequest) => {
		set({ submitting: true, submitError: null });
		const token = TokenManager.getAccessToken();
		const res = await createBookingRequest(data, token);
		if (res.success) {
			const { mine } = get();
			set({ mine: [res.data.data, ...mine], submitting: false });
			return true;
		}
		set({ submitting: false, submitError: res.error });
		return false;
	},

	ownerUpdate: async (id, data) => {
		set({ submitting: true, submitError: null });
		const token = TokenManager.getAccessToken();
		const res = await updateBookingRequestAsOwner(id, data, token);
		if (res.success) {
			// Update the specific item in the received array
			const { received } = get();
			const updatedReceived = received.map((item) =>
				item.id === id
					? {
							...item,
							...(data.status && { status: data.status }),
							ownerNotes: data.ownerNotes || item.ownerNotes,
						}
					: item,
			);
			set({ received: updatedReceived, submitting: false });
			return true;
		}
		set({ submitting: false, submitError: res.error });
		return false;
	},

	confirm: async (id, data) => {
		set({ submitting: true, submitError: null });
		const token = TokenManager.getAccessToken();
		const res = await confirmBookingRequest(id, data, token);
		if (res.success) {
			// Update the specific item in the mine array
			const { mine } = get();
			const updatedMine = mine.map((item) =>
				item.id === id
					? {
							...item,
							isConfirmedByTenant: true,
							confirmedAt: new Date().toISOString(),
						}
					: item,
			);
			set({ mine: updatedMine, submitting: false });
			return true;
		}
		set({ submitting: false, submitError: res.error });
		return false;
	},

	/**
	 * @deprecated Use ownerUpdate + tenant confirm flow instead
	 */
	approveAndCreateRental: async (id, ownerNotes) => {
		set({ submitting: true, submitError: null });
		const token = TokenManager.getAccessToken();
		const res = await approveBookingRequestAndCreateRental(id, ownerNotes, token);
		if (res.success) {
			// Update the specific item in the received array
			const { received } = get();
			const updatedReceived = received.map((item) =>
				item.id === id
					? {
							...item,
							status: 'approved' as const,
							ownerNotes: ownerNotes || item.ownerNotes,
						}
					: item,
			);
			set({ received: updatedReceived, submitting: false });
			return res.data;
		}
		set({ submitting: false, submitError: res.error });
		return null;
	},

	cancelMine: async (id, data) => {
		set({ submitting: true, submitError: null });
		const token = TokenManager.getAccessToken();
		const res = await cancelMyBookingRequest(id, data, token);
		if (res.success) {
			// Update the specific item in the mine array
			const { mine } = get();
			const updatedMine = mine.map((item) =>
				item.id === id ? { ...item, status: 'cancelled' as const } : item,
			);
			set({ mine: updatedMine, submitting: false });
			return true;
		}
		set({ submitting: false, submitError: res.error });
		return false;
	},

	clearCurrent: () => set({ current: null, errorCurrent: null }),
	clearErrors: () =>
		set({ errorReceived: null, errorMine: null, errorCurrent: null, submitError: null }),
}));
