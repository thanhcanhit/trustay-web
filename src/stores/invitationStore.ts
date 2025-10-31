import { create } from 'zustand';
import {
	confirmInvitation,
	createRoomInvitation,
	getInvitationById,
	getReceivedInvitations,
	getSentInvitations,
	respondToInvitation,
	withdrawInvitation,
} from '@/actions/invitation.action';
import { TokenManager } from '@/lib/api-client';
import type {
	CreateRoomInvitationRequest,
	InvitationListResponse,
	RoomInvitation,
} from '@/types/types';

interface InvitationState {
	sent: RoomInvitation[];
	received: RoomInvitation[];
	current: RoomInvitation | null;

	loadingSent: boolean;
	loadingReceived: boolean;
	loadingCurrent: boolean;
	submitting: boolean;

	errorSent: string | null;
	errorReceived: string | null;
	errorCurrent: string | null;
	submitError: string | null;

	sentMeta: InvitationListResponse['meta'] | null;
	receivedMeta: InvitationListResponse['meta'] | null;

	loadSent: (params?: {
		page?: number;
		limit?: number;
		status?: string;
		buildingId?: string;
		roomId?: string;
	}) => Promise<void>;
	loadReceived: (params?: { page?: number; limit?: number; status?: string }) => Promise<void>;
	loadById: (id: string) => Promise<void>;
	create: (data: CreateRoomInvitationRequest) => Promise<boolean>;
	respond: (id: string, status: 'accepted' | 'declined', tenantNotes?: string) => Promise<boolean>;
	confirm: (id: string) => Promise<{ rentalId?: string } | null>;
	withdraw: (id: string) => Promise<boolean>;
	clearCurrent: () => void;
	clearErrors: () => void;
}

export const useInvitationStore = create<InvitationState>((set, get) => ({
	sent: [],
	received: [],
	current: null,

	loadingSent: false,
	loadingReceived: false,
	loadingCurrent: false,
	submitting: false,

	errorSent: null,
	errorReceived: null,
	errorCurrent: null,
	submitError: null,

	sentMeta: null,
	receivedMeta: null,

	loadSent: async (params = {}) => {
		set({ loadingSent: true, errorSent: null });
		const token = TokenManager.getAccessToken();
		const res = await getSentInvitations(params, token);
		if (res.success) {
			set({ sent: res.data.data, sentMeta: res.data.meta, loadingSent: false });
		} else {
			set({ loadingSent: false, errorSent: res.error });
		}
	},

	loadReceived: async (params = {}) => {
		set({ loadingReceived: true, errorReceived: null });
		const token = TokenManager.getAccessToken();
		const res = await getReceivedInvitations(params, token);
		if (res.success) {
			set({ received: res.data.data, receivedMeta: res.data.meta, loadingReceived: false });
		} else {
			set({ loadingReceived: false, errorReceived: res.error });
		}
	},

	loadById: async (id: string) => {
		set({ loadingCurrent: true, errorCurrent: null });
		const token = TokenManager.getAccessToken();
		const res = await getInvitationById(id, token);
		if (res.success) {
			set({ current: res.data.data, loadingCurrent: false });
		} else {
			set({ loadingCurrent: false, errorCurrent: res.error });
		}
	},

	create: async (data: CreateRoomInvitationRequest) => {
		set({ submitting: true, submitError: null });
		const token = TokenManager.getAccessToken();
		const res = await createRoomInvitation(data, token);
		if (res.success) {
			const { sent } = get();
			set({ sent: [res.data.data, ...sent], submitting: false });
			return true;
		}
		set({ submitting: false, submitError: res.error });
		return false;
	},

	respond: async (id, status, tenantNotes) => {
		set({ submitting: true, submitError: null });
		const token = TokenManager.getAccessToken();
		const res = await respondToInvitation(id, { status, tenantNotes }, token);
		if (res.success) {
			// reload current
			await get().loadById(id);
			set({ submitting: false });
			return true;
		}
		set({ submitting: false, submitError: res.error });
		return false;
	},

	confirm: async (id) => {
		set({ submitting: true, submitError: null });
		const token = TokenManager.getAccessToken();
		const res = await confirmInvitation(id, token);
		if (res.success) {
			// reload current
			await get().loadById(id);
			set({ submitting: false });
			return { rentalId: res.data.rental?.id };
		}
		set({ submitting: false, submitError: res.error });
		return null;
	},

	withdraw: async (id) => {
		set({ submitting: true, submitError: null });
		const token = TokenManager.getAccessToken();
		const res = await withdrawInvitation(id, token);
		if (res.success) {
			set({ submitting: false });
			// remove from sent list
			const { sent } = get();
			set({ sent: sent.filter((i) => i.id !== id) });
			return true;
		}
		set({ submitting: false, submitError: res.error });
		return false;
	},

	clearCurrent: () => set({ current: null, errorCurrent: null }),
	clearErrors: () =>
		set({ errorSent: null, errorReceived: null, errorCurrent: null, submitError: null }),
}));
