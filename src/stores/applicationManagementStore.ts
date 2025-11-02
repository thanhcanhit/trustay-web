import { toast } from 'sonner';
import { create } from 'zustand';
import {
	confirmRoommateApplication,
	landlordApproveApplication,
	landlordRejectApplication,
} from '@/actions/roommate-applications.action';

interface ApplicationManagementState {
	loading: boolean;
	error: string | null;

	// Actions
	confirmApplication: (applicationId: string) => Promise<boolean>;
	approveApplicationAsLandlord: (applicationId: string, response: string) => Promise<boolean>;
	rejectApplicationAsLandlord: (applicationId: string, response: string) => Promise<boolean>;
	clearError: () => void;
}

export const useApplicationManagementStore = create<ApplicationManagementState>((set) => ({
	loading: false,
	error: null,

	// Applicant confirms application
	confirmApplication: async (applicationId: string) => {
		set({ loading: true, error: null });

		try {
			// Get token from localStorage or your auth store
			const token = localStorage.getItem('token') || undefined;

			const result = await confirmRoommateApplication(applicationId, token);

			if (result.success) {
				set({ loading: false });
				toast.success('Đã xác nhận đơn ứng tuyển! Rental sẽ được tạo.');
				return true;
			} else {
				set({ loading: false, error: result.error });
				toast.error(result.error);
				return false;
			}
		} catch (err) {
			console.error('Error confirming application:', err);
			const errorMessage = 'Đã có lỗi xảy ra khi xác nhận đơn';
			set({ loading: false, error: errorMessage });
			toast.error(errorMessage);
			return false;
		}
	},

	// Landlord approves application
	approveApplicationAsLandlord: async (applicationId: string, response: string) => {
		set({ loading: true, error: null });

		try {
			// Get token from localStorage or your auth store
			const token = localStorage.getItem('token') || undefined;

			const result = await landlordApproveApplication(applicationId, response, token);

			if (result.success) {
				set({ loading: false });
				toast.success('Đã phê duyệt đơn ứng tuyển!');
				return true;
			} else {
				set({ loading: false, error: result.error });
				toast.error(result.error);
				return false;
			}
		} catch (err) {
			console.error('Error approving application:', err);
			const errorMessage = 'Đã có lỗi xảy ra khi phê duyệt đơn';
			set({ loading: false, error: errorMessage });
			toast.error(errorMessage);
			return false;
		}
	},

	// Landlord rejects application
	rejectApplicationAsLandlord: async (applicationId: string, response: string) => {
		set({ loading: true, error: null });

		try {
			// Get token from localStorage or your auth store
			const token = localStorage.getItem('token') || undefined;

			const result = await landlordRejectApplication(applicationId, response, token);

			if (result.success) {
				set({ loading: false });
				toast.success('Đã từ chối đơn ứng tuyển');
				return true;
			} else {
				set({ loading: false, error: result.error });
				toast.error(result.error);
				return false;
			}
		} catch (err) {
			console.error('Error rejecting application:', err);
			const errorMessage = 'Đã có lỗi xảy ra khi từ chối đơn';
			set({ loading: false, error: errorMessage });
			toast.error(errorMessage);
			return false;
		}
	},

	// Clear error
	clearError: () => set({ error: null }),
}));
