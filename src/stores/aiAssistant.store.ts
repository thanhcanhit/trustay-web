import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { clearAIHistory, getAIHistory, postAIChat } from '@/actions/ai.action';
import { TokenManager } from '@/lib/api-client';
import type {
	AIHistoryMessage,
	AIStateSnapshot,
	ChatEnvelope,
	ContentPayload,
	ControlPayload,
	DataPayload,
} from '@/types';

type AIActions = {
	toggleSidebar: (open?: boolean) => void;
	loadHistory: () => Promise<void>;
	clearHistory: () => Promise<void>;
	sendPrompt: (content: string) => Promise<void>;
	setError: (message: string | null) => void;
};

export const useAIAssistantStore = create<AIStateSnapshot & AIActions>()(
	persist(
		(set) => ({
			isSidebarOpen: false,
			isLoading: false,
			isThinking: false,
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
					const messages = Array.isArray(history.messages) ? history.messages : [];
					type AssistantEnrichments = {
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

					const enriched = messages.map((msg) => {
						if (!msg.kind || !msg.payload) return msg;
						const result: AIHistoryMessage & Partial<AssistantEnrichments> = {
							...(msg as AIHistoryMessage),
						};
						const p = msg.payload as ContentPayload | DataPayload | ControlPayload;
						if ('mode' in p) {
							if (p.mode === 'CONTENT') {
								result.contentStats = (p as ContentPayload).stats;
							} else if (p.mode === 'LIST' || p.mode === 'TABLE' || p.mode === 'CHART') {
								const dp = p as DataPayload;
								if (dp.list) result.dataList = dp.list;
								if (dp.table) result.dataTable = dp.table;
								if (dp.chart)
									result.chart = {
										url: dp.chart.url,
										width: dp.chart.width,
										height: dp.chart.height,
										alt: dp.chart.alt,
									};
							} else if (p.mode === 'CLARIFY' || p.mode === 'ERROR') {
								const cp = p as ControlPayload;
								if (p.mode === 'CLARIFY') {
									result.controlQuestions = cp.questions;
								} else {
									result.errorCode = cp.code;
									result.errorDetails = cp.details;
								}
							}
						}
						return result as AIHistoryMessage;
					});
					set({
						isLoading: false,
						sessionId: history.sessionId,
						messages: enriched,
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
					const currentPage = typeof window !== 'undefined' ? window.location.pathname : undefined;
					// Add a temporary typing message
					set((s) => ({
						isThinking: true,
						messages: [
							...(s.messages ?? []),
							{
								id: 'typing',
								role: 'assistant',
								content: '...',
								timestamp: new Date().toISOString(),
							},
						],
					}));
					const res = await postAIChat(content, currentPage, token);

					// Support both old AIChatResponse and new ChatEnvelope
					const maybeEnvelope = res as unknown as Partial<ChatEnvelope>;
					const base: AIHistoryMessage = {
						id: `assistant_${Date.now()}`,
						role: 'assistant',
						content:
							(maybeEnvelope.message as string) ||
							(res as unknown as { message?: string }).message ||
							'',
						timestamp:
							(maybeEnvelope.timestamp as string) ||
							(res as unknown as { timestamp?: string }).timestamp ||
							new Date().toISOString(),
					};
					let contentStats:
						| ReadonlyArray<{ label: string; value: number; unit?: string }>
						| undefined;
					let dataList: DataPayload['list'] | undefined;
					let dataTable: DataPayload['table'] | undefined;
					let chart: { url?: string; width: number; height: number; alt?: string } | undefined;
					let controlQuestions: ReadonlyArray<string> | undefined;
					let errorCode: string | undefined;
					let errorDetails: string | undefined;
					let sql: string | undefined;
					let results: Array<Record<string, unknown>> | undefined;
					let count: number | undefined;

					if (maybeEnvelope.kind && maybeEnvelope.message) {
						// Enrich from payload
						const payload = maybeEnvelope.payload as
							| ContentPayload
							| DataPayload
							| ControlPayload
							| undefined;
						if (payload && 'mode' in payload) {
							if (payload.mode === 'CONTENT') {
								contentStats = (payload as ContentPayload).stats;
							} else if (
								payload.mode === 'LIST' ||
								payload.mode === 'TABLE' ||
								payload.mode === 'CHART'
							) {
								const dataPayload = payload as DataPayload;
								dataList = dataPayload.list;
								dataTable = dataPayload.table;
								chart = dataPayload.chart
									? {
											url: dataPayload.chart.url,
											width: dataPayload.chart.width,
											height: dataPayload.chart.height,
											alt: dataPayload.chart.alt,
										}
									: undefined;
							} else if (payload.mode === 'CLARIFY' || payload.mode === 'ERROR') {
								const controlPayload = payload as ControlPayload;
								if (payload.mode === 'CLARIFY') {
									controlQuestions = controlPayload.questions;
								} else if (payload.mode === 'ERROR') {
									errorCode = controlPayload.code;
									errorDetails = controlPayload.details;
								}
							}
						}
					} else {
						// Backward compatibility (SQL etc.)
						sql = (res as unknown as { sql?: string }).sql;
						results = (res as unknown as { results?: Array<Record<string, unknown>> }).results;
						count = (res as unknown as { count?: number }).count;
					}

					const assistantMsg = {
						...base,
						...(contentStats ? { contentStats } : {}),
						...(dataList ? { dataList } : {}),
						...(dataTable ? { dataTable } : {}),
						...(chart ? { chart } : {}),
						...(controlQuestions ? { controlQuestions } : {}),
						...(errorCode ? { errorCode } : {}),
						...(errorDetails ? { errorDetails } : {}),
						...(sql ? { sql } : {}),
						...(results ? { results } : {}),
						...(typeof count === 'number' ? { count } : {}),
					};

					set((s) => ({
						sessionId:
							(maybeEnvelope.sessionId as string) ||
							(res as unknown as { sessionId?: string }).sessionId,
						isThinking: false,
						messages: [...(s.messages ?? []).filter((m) => m.id !== 'typing'), assistantMsg],
					}));
				} catch (e) {
					console.error('[AI] sendPrompt failed', e);
					set((s) => ({
						isThinking: false,
						error: (e as Error).message,
						messages: (s.messages ?? []).filter((m) => m.id !== 'typing'),
					}));
				}
			},
		}),
		{
			name: 'ai-assistant-store',
			storage: createJSONStorage(() => sessionStorage),
			partialize: (state) => ({ isSidebarOpen: state.isSidebarOpen }),
		},
	),
);
