import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
	createConversation as createConversationAction,
	deleteConversation as deleteConversationAction,
	getConversationMessages,
	listConversations,
	sendConversationMessage,
	updateConversationTitle,
} from '@/actions/conversation.action';
import { TokenManager } from '@/lib/api-client';
import type { ContentPayload, ControlPayload, DataPayload } from '@/types/ai';
import type {
	ChatResponse,
	ChatResponseRawPayload,
	Conversation,
	ConversationMessage,
} from '@/types/conversation';
import { convertChatResponsePayload } from '@/utils/conversation-payload-converter';

interface ConversationState {
	// UI State
	isSidebarOpen: boolean;

	// Data
	conversations: Conversation[];
	currentConversationId: string | null;
	messages: ConversationMessage[];

	// Loading states
	loading: boolean;
	sending: boolean;
	loadingMessages: boolean;

	// Error state
	error: string | null;
}

interface ConversationActions {
	// UI Actions
	toggleSidebar: (open?: boolean) => void;

	// Conversation management
	loadConversations: () => Promise<void>;
	createConversation: (
		initialMessage?: string,
		title?: string,
		currentPage?: string,
	) => Promise<string | null>;
	selectConversation: (conversationId: string) => Promise<void>;
	updateTitle: (conversationId: string, title: string) => Promise<void>;
	deleteConversation: (conversationId: string) => Promise<void>;
	clearMessages: (conversationId: string) => Promise<void>;
	clearCurrentConversation: () => void;

	// Message management
	loadMessages: (conversationId: string) => Promise<void>;
	sendMessage: (message: string, currentPage?: string, images?: string[]) => Promise<void>;

	// Utility
	setError: (error: string | null) => void;
}

type ConversationStore = ConversationState & ConversationActions;

/**
 * Convert ChatResponse to ConversationMessage format
 */
function chatResponseToMessage(
	response: ChatResponse,
	conversationId: string,
	sequenceNumber: number,
): ConversationMessage {
	// Convert raw payload to proper format
	const convertedPayload = convertChatResponsePayload(response.payload);

	const message: ConversationMessage = {
		id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
		sessionId: conversationId,
		role: 'assistant',
		content: response.message,
		sequenceNumber,
		createdAt: response.timestamp,
		metadata: {
			kind: response.kind,
			payload: convertedPayload,
			// Extract SQL and other fields from raw payload if available
			sql: response.payload?.sql as string | undefined,
			canonicalQuestion: response.payload?.canonicalQuestion as string | undefined,
		},
	};

	return message;
}

/**
 * Create initial messages from conversation response
 */
function createInitialMessages(
	response: ChatResponse | undefined,
	conversationId: string,
	initialMessage: string,
): ConversationMessage[] {
	if (!response) return [];

	const userMessage: ConversationMessage = {
		id: `msg-user-${Date.now()}`,
		sessionId: conversationId,
		role: 'user',
		content: initialMessage,
		sequenceNumber: 1,
		createdAt: new Date().toISOString(),
		metadata: null,
	};

	const assistantMessage = chatResponseToMessage(response, conversationId, 2);
	return [userMessage, assistantMessage];
}

/**
 * Enrich content payload
 */
function enrichContentPayload(payload: ContentPayload, enriched: EnrichedMessage): void {
	enriched.contentStats = payload.stats;
}

/**
 * Enrich data payload
 */
function enrichDataPayload(payload: DataPayload, enriched: EnrichedMessage): void {
	if (payload.list) enriched.dataList = payload.list;
	if (payload.table) enriched.dataTable = payload.table;
	if (payload.chart) {
		enriched.chart = {
			url: payload.chart.url,
			width: payload.chart.width,
			height: payload.chart.height,
			alt: payload.chart.alt,
		};
	}
}

/**
 * Enrich control payload
 */
function enrichControlPayload(
	payload: ControlPayload,
	mode: string,
	enriched: EnrichedMessage,
): void {
	if (mode === 'CLARIFY') {
		enriched.controlQuestions = payload.questions;
	} else {
		enriched.errorCode = payload.code;
		enriched.errorDetails = payload.details;
	}
}

type EnrichedMessage = ConversationMessage & {
	contentStats?: ReadonlyArray<{ label: string; value: number; unit?: string }>;
	dataList?: { items: ReadonlyArray<import('@/types').ListItem>; total: number };
	dataTable?: {
		columns: ReadonlyArray<import('@/types').TableColumn>;
		rows: ReadonlyArray<Record<string, import('@/types').TableCell>>;
		previewLimit?: number;
	};
	chart?: { url?: string; width: number; height: number; alt?: string };
	controlQuestions?: ReadonlyArray<string>;
	errorCode?: string;
	errorDetails?: string;
	sql?: string;
	results?: Array<Record<string, unknown>>;
	count?: number;
};

/**
 * Enrich message with payload data for UI display
 * biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Necessary enrichment logic
 */
function enrichMessage(message: ConversationMessage): EnrichedMessage {
	if (!message.metadata?.payload) return message;

	const payload = message.metadata.payload;
	const enriched: EnrichedMessage = { ...message };

	// Handle payload by mode
	if ('mode' in payload) {
		const mode = payload.mode;
		switch (mode) {
			case 'CONTENT':
				enrichContentPayload(payload as ContentPayload, enriched);
				break;
			case 'LIST':
			case 'TABLE':
			case 'CHART':
				enrichDataPayload(payload as DataPayload, enriched);
				break;
			case 'CLARIFY':
			case 'ERROR':
				enrichControlPayload(payload as ControlPayload, mode, enriched);
				break;
		}
	}

	// Extract SQL and results from metadata if available
	if (message.metadata?.sql) {
		enriched.sql = message.metadata.sql;
	}

	// Extract results from payload if it's a DataPayload
	if (message.metadata?.payload && 'mode' in message.metadata.payload) {
		const payload = message.metadata.payload;
		if (payload.mode === 'TABLE' || payload.mode === 'LIST' || payload.mode === 'CHART') {
			const dataPayload = payload as DataPayload;
			if (dataPayload.table?.rows) {
				enriched.results = dataPayload.table.rows as Array<Record<string, unknown>>;
				enriched.count = dataPayload.table.rows.length;
			} else if (dataPayload.list) {
				enriched.results = dataPayload.list.items as unknown as Array<Record<string, unknown>>;
				enriched.count = dataPayload.list.total;
			}
		}
	}

	return enriched;
}

export const useConversationStore = create<ConversationStore>()(
	persist(
		(set, get) => ({
			// Initial state
			isSidebarOpen: false,
			conversations: [],
			currentConversationId: null,
			messages: [],
			loading: false,
			sending: false,
			loadingMessages: false,
			error: null,

			// Actions
			toggleSidebar: (open) =>
				set((s) => ({ isSidebarOpen: typeof open === 'boolean' ? open : !s.isSidebarOpen })),

			setError: (error) => set({ error }),

			loadConversations: async () => {
				try {
					set({ loading: true, error: null });
					const token = TokenManager.getAccessToken();
					const response = await listConversations(50, token);

					if (response.success && response.data) {
						set({
							conversations: response.data.items,
							loading: false,
						});
					} else {
						set({ loading: false, error: 'Failed to load conversations' });
					}
				} catch (error) {
					console.error('[ConversationStore] loadConversations failed', error);
					set({
						loading: false,
						error: (error as Error).message || 'Failed to load conversations',
					});
				}
			},

			createConversation: async (initialMessage?: string, title?: string) => {
				try {
					set({ loading: true, error: null });
					const token = TokenManager.getAccessToken();

					const currentPage = typeof window !== 'undefined' ? window.location.pathname : undefined;
					const requestData: { title?: string; initialMessage?: string; currentPage?: string } = {};
					if (title) requestData.title = title;
					if (initialMessage) requestData.initialMessage = initialMessage;
					if (currentPage) requestData.currentPage = currentPage;

					const response = await createConversationAction(requestData, token);

					if (!response.success || !response.data) {
						set({ loading: false, error: 'Failed to create conversation' });
						return null;
					}

					const newConversation = response.data.conversation;
					const messages =
						response.data.response && initialMessage
							? createInitialMessages(response.data.response, newConversation.id, initialMessage)
							: [];

					set((state) => ({
						conversations: [newConversation, ...state.conversations],
						currentConversationId: newConversation.id,
						messages,
						loading: false,
					}));

					return newConversation.id;
				} catch (error) {
					console.error('[ConversationStore] createConversation failed', error);
					set({
						loading: false,
						error: (error as Error).message || 'Failed to create conversation',
					});
					return null;
				}
			},

			selectConversation: async (conversationId: string) => {
				const state = get();
				if (state.currentConversationId === conversationId) {
					// Already selected, just load messages if not loaded
					if (state.messages.length === 0) {
						await get().loadMessages(conversationId);
					}
					return;
				}

				set({ currentConversationId: conversationId });
				await get().loadMessages(conversationId);
			},

			loadMessages: async (conversationId: string) => {
				try {
					set({ loadingMessages: true, error: null });
					const token = TokenManager.getAccessToken();
					const response = await getConversationMessages(conversationId, 100, token);

					if (response.success && response.data) {
						// Messages are returned in correct order (oldest first)
						// Convert and enrich messages
						const messages = response.data.items.map((msg) => {
							// If payload exists but hasn't been converted, convert it first
							if (msg.metadata?.payload && 'mode' in msg.metadata.payload) {
								const rawPayload = msg.metadata.payload as unknown as ChatResponseRawPayload;
								// Check if payload needs conversion (has mode but structure might be raw)
								const convertedPayload = convertChatResponsePayload(rawPayload);
								if (convertedPayload) {
									return enrichMessage({
										...msg,
										metadata: {
											...msg.metadata,
											payload: convertedPayload,
										},
									});
								}
							}
							return enrichMessage(msg);
						});
						set({
							messages,
							loadingMessages: false,
						});
					} else {
						set({ loadingMessages: false, error: 'Failed to load messages' });
					}
				} catch (error) {
					console.error('[ConversationStore] loadMessages failed', error);
					set({
						loadingMessages: false,
						error: (error as Error).message || 'Failed to load messages',
					});
				}
			},

			sendMessage: async (message: string, currentPage?: string) => {
				// Note: images parameter is not yet supported by conversation API
				// Get currentPage from window if not provided
				const pageContext =
					currentPage || (typeof window !== 'undefined' ? window.location.pathname : undefined);

				const state = get();
				let conversationId = state.currentConversationId;

				// Create conversation if none exists
				if (!conversationId) {
					conversationId = await get().createConversation(message, undefined, pageContext);
					if (!conversationId) {
						set({ error: 'Failed to create conversation' });
						return;
					}
					// Message was already sent in createConversation, return
					return;
				}

				// Note: images parameter is not yet supported by conversation API

				// Optimistically add user message
				const userMessage: ConversationMessage = {
					id: `temp-user-${Date.now()}`,
					sessionId: conversationId,
					role: 'user',
					content: message,
					sequenceNumber: state.messages.length + 1,
					createdAt: new Date().toISOString(),
					metadata: null,
				};

				set((s) => ({
					messages: [...s.messages, userMessage],
					sending: true,
					error: null,
				}));

				// Add typing indicator
				const typingMessage: ConversationMessage = {
					id: 'typing',
					sessionId: conversationId,
					role: 'assistant',
					content: '...',
					sequenceNumber: state.messages.length + 2,
					createdAt: new Date().toISOString(),
					metadata: null,
				};

				set((s) => ({
					messages: [...s.messages, typingMessage],
				}));

				try {
					const token = TokenManager.getAccessToken();
					const response = await sendConversationMessage(
						conversationId,
						{ message, currentPage: pageContext },
						token,
					);

					if (response.success && response.data) {
						const chatResponse = response.data;
						const assistantMessage = chatResponseToMessage(
							chatResponse,
							conversationId,
							state.messages.length + 2,
						);

						// Remove typing indicator and add real response
						set((s) => ({
							messages: [
								...s.messages.filter((m) => m.id !== 'typing'),
								enrichMessage(assistantMessage),
							],
							sending: false,
						}));

						// Refresh conversation list to update lastMessageAt
						await get().loadConversations();
					} else {
						throw new Error('Failed to send message');
					}
				} catch (error) {
					console.error('[ConversationStore] sendMessage failed', error);

					// Remove optimistic update and typing indicator
					set((s) => ({
						messages: s.messages.filter((m) => m.id !== userMessage.id && m.id !== 'typing'),
						sending: false,
						error: (error as Error).message || 'Failed to send message',
					}));
				}
			},

			updateTitle: async (conversationId: string, title: string) => {
				try {
					const token = TokenManager.getAccessToken();
					const response = await updateConversationTitle(conversationId, title, token);

					if (response.success) {
						// Update in conversations list
						set((state) => ({
							conversations: state.conversations.map((conv) =>
								conv.id === conversationId ? { ...conv, title } : conv,
							),
						}));
					} else {
						throw new Error('Failed to update title');
					}
				} catch (error) {
					console.error('[ConversationStore] updateTitle failed', error);
					set({ error: (error as Error).message || 'Failed to update title' });
					throw error;
				}
			},

			deleteConversation: async (conversationId: string) => {
				try {
					const token = TokenManager.getAccessToken();
					const response = await deleteConversationAction(conversationId, token);

					if (response.success) {
						// Remove from conversations list
						set((state) => ({
							conversations: state.conversations.filter((conv) => conv.id !== conversationId),
						}));

						// Clear current conversation if it was deleted
						if (get().currentConversationId === conversationId) {
							get().clearCurrentConversation();
						}
					} else {
						throw new Error('Failed to delete conversation');
					}
				} catch (error) {
					console.error('[ConversationStore] deleteConversation failed', error);
					set({ error: (error as Error).message || 'Failed to delete conversation' });
					throw error;
				}
			},

			clearMessages: async (conversationId: string) => {
				try {
					const token = TokenManager.getAccessToken();
					// Import dynamically to avoid unused import warning
					const { clearConversationMessages } = await import('@/actions/conversation.action');
					const response = await clearConversationMessages(conversationId, token);

					if (response.success) {
						// Clear messages if this is the current conversation
						if (get().currentConversationId === conversationId) {
							set({ messages: [] });
						}
					} else {
						throw new Error('Failed to clear messages');
					}
				} catch (error) {
					console.error('[ConversationStore] clearMessages failed', error);
					set({ error: (error as Error).message || 'Failed to clear messages' });
					throw error;
				}
			},

			clearCurrentConversation: () => {
				set({
					currentConversationId: null,
					messages: [],
				});
			},
		}),
		{
			name: 'conversation-store',
			storage: createJSONStorage(() => sessionStorage),
			partialize: (state) => ({
				isSidebarOpen: state.isSidebarOpen,
				currentConversationId: state.currentConversationId,
			}),
		},
	),
);
