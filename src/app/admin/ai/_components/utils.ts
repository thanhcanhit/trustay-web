'use client';

export const formatDateTime = (value?: string | null): string => {
	if (!value) return '-';
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return '-';
	return date.toLocaleString('vi-VN');
};

export const formatDuration = (ms?: number): string => {
	if (ms === undefined || ms === null) return '-';
	if (ms < 1000) return `${ms} ms`;
	return `${(ms / 1000).toFixed(2)} s`;
};
