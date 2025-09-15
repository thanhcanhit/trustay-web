import type { Socket } from 'socket.io-client';
import { useNotificationStore } from '@/stores/notification.store';
import { REALTIME_EVENT } from '../socket';

export type NotifyEnvelope<T = unknown> = { type: string; data: T };

export function notificationHandler(socket: Socket) {
	const addNotification = useNotificationStore.getState().addNotification;
	const onNotify = (payload: NotifyEnvelope<any>) => addNotification(payload);
	socket.on(REALTIME_EVENT.NOTIFY, onNotify);
	return () => socket.off(REALTIME_EVENT.NOTIFY, onNotify);
}
