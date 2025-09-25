import { useEffect, useRef } from 'react';
import { chatHandler } from '@/lib/realtime/handlers/chat-handler';
import { notificationHandler } from '@/lib/realtime/handlers/notification-handler';
import { forceReconnect, isSocketHealthy, mountHandlers } from '@/lib/realtime/socket';

export function useRealtime(userId: string) {
	const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		if (!userId) return;

		const dispose = mountHandlers(userId, [notificationHandler, chatHandler]);

		// Set up periodic connection check
		const checkConnection = () => {
			// Clear any existing timeout
			if (reconnectTimeoutRef.current) {
				clearTimeout(reconnectTimeoutRef.current);
			}

			// Check connection every 30 seconds
			reconnectTimeoutRef.current = setTimeout(() => {
				if (!isSocketHealthy()) {
					console.log('🔄 [REALTIME] Connection unhealthy, attempting reconnect...');
					try {
						forceReconnect(userId);
						// Re-mount handlers after reconnection
						dispose();
						const newDispose = mountHandlers(userId, [notificationHandler, chatHandler]);
						checkConnection(); // Schedule next check
						return newDispose;
					} catch (error) {
						console.error('🔄 [REALTIME] Failed to re-establish connection:', error);
					}
				}
				checkConnection(); // Schedule next check
			}, 30000);
		};

		checkConnection();

		return () => {
			if (reconnectTimeoutRef.current) {
				clearTimeout(reconnectTimeoutRef.current);
			}
			dispose();
		};
	}, [userId]);
}
