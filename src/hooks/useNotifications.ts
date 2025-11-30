'use client';

import { useCallback, useEffect } from 'react';
import {
	deleteNotification as deleteNotificationAPI,
	type GetNotificationsParams,
	getNotifications,
	getUnreadNotificationCount,
	markAllNotificationsAsRead as markAllAsReadAPI,
	markNotificationAsRead as markAsReadAPI,
} from '@/actions/notification.action';
import { TokenManager } from '@/lib/api-client';
import { useNotificationStore } from '@/stores/notification.store';
import { useUserStore } from '@/stores/userStore';

export function useNotifications() {
	const {
		items,
		unread,
		isLoading,
		error,
		setNotifications,
		setUnreadCount,
		setLoading,
		setError,
		setCurrentUserId,
		markAllAsRead: markAllAsReadStore,
		markAsRead: markAsReadStore,
		removeNotification,
	} = useNotificationStore();

	const { user, isAuthenticated } = useUserStore();

	// Set current user ID in store when user changes
	useEffect(() => {
		if (user?.id) {
			setCurrentUserId(user.id);
		}
	}, [user?.id, setCurrentUserId]);

	const loadNotifications = useCallback(
		async (params: GetNotificationsParams = {}, retryCount = 0) => {
			if (!isAuthenticated || !user) return;

			try {
				setLoading(true);
				setError(null);

				const token = TokenManager.getAccessToken();
				const response = await getNotifications(params, token ?? undefined);
				if (response?.data && Array.isArray(response.data)) {
					// Map notificationType to type for consistency
					const mappedData = response.data.map((notif: any) => ({
						...notif,
						type: notif.notificationType || notif.type,
					}));

					// Filter notifications to only include ones belonging to current user
					const userNotifications = mappedData.filter(
						(notification) => notification.userId === user?.id,
					);

					console.log(
						'Loaded notifications - Total:',
						response.data.length,
						'User notifications:',
						userNotifications.length,
					);
					setNotifications(userNotifications, user?.id);
				} else {
					console.warn('Invalid response format for notifications:', response);
					setNotifications([], user?.id);
				}
			} catch (err) {
				console.error('Failed to load notifications:', err);
				const errorMessage = err instanceof Error ? err.message : 'Failed to load notifications';

				// Retry logic for network errors
				if (
					retryCount < 2 &&
					(errorMessage.includes('fetch') || errorMessage.includes('network'))
				) {
					console.log(`Retrying notification load... (${retryCount + 1}/3)`);
					setTimeout(
						() => {
							loadNotifications(params, retryCount + 1);
						},
						1000 * (retryCount + 1),
					); // Exponential backoff
					return;
				}

				setError(errorMessage);
			} finally {
				setLoading(false);
			}
		},
		[isAuthenticated, user, setNotifications, setLoading, setError],
	);

	const loadUnreadCount = useCallback(async () => {
		if (!isAuthenticated || !user) return;

		try {
			const response = await getUnreadNotificationCount();
			console.log('Unread count API response:', response);

			// Handle both response formats
			let count = 0;
			if (response && typeof response.unreadCount === 'number') {
				count = response.unreadCount;
			} else if (response?.data && typeof response.data.count === 'number') {
				count = response.data.count;
			} else {
				console.warn('Invalid response format for unread count:', response);
			}

			console.log('Setting unread count from API:', count);
			setUnreadCount(count);
		} catch (err) {
			console.error('Failed to load unread count:', err);
		}
	}, [isAuthenticated, user, setUnreadCount]);

	const markAllAsRead = useCallback(async () => {
		if (!isAuthenticated || !user) return;

		try {
			// Optimistically update UI first
			markAllAsReadStore();
			setUnreadCount(0);

			// Then sync with server
			const token = TokenManager.getAccessToken();
			await markAllAsReadAPI(token ?? undefined);
		} catch (err) {
			console.error('Failed to mark all as read:', err);
			setError(err instanceof Error ? err.message : 'Failed to mark all as read');

			// Reload notifications to revert optimistic update if failed
			loadNotifications();
			loadUnreadCount();
		}
	}, [
		isAuthenticated,
		user,
		markAllAsReadStore,
		setUnreadCount,
		setError,
		loadNotifications,
		loadUnreadCount,
	]);

	const markAsRead = useCallback(
		async (notificationId: string) => {
			if (!isAuthenticated || !user) return;

			// Find the notification to validate ownership
			const notification = items.find((item) => item.id === notificationId);
			if (!notification) {
				console.warn('Notification not found:', notificationId);
				return;
			}

			// Check if notification belongs to current user
			if (notification.userId !== user.id) {
				console.warn('Cannot mark notification as read - not owned by current user:', {
					notificationId,
					notificationUserId: notification.userId,
					currentUserId: user.id,
				});
				setError('Bạn chỉ có thể đánh dấu thông báo của mình');
				return;
			}

			try {
				// Optimistically update UI first
				markAsReadStore(notificationId);

				// Then sync with server
				const token = TokenManager.getAccessToken();
				await markAsReadAPI(notificationId, token ?? undefined);
			} catch (err) {
				console.error('Failed to mark as read:', err);
				setError(err instanceof Error ? err.message : 'Failed to mark as read');

				// Reload notifications to revert optimistic update if failed
				loadNotifications();
			}
		},
		[isAuthenticated, user, items, markAsReadStore, setError, loadNotifications],
	);

	const deleteNotification = useCallback(
		async (notificationId: string) => {
			if (!isAuthenticated || !user) return;

			// Find the notification to validate ownership
			const notification = items.find((item) => item.id === notificationId);
			if (!notification) {
				console.warn('Notification not found:', notificationId);
				return;
			}

			// Check if notification belongs to current user
			if (notification.userId !== user.id) {
				console.warn('Cannot delete notification - not owned by current user:', {
					notificationId,
					notificationUserId: notification.userId,
					currentUserId: user.id,
				});
				setError('Bạn chỉ có thể xóa thông báo của mình');
				return;
			}

			try {
				const token = TokenManager.getAccessToken();
				await deleteNotificationAPI(notificationId, token ?? undefined);
				removeNotification(notificationId);
			} catch (err) {
				console.error('Failed to delete notification:', err);
				setError(err instanceof Error ? err.message : 'Failed to delete notification');
			}
		},
		[isAuthenticated, user, items, removeNotification, setError],
	);

	const refresh = useCallback(() => {
		// Only refresh notifications, let unread count be calculated from the notifications
		loadNotifications();
	}, [loadNotifications]);

	// Initial load - only load notifications, let setNotifications calculate unread count
	useEffect(() => {
		if (isAuthenticated && user) {
			console.log('Loading initial notifications for user:', user.id);
			loadNotifications();
			// Don't load unread count separately - let it be calculated from notifications
		}
	}, [isAuthenticated, user, loadNotifications]);

	// Debug unread count changes
	useEffect(() => {
		console.log('Unread count changed:', unread);
	}, [unread]);

	return {
		notifications: items,
		unread,
		isLoading,
		error,
		loadNotifications,
		loadUnreadCount,
		markAllAsRead,
		markAsRead,
		deleteNotification,
		refresh,
	};
}
