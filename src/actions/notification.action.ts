'use server';

import { cookies } from 'next/headers';
import { createServerApiCall } from '../lib/api-client';

const getTokenFromCookies = async (): Promise<string | null> => {
	const cookieStore = await cookies();
	const token = cookieStore.get('accessToken')?.value || null;
	return token;
};

const apiCall = createServerApiCall(getTokenFromCookies);

import type { NotificationData as StoreNotificationData } from '../stores/notification.store';

export type NotificationData = Omit<StoreNotificationData, 'receivedAt'>;

export interface NotificationListResponse {
	data: NotificationData[];
	page?: number;
	limit?: number;
	total?: number;
}

export interface NotificationCountResponse {
	data: {
		count: number;
	};
	unreadCount?: number;
}

export interface GetNotificationsParams {
	page?: number;
	limit?: number;
	isRead?: boolean;
	notificationType?: string;
}

export async function getNotifications(
	params: GetNotificationsParams = {},
): Promise<NotificationListResponse> {
	const queryParams = new URLSearchParams();
	if (params.page) queryParams.set('page', params.page.toString());
	if (params.limit) queryParams.set('limit', params.limit.toString());
	if (params.isRead !== undefined) queryParams.set('isRead', params.isRead.toString());
	if (params.notificationType) queryParams.set('notificationType', params.notificationType);

	const url = `/api/notifications${queryParams.toString() ? `?${queryParams}` : ''}`;

	return await apiCall<NotificationListResponse>(url, {
		method: 'GET',
	});
}

export async function getUnreadNotificationCount(): Promise<NotificationCountResponse> {
	return await apiCall<NotificationCountResponse>('/api/notifications/count', {
		method: 'GET',
	});
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
	await apiCall<void>(`/api/notifications/${notificationId}/read`, {
		method: 'PATCH',
	});
}

export async function markAllNotificationsAsRead(): Promise<void> {
	await apiCall<void>('/api/notifications/mark-all-read', {
		method: 'PATCH',
	});
}

export async function deleteNotification(notificationId: string): Promise<void> {
	await apiCall<void>(`/api/notifications/${notificationId}`, {
		method: 'DELETE',
	});
}

export interface CreateNotificationData {
	userId: string;
	type: string;
	title: string;
	message: string;
	data?: Record<string, unknown>;
}

export async function createNotification(
	notificationData: CreateNotificationData,
): Promise<NotificationData> {
	const result = await apiCall<{ data: NotificationData }>('/api/notifications', {
		method: 'POST',
		data: notificationData,
	});
	return result.data;
}
