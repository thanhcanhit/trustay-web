import { create } from 'zustand';
import {
	sendVerificationCode as apiSendVerificationCode,
	verifyCode as apiVerifyCode,
} from '@/actions/verification.action';
import { TokenManager } from '@/lib/api-client';

interface VerificationState {
	isLoading: boolean;
	error: string | null;

	// Actions
	sendVerificationCode: (type: 'email' | 'phone', value: string) => Promise<boolean>;
	verifyCode: (type: 'email' | 'phone', value: string, code: string) => Promise<boolean>;
	clearError: () => void;
}

export const useVerificationStore = create<VerificationState>((set) => ({
	isLoading: false,
	error: null,

	sendVerificationCode: async (type: 'email' | 'phone', value: string): Promise<boolean> => {
		set({ isLoading: true, error: null });

		try {
			const token = TokenManager.getAccessToken();
			if (!token) {
				set({ isLoading: false, error: 'Không tìm thấy token xác thực' });
				return false;
			}

			const request = {
				type,
				...(type === 'email' ? { email: value } : { phone: value }),
			};

			const result = await apiSendVerificationCode(request, token);

			if (result.success) {
				set({ isLoading: false, error: null });
				return true;
			} else {
				set({ isLoading: false, error: result.error });
				return false;
			}
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error ? error.message : 'Có lỗi xảy ra khi gửi mã xác thực';
			set({ isLoading: false, error: errorMessage });
			return false;
		}
	},

	verifyCode: async (type: 'email' | 'phone', value: string, code: string): Promise<boolean> => {
		set({ isLoading: true, error: null });

		try {
			const token = TokenManager.getAccessToken();
			if (!token) {
				set({ isLoading: false, error: 'Không tìm thấy token xác thực' });
				return false;
			}

			const request = {
				type,
				code,
				...(type === 'email' ? { email: value } : { phone: value }),
			};

			const result = await apiVerifyCode(request, token);

			if (result.success) {
				set({ isLoading: false, error: null });
				return true;
			} else {
				set({ isLoading: false, error: result.error });
				return false;
			}
		} catch (error: unknown) {
			const errorMessage = error instanceof Error ? error.message : 'Mã xác thực không chính xác';
			set({ isLoading: false, error: errorMessage });
			return false;
		}
	},

	clearError: () => set({ error: null }),
}));
