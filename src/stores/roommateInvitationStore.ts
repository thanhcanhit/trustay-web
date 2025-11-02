import { toast } from 'sonner';
import { create } from 'zustand';
import { TokenManager } from '@/actions';
import {
	AcceptInviteRequest,
	AddRoommateDirectlyRequest,
	acceptInvite,
	addRoommateDirectly,
	GenerateInviteLinkResponse,
	generateInviteLink,
} from '@/actions/roommate-applications.action';

interface RoommateInvitationState {
	loading: boolean;
	error: string | null;
	inviteData: GenerateInviteLinkResponse | null;

	// Actions
	addRoommateDirect: (postId: string, data: AddRoommateDirectlyRequest) => Promise<boolean>;
	createInviteLink: () => Promise<GenerateInviteLinkResponse | null>;
	submitInviteAcceptance: (data: AcceptInviteRequest) => Promise<boolean>;
	clearError: () => void;
	clearInviteData: () => void;
}

export const useRoommateInvitationStore = create<RoommateInvitationState>((set) => ({
	loading: false,
	error: null,
	inviteData: null,

	// Add roommate directly
	addRoommateDirect: async (postId: string, data: AddRoommateDirectlyRequest) => {
		set({ loading: true, error: null });

		try {
			// Get token from localStorage or your auth store
			const token = TokenManager.getAccessToken();

			const result = await addRoommateDirectly(postId, data, token);

			if (result.success) {
				set({ loading: false });
				toast.success('Đã thêm người ở ghép thành công!');
				return true;
			} else {
				set({ loading: false, error: result.error });
				toast.error(result.error);
				return false;
			}
		} catch (err) {
			console.error('Error adding roommate:', err);
			const errorMessage = 'Đã có lỗi xảy ra khi thêm người ở ghép';
			set({ loading: false, error: errorMessage });
			toast.error(errorMessage);
			return false;
		}
	},

	// Generate invite link
	createInviteLink: async () => {
		set({ loading: true, error: null });

		try {
			// Get token from localStorage or your auth store
			const token = TokenManager.getAccessToken();

			const result = await generateInviteLink(token);

			if (result.success) {
				set({ loading: false, inviteData: result.data });
				toast.success('Đã tạo liên kết mời thành công!');
				return result.data;
			} else {
				set({ loading: false, error: result.error });
				toast.error(result.error);
				return null;
			}
		} catch (err) {
			console.error('Error creating invite link:', err);
			const errorMessage = 'Đã có lỗi xảy ra khi tạo liên kết mời';
			set({ loading: false, error: errorMessage });
			toast.error(errorMessage);
			return null;
		}
	},

	// Accept invite
	submitInviteAcceptance: async (data: AcceptInviteRequest) => {
		set({ loading: true, error: null });

		try {
			// Get token from localStorage or your auth store (if user is logged in)
			const token = TokenManager.getAccessToken();

			const result = await acceptInvite(data, token);

			if (result.success) {
				set({ loading: false });
				toast.success('Đã gửi đơn ứng tuyển thành công!');
				return true;
			} else {
				set({ loading: false, error: result.error });
				toast.error(result.error);
				return false;
			}
		} catch (err) {
			console.error('Error accepting invite:', err);
			const errorMessage = 'Đã có lỗi xảy ra khi gửi đơn';
			set({ loading: false, error: errorMessage });
			toast.error(errorMessage);
			return false;
		}
	},

	// Clear error
	clearError: () => set({ error: null }),

	// Clear invite data
	clearInviteData: () => set({ inviteData: null }),
}));
