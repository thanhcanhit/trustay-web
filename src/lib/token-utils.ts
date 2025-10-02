// Simple token utilities for client-side
export const TokenUtils = {
	getAccessToken: (): string | null => {
		if (typeof window === 'undefined') return null;
		return localStorage.getItem('accessToken');
	},

	clearTokens: (): void => {
		if (typeof window === 'undefined') return;
		localStorage.removeItem('accessToken');
		localStorage.removeItem('refreshToken');
	},
};
