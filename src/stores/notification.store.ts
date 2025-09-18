import { create } from 'zustand';

export interface NotificationData {
	id: string;
	type: string;
	title: string;
	message: string;
	data?: Record<string, unknown>;
	userId: string;
	isRead: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface NotificationItem extends NotificationData {
	receivedAt: number;
}

interface NotificationState {
	items: NotificationItem[];
	unread: number;
	isLoading: boolean;
	error: string | null;
	currentUserId: string | null;

	// Actions for API data
	setNotifications: (notifications: NotificationData[], userId?: string) => void;
	setUnreadCount: (count: number) => void;
	setLoading: (loading: boolean) => void;
	setError: (error: string | null) => void;
	setCurrentUserId: (userId: string | null) => void;

	// Actions for realtime updates
	addNotification: (notification: NotificationData, currentUserId?: string) => void;
	markAllAsRead: () => void;
	markAsRead: (notificationId: string) => void;
	removeNotification: (notificationId: string) => void;

	// Getters
	getUserNotifications: (userId?: string) => NotificationItem[];
	getUserUnreadCount: (userId?: string) => number;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
	items: [],
	unread: 0,
	isLoading: false,
	error: null,
	currentUserId: null,

	setNotifications: (notifications, userId) => {
		const processedNotifications = notifications.map((notif) => ({
			...notif,
			receivedAt: new Date(notif.createdAt).getTime(),
		}));

		// Set current user ID if provided
		if (userId) {
			set({ currentUserId: userId });
		}

		// Always filter notifications for current user only if userId is provided
		const userNotifications = userId
			? processedNotifications.filter((n) => n.userId === userId)
			: processedNotifications;

		// Log any notifications that were filtered out for debugging
		if (userId && processedNotifications.length !== userNotifications.length) {
			const filteredOut = processedNotifications.length - userNotifications.length;
			console.log(`Filtered out ${filteredOut} notifications not belonging to user ${userId}`);
		}

		const unreadCount = userNotifications.filter((n) => !n.isRead).length;
		console.log(
			'Setting notifications in store for user:',
			userId,
			'count:',
			userNotifications.length,
			'unread:',
			unreadCount,
		);

		set({
			items: userNotifications,
			unread: unreadCount,
		});
	},

	setUnreadCount: (count) => {
		console.log('Setting unread count in store:', count);
		set({ unread: count });
	},

	setLoading: (loading) => set({ isLoading: loading }),

	setError: (error) => set({ error }),

	setCurrentUserId: (userId) => set({ currentUserId: userId }),

	addNotification: (notification, currentUserId) => {
		const state = get();
		const targetUserId = currentUserId || state.currentUserId;

		console.log('💾 [STORE] addNotification called:', {
			notification,
			currentUserId,
			targetUserId,
			notificationUserId: notification.userId,
		});

		// Only add notification if it belongs to current user
		if (targetUserId && notification.userId !== targetUserId) {
			console.log(
				'⚠️ [STORE] Ignoring notification for different user:',
				notification.userId,
				'current:',
				targetUserId,
			);
			return;
		}

		// If no targetUserId but notification has userId, still add it
		// This handles cases where user hasn't been set in store yet
		if (!targetUserId && notification.userId) {
			console.log(
				'💾 [STORE] Adding notification without current user context:',
				notification.userId,
			);
		}

		const newNotification = {
			...notification,
			receivedAt: Date.now(),
		};

		set((state) => {
			const existingIndex = state.items.findIndex((item) => item.id === notification.id);
			let newItems: NotificationItem[];

			if (existingIndex >= 0) {
				// Update existing notification
				newItems = [...state.items];
				newItems[existingIndex] = newNotification;
				console.log('💾 [STORE] Updated existing notification:', notification.id);
			} else {
				// Add new notification
				newItems = [newNotification, ...state.items];
				console.log(
					'💾 [STORE] Added new notification:',
					notification.id,
					'Total notifications:',
					newItems.length,
				);
			}

			const unreadCount = newItems.filter((n) => !n.isRead).length;
			console.log('💾 [STORE] Unread count updated:', unreadCount);

			return {
				items: newItems,
				unread: unreadCount,
			};
		});
	},

	markAllAsRead: () => {
		set((state) => {
			const updatedItems = state.items.map((item) => ({ ...item, isRead: true }));
			return {
				items: updatedItems,
				unread: 0,
			};
		});
	},

	markAsRead: (notificationId) => {
		set((state) => {
			const updatedItems = state.items.map((item) =>
				item.id === notificationId ? { ...item, isRead: true } : item,
			);
			const unreadCount = updatedItems.filter((n) => !n.isRead).length;

			return {
				items: updatedItems,
				unread: unreadCount,
			};
		});
	},

	removeNotification: (notificationId) => {
		set((state) => {
			const updatedItems = state.items.filter((item) => item.id !== notificationId);
			const unreadCount = updatedItems.filter((n) => !n.isRead).length;

			return {
				items: updatedItems,
				unread: unreadCount,
			};
		});
	},

	getUserNotifications: (userId) => {
		const state = get();
		const targetUserId = userId || state.currentUserId;
		if (!targetUserId) return state.items;

		return state.items.filter((item) => item.userId === targetUserId);
	},

	getUserUnreadCount: (userId) => {
		const state = get();
		const targetUserId = userId || state.currentUserId;
		if (!targetUserId) return state.unread;

		return state.items.filter((item) => item.userId === targetUserId && !item.isRead).length;
	},
}));
