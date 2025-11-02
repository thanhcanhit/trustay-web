/**
 * Utility functions for formatting data
 */

export const formatCurrency = (amount: number, currency: string = 'VND'): string => {
	return new Intl.NumberFormat('vi-VN', {
		style: 'currency',
		currency: currency,
	}).format(amount);
};

export const formatDate = (date: string | Date, format: 'short' | 'long' = 'short'): string => {
	const d = typeof date === 'string' ? new Date(date) : date;

	if (format === 'long') {
		return new Intl.DateTimeFormat('vi-VN', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		}).format(d);
	}

	return new Intl.DateTimeFormat('vi-VN', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
	}).format(d);
};

export const formatNumber = (num: number): string => {
	return new Intl.NumberFormat('vi-VN').format(num);
};

export const formatFileSize = (bytes: number): string => {
	if (bytes === 0) return '0 Bytes';
	const k = 1024;
	const sizes = ['Bytes', 'KB', 'MB', 'GB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return Math.round((bytes / k ** i) * 100) / 100 + ' ' + sizes[i];
};

export const formatPhoneNumber = (phone: string): string => {
	// Format: 0xxx xxx xxx
	return phone.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
};

export const formatPercentage = (value: number, decimals: number = 1): string => {
	return `${value.toFixed(decimals)}%`;
};
