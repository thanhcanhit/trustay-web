import { create } from 'zustand';
import { clearAIHistory, getAIHistory, postAIChat } from '@/actions/ai.action';
import { TokenManager } from '@/lib/api-client';
import type { AIHistoryMessage, AIStateSnapshot } from '@/types';

type AIActions = {
	toggleSidebar: (open?: boolean) => void;
	loadHistory: () => Promise<void>;
	clearHistory: () => Promise<void>;
	sendPrompt: (content: string) => Promise<void>;
	setError: (message: string | null) => void;
};

export const useAIAssistantStore = create<AIStateSnapshot & AIActions>((set, get) => ({
	isSidebarOpen: false,
	isLoading: false,
	error: null,
	sessionId: undefined,
	messages: [],

	toggleSidebar: (open) =>
		set((s) => ({ isSidebarOpen: typeof open === 'boolean' ? open : !s.isSidebarOpen })),

	setError: (message) => set({ error: message ?? null }),

	loadHistory: async () => {
		try {
			set({ isLoading: true, error: null });
			const token = TokenManager.getAccessToken();
			const history = await getAIHistory(token);
			set({
				isLoading: false,
				sessionId: history.sessionId,
				messages: Array.isArray(history.messages) ? history.messages : [],
			});
		} catch (e) {
			console.error('[AI] loadHistory failed', e);
			set({ isLoading: false, error: (e as Error).message });
		}
	},

	clearHistory: async () => {
		try {
			set({ isLoading: true, error: null });
			const token = TokenManager.getAccessToken();
			await clearAIHistory(token);
			set({ isLoading: false, messages: [] });
		} catch (e) {
			console.error('[AI] clearHistory failed', e);
			set({ isLoading: false, error: (e as Error).message });
		}
	},

	sendPrompt: async (content: string) => {
		// Optimistically append user message
		const userMsg: AIHistoryMessage = {
			id: `local_${Date.now()}`,
			role: 'user',
			content,
			timestamp: new Date().toISOString(),
		};
		set((s) => ({ messages: [...(s.messages ?? []), userMsg] }));

		try {
			const token = TokenManager.getAccessToken();
			const res = await postAIChat(content, token);
			// Append assistant message with possible SQL/results
			const assistantMsg: AIHistoryMessage & {
				sql?: string;
				results?: Array<Record<string, unknown>>;
				count?: number;
			} = {
				id: `assistant_${Date.now()}`,
				role: 'assistant',
				content: res.message,
				timestamp: res.timestamp,
				sql: res.sql,
				results: res.results,
				count: res.count,
			};
			set((s) => ({ sessionId: res.sessionId, messages: [...(s.messages ?? []), assistantMsg] }));
		} catch (e) {
			console.error('[AI] sendPrompt failed', e);
			set({ error: (e as Error).message });
		}
	},
}));
