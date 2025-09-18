import type { Socket } from 'socket.io-client';
import { type NotificationData, useNotificationStore } from '@/stores/notification.store';
import { REALTIME_EVENT } from '../socket';

export interface NotificationPayload extends Record<string, unknown> {
	title?: string;
	message?: string;
	userId?: string;
	type?: string;
}

export type NotifyEnvelope<T = NotificationPayload> = {
	type: string;
	data: T;
	notification?: NotificationData;
};

export function notificationHandler(socket: Socket, userId?: string) {
	const { addNotification, setCurrentUserId } = useNotificationStore.getState();

	// Set current user ID in store
	if (userId) {
		setCurrentUserId(userId);
	}

	const onNotify = (payload: NotifyEnvelope) => {
		console.log('🔔 [SOCKET] Received notification via socket:', {
			payload,
			currentUserId: userId,
			payloadUserId: payload.notification?.userId || payload.data?.userId,
		});

		// If payload contains a full notification object, use it
		if (payload.notification) {
			console.log('🔔 [SOCKET] Using full notification object:', payload.notification);
			// Ensure the notification belongs to current user
			if (payload.notification.userId === userId) {
				addNotification(payload.notification, userId);
			} else {
				console.log(
					'🔔 [SOCKET] Ignoring notification for different user:',
					payload.notification.userId,
					'vs',
					userId,
				);
			}
		} else {
			console.log('🔔 [SOCKET] Creating notification from payload data');
			// Otherwise create a notification from the payload
			// The notification should belong to the current connected user (userId)
			const notification: NotificationData = {
				id: crypto.randomUUID(),
				type: payload.type || 'general',
				title: payload.data?.title || 'Thông báo mới',
				message: payload.data?.message || '',
				data: payload.data || {},
				userId: userId || '', // Always use current connected user ID
				isRead: false,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};
			console.log('🔔 [SOCKET] Created notification for current user:', notification);
			addNotification(notification, userId);
		}
	};

	socket.on(REALTIME_EVENT.NOTIFY, onNotify);
	return () => socket.off(REALTIME_EVENT.NOTIFY, onNotify);
}
