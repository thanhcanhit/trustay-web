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
	addIncoming: (payload: {
		conversationId: string;
		messageId?: string;
		fromUserId: string;
		toUserId: string;
		message: any;
		sentAt?: string;
	}) => void;
};

export const useChatStore = create<ChatState>((set) => ({
	byConversation: {},
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
}));
