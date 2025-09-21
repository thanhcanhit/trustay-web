import type { Socket } from 'socket.io-client';
import type { MessageData } from '@/actions/chat.action';
import { useChatStore } from '@/stores/chat.store';
import { REALTIME_EVENT } from '../socket';

export function chatHandler(socket: Socket) {
	const addIncoming = useChatStore.getState().addIncoming;
	const onChat = (payload: MessageData) => addIncoming(payload);
	socket.on(REALTIME_EVENT.CHAT_MESSAGE, onChat);
	return () => socket.off(REALTIME_EVENT.CHAT_MESSAGE, onChat);
}
