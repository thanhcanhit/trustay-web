import { create } from 'zustand';

export type ChatMessage = {
	conversationId: string;
	messageId?: string;
	fromUserId: string;
	toUserId: string;
	content?: unknown;
	sentAt?: string;
};

type ChatState = {
	byConversation: Record<string, ChatMessage[]>;
	currentUserId?: string;
	getCurrentUserId: () => string | undefined;
	setCurrentUserId: (userId: string) => void;
	getMessages: (conversationId: string) => ChatMessage[];
	addIncoming: (payload: {
		conversationId: string;
		messageId?: string;
		fromUserId: string;
		toUserId: string;
		message: string;
		sentAt?: string;
	}) => void;
	sendMessage: (conversationId: string, toUserId: string, message: string) => Promise<void>;
};

export const useChatStore = create<ChatState>((set, get) => ({
	byConversation: {},
	currentUserId: undefined,
	getCurrentUserId: () => get().currentUserId,
	setCurrentUserId: (userId) => set({ currentUserId: userId }),
	getMessages: (conversationId) => {
		return get().byConversation[conversationId] ?? [];
	},
	addIncoming: (p) =>
		set((s) => {
			const list = s.byConversation[p.conversationId] ?? [];
			const next: ChatMessage = {
				conversationId: p.conversationId,
				messageId: p.messageId,
				fromUserId: p.fromUserId,
				toUserId: p.toUserId,
				content: p.message,
				sentAt: p.sentAt,
			};
			return { byConversation: { ...s.byConversation, [p.conversationId]: [next, ...list] } };
		}),
	sendMessage: async (conversationId, toUserId, message) => {
		const state = get();
		if (!state.currentUserId) throw new Error('No current user set');

		// TODO: Implement actual message sending through API
		const now = new Date().toISOString();
		state.addIncoming({
			conversationId,
			fromUserId: state.currentUserId,
			toUserId,
			message,
			sentAt: now,
		});
	},
}));
