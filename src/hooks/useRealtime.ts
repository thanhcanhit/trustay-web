import { useEffect } from 'react';
import { chatHandler } from '@/lib/realtime/handlers/chat-handler';
import { notificationHandler } from '@/lib/realtime/handlers/notification-handler';
import { mountHandlers } from '@/lib/realtime/socket';

export function useRealtime(userId: string) {
	useEffect(() => {
		if (!userId) return;
		const dispose = mountHandlers(userId, [notificationHandler, chatHandler]);
		return () => dispose();
	}, [userId]);
}
