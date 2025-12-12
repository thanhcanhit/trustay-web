import { create } from 'zustand';

interface ChatBubbleState {
	isOpen: boolean;
	selectedConversationId: string | null;
	openChat: (conversationId?: string) => void;
	closeChat: () => void;
	toggleChat: () => void;
}

export const useChatBubbleStore = create<ChatBubbleState>((set) => ({
	isOpen: false,
	selectedConversationId: null,
	openChat: (conversationId) =>
		set({
			isOpen: true,
			selectedConversationId: conversationId || null,
		}),
	closeChat: () =>
		set({
			isOpen: false,
			selectedConversationId: null,
		}),
	toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
}));
