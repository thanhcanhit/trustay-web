import { create } from 'zustand';

export type NotificationItem = { id?: string; type: string; data: any; receivedAt: number };

type NotificationState = {
	items: NotificationItem[];
	unread: number;
	addNotification: (n: { type: string; data: any }) => void;
	markAllAsRead: () => void;
};

export const useNotificationStore = create<NotificationState>((set) => ({
	items: [],
	unread: 0,
	addNotification: (n) =>
		set((s) => ({ items: [{ ...n, receivedAt: Date.now() }, ...s.items], unread: s.unread + 1 })),
	markAllAsRead: () => set((s) => ({ ...s, unread: 0 })),
}));
