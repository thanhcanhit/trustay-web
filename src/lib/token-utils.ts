// Simple token utilities for client-side
export const TokenUtils = {
	getAccessToken: (): string | null => {
		if (typeof document === 'undefined') return null;

		// Try to read from cookies first
		const cookies = document.cookie.split(';');
		const accessTokenCookie = cookies.find((cookie) => cookie.trim().startsWith('accessToken='));

		if (accessTokenCookie) {
			return accessTokenCookie.split('=')[1];
		}

		// Fallback to localStorage
		return localStorage.getItem('accessToken');
	},

	clearTokens: (): void => {
		if (typeof window === 'undefined') return;

		// Clear localStorage
		localStorage.removeItem('accessToken');
		localStorage.removeItem('refreshToken');

		// Clear cookies by setting them to expire
		document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
		document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
	},
};
