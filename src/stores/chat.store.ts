import { create } from 'zustand';
import {
	ConversationData,
	getConversations,
	getMessages,
	MessageData,
	markAllMessagesAsRead,
	sendMessage,
	uploadChatAttachments,
} from '../actions/chat.action';
import { TokenManager } from '../lib/api-client';

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
		attachmentFiles?: File[];
	}) => Promise<void>;
	markAllRead: (conversationId: string) => Promise<void>;
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
			const token = TokenManager.getAccessToken();
			const conversationList = await getConversations(token);
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
			const token = TokenManager.getAccessToken();
			const messages = await getMessages(conversationId, {}, token);
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

		const token = TokenManager.getAccessToken();
		console.log('[ChatStore] Sending message:', payload);

		// Upload attachments if provided
		let attachmentUrls = payload.attachmentUrls || [];
		if (payload.attachmentFiles && payload.attachmentFiles.length > 0) {
			console.log('[ChatStore] Uploading attachments:', payload.attachmentFiles.length);
			try {
				const uploadedUrls = await uploadChatAttachments(payload.attachmentFiles);
				console.log('[ChatStore] Uploaded URLs:', uploadedUrls);
				attachmentUrls = [...attachmentUrls, ...uploadedUrls];
			} catch (error) {
				console.error('[ChatStore] Failed to upload attachments:', error);
				throw new Error('Không thể upload file đính kèm');
			}
		}

		// Send message with attachment URLs
		const messagePayload = {
			recipientId: payload.recipientId,
			conversationId: payload.conversationId,
			content: payload.content,
			type: payload.type,
			attachmentUrls,
		};
		console.log('[ChatStore] Sending message to API:', messagePayload);
		const sentMessage = await sendMessage(messagePayload, token);

		console.log('[ChatStore] Received response:', sentMessage);

		// Handle both possible response structures
		const messageData = sentMessage?.data || sentMessage;

		if (messageData?.conversationId) {
			console.log('[ChatStore] Adding message to store:', messageData);
			console.log('[ChatStore] Message attachments:', messageData.attachments);
			state.addIncoming(messageData);
		} else {
			console.error('[ChatStore] Invalid message data received:', sentMessage);
			throw new Error('Invalid message response from server');
		}
	},
	markAllRead: async (conversationId: string) => {
		try {
			const token = TokenManager.getAccessToken();
			await markAllMessagesAsRead(conversationId, token);
			set((state) => ({
				conversations: {
					...state.conversations,
					[conversationId]: {
						...state.conversations[conversationId],
						unreadCount: 0,
					},
				},
			}));
		} catch (error) {
			console.error('Failed to mark all messages as read:', error);
		}
	},
}));
