// AI assistant types aligned with session-based backend contract

export type AIRole = 'user' | 'assistant';

export interface AIHistoryMessage {
	id: string;
	role: AIRole;
	content: string;
	timestamp: string; // ISO string
}

export interface AIChatResponse {
	sessionId: string;
	message: string;
	sql?: string;
	results?: Array<Record<string, unknown>>;
	count?: number;
	timestamp: string;
	validation?: {
		isValid: boolean;
		needsClarification?: boolean;
		needsIntroduction?: boolean;
	};
}

export interface AIHistoryResponse {
	sessionId: string;
	messages: AIHistoryMessage[];
}

export interface AIStateSnapshot {
	isSidebarOpen: boolean;
	isLoading: boolean;
	error?: string | null;
	sessionId?: string;
	// Unified local view: history plus enriched assistant entries that may include SQL/results
	messages: Array<
		| AIHistoryMessage
		| (AIHistoryMessage & {
				sql?: string;
				results?: Array<Record<string, unknown>>;
				count?: number;
		  })
	>;
}
