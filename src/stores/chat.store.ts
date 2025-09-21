import { create } from 'zustand';
import {
	ConversationData,
	getConversations,
	getMessages,
	MessageData,
	sendMessage,
} from '../actions/chat.action';

export type ChatMessage = MessageData;

type ChatState = {
	byConversation: Record<string, ChatMessage[]>;
	conversations: Record<string, ConversationData>;
	currentUserId?: string;
	currentConversationId: string | null;
	getCurrentUserId: () => string | undefined;
	setCurrentUserId: (userId: string) => void;
	setCurrentConversationId: (conversationId: string | null) => void;
	getMessages: (conversationId: string) => ChatMessage[];
	getConversation: (conversationId: string) => ConversationData | null;
	addIncoming: (payload: ChatMessage) => void;
	loadConversations: () => Promise<void>;
	loadMessages: (conversationId: string) => Promise<void>;
	sendMessage: (payload: {
		recipientId?: string;
		conversationId?: string;
		content: string;
		type: string;
		attachmentUrls?: string[];
	}) => Promise<void>;
};

export const useChatStore = create<ChatState>((set, get) => ({
	byConversation: {},
	conversations: {},
	currentUserId: undefined,
	currentConversationId: null,
	getCurrentUserId: () => get().currentUserId,
	setCurrentUserId: (userId) => set({ currentUserId: userId }),
	setCurrentConversationId: (conversationId) => {
		set({ currentConversationId: conversationId });
		if (conversationId) {
			get().loadMessages(conversationId);
		}
	},
	getMessages: (conversationId) => {
		return get().byConversation[conversationId] ?? [];
	},
	getConversation: (conversationId) => {
		return get().conversations[conversationId] ?? null;
	},
	loadConversations: async () => {
		try {
			const conversationList = await getConversations();
			const conversationsObj = conversationList.reduce(
				(acc, conv) => {
					acc[conv.conversationId] = conv;
					return acc;
				},
				{} as Record<string, ConversationData>,
			);
			set({ conversations: conversationsObj });
		} catch (error) {
			console.error('Failed to load conversations:', error);
		}
	},
	loadMessages: async (conversationId: string) => {
		try {
			console.log('Store: Loading messages for conversation:', conversationId);
			const messages = await getMessages(conversationId);
			console.log('Store: Received messages:', messages);
			set((state) => ({
				byConversation: {
					...state.byConversation,
					[conversationId]: messages.reverse(),
				},
			}));
			console.log('Store: Messages stored successfully');
		} catch (error) {
			console.error('Failed to load messages:', error);
		}
	},
	addIncoming: (p) =>
		set((s) => {
			if (!p || !p.conversationId) {
				console.error('Invalid message data for addIncoming:', p);
				return s;
			}
			const list = s.byConversation[p.conversationId] ?? [];
			// Check if message already exists to prevent duplicates
			const messageExists = list.some((msg) => msg.id === p.id);
			if (messageExists) {
				console.log('Message already exists, skipping duplicate:', p.id);
				return s;
			}
			return { byConversation: { ...s.byConversation, [p.conversationId]: [...list, p] } };
		}),
	sendMessage: async (payload) => {
		const state = get();
		if (!state.currentUserId) throw new Error('No current user set');

		const sentMessage = await sendMessage(payload);

		// Handle both possible response structures
		const messageData = sentMessage?.data || sentMessage;

		if (messageData?.conversationId) {
			state.addIncoming(messageData);
		} else {
			console.error('Invalid message data received:', sentMessage);
			throw new Error('Invalid message response from server');
		}
	},
}));
