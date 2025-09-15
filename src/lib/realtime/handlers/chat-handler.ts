import type { Socket } from 'socket.io-client';
import { useChatStore } from '@/stores/chat.store';
import { REALTIME_EVENT } from '../socket';

export type ChatMessagePayload<TMessage = unknown> = {
	fromUserId: string;
	toUserId: string;
	conversationId: string;
	message: TMessage;
	messageId?: string;
	sentAt?: string;
};

export function chatHandler(socket: Socket) {
	const addIncoming = useChatStore.getState().addIncoming;
	const onChat = (payload: ChatMessagePayload<any>) => addIncoming(payload);
	socket.on(REALTIME_EVENT.CHAT_MESSAGE, onChat);
	return () => socket.off(REALTIME_EVENT.CHAT_MESSAGE, onChat);
}
