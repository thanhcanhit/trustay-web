import type { Socket } from 'socket.io-client';
import type { MessageData } from '@/actions/chat.action';
import { useChatStore } from '@/stores/chat.store';
import { REALTIME_EVENT } from '../socket';

export function chatHandler(socket: Socket) {
	const addIncoming = useChatStore.getState().addIncoming;
	const getConversation = useChatStore.getState().getConversation;
	const loadConversations = useChatStore.getState().loadConversations;

	const onChat = (payload: MessageData) => {
		console.log('[CHAT_HANDLER] Received message:', payload);
		addIncoming(payload);

		// Only reload conversations if the conversation doesn't exist yet
		const conversation = getConversation(payload.conversationId);
		if (!conversation) {
			console.log('[CHAT_HANDLER] Conversation not found, reloading conversations');
			loadConversations();
		}
	};

	socket.on(REALTIME_EVENT.CHAT_MESSAGE, onChat);
	return () => socket.off(REALTIME_EVENT.CHAT_MESSAGE, onChat);
}
