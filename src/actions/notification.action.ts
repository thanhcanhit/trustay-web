'use server';

import { createServerApiCall } from '../lib/api-client';

const apiCall = createServerApiCall();

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
	token?: string,
): Promise<NotificationListResponse> {
	const queryParams = new URLSearchParams();
	if (params.page) queryParams.set('page', params.page.toString());
	if (params.limit) queryParams.set('limit', params.limit.toString());
	if (params.isRead !== undefined) queryParams.set('isRead', params.isRead.toString());
	if (params.notificationType) queryParams.set('notificationType', params.notificationType);

	const url = `/api/notifications${queryParams.toString() ? `?${queryParams}` : ''}`;

	return await apiCall<NotificationListResponse>(
		url,
		{
			method: 'GET',
		},
		token,
	);
}

export async function getUnreadNotificationCount(
	token?: string,
): Promise<NotificationCountResponse> {
	return await apiCall<NotificationCountResponse>(
		'/api/notifications/count',
		{
			method: 'GET',
		},
		token,
	);
}

export async function markNotificationAsRead(
	notificationId: string,
	token?: string,
): Promise<void> {
	await apiCall<void>(
		`/api/notifications/${notificationId}/read`,
		{
			method: 'PATCH',
		},
		token,
	);
}

export async function markAllNotificationsAsRead(token?: string): Promise<void> {
	await apiCall<void>(
		'/api/notifications/mark-all-read',
		{
			method: 'PATCH',
		},
		token,
	);
}

export async function deleteNotification(notificationId: string, token?: string): Promise<void> {
	await apiCall<void>(
		`/api/notifications/${notificationId}`,
		{
			method: 'DELETE',
		},
		token,
	);
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
	token?: string,
): Promise<NotificationData> {
	const result = await apiCall<{ data: NotificationData }>(
		'/api/notifications',
		{
			method: 'POST',
			data: notificationData,
		},
		token,
	);
	return result.data;
}
