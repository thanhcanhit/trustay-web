// AI assistant types aligned with session-based backend contract

export type AIRole = 'user' | 'assistant';

export interface AIHistoryMessage {
	id: string;
	role: AIRole;
	content: string;
	timestamp: string; // ISO string
	kind?: ChatEnvelopeKind;
	payload?: ContentPayload | DataPayload | ControlPayload;
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

// Envelope-based response (Markdown-first)
export type ChatEnvelopeKind = 'CONTENT' | 'DATA' | 'CONTROL';

export interface ContentPayload {
	mode: 'CONTENT';
	stats?: ReadonlyArray<{ label: string; value: number; unit?: string }>;
}

export type EntityType = 'room' | 'post' | 'room_seeking_post';
export type TableCell = string | number | boolean | null;

export interface TableColumn {
	key: string;
	label: string;
	type: 'string' | 'number' | 'date' | 'boolean' | 'url' | 'image';
}

export interface ListItem {
	id: string;
	title: string;
	description?: string;
	thumbnailUrl?: string;
	entity?: EntityType;
	path?: string;
	externalUrl?: string;
	extra?: Record<string, string | number | boolean>;
}

export interface DataPayload {
	mode: 'LIST' | 'TABLE' | 'CHART';
	list?: { items: ReadonlyArray<ListItem>; total: number };
	table?: {
		columns: ReadonlyArray<TableColumn>;
		rows: ReadonlyArray<Record<string, TableCell>>;
		previewLimit?: number;
	};
	chart?: {
		mimeType: 'image/png' | 'image/jpeg' | 'image/webp';
		base64?: string;
		url?: string;
		width: number;
		height: number;
		alt?: string;
	};
}

export interface ControlPayload {
	mode: 'CLARIFY' | 'ERROR';
	questions?: ReadonlyArray<string>;
	code?: string;
	details?: string;
}

export interface ChatEnvelope {
	kind: ChatEnvelopeKind;
	message: string; // Primary Markdown field (friendly for end users)
	timestamp: string;
	sessionId: string;
	meta?: Record<string, string | number | boolean>;
	// Backward-compat fields (legacy)
	sql?: string;
	results?: unknown;
	count?: number;
	validation?: {
		isValid: boolean;
		reason?: string;
		needsClarification?: boolean;
		needsIntroduction?: boolean;
		clarificationQuestion?: string;
	};
	error?: string;
	payload?: ContentPayload | DataPayload | ControlPayload;
}

export interface AIStateSnapshot {
	isSidebarOpen: boolean;
	isLoading: boolean;
	isThinking?: boolean;
	error?: string | null;
	sessionId?: string;
	// Unified local view: history plus enriched assistant entries that may include SQL/results
	messages: Array<
		| AIHistoryMessage
		| (AIHistoryMessage & {
				// Envelope enrichments
				contentStats?: ReadonlyArray<{ label: string; value: number; unit?: string }>;
				dataList?: { items: ReadonlyArray<ListItem>; total: number };
				dataTable?: {
					columns: ReadonlyArray<TableColumn>;
					rows: ReadonlyArray<Record<string, TableCell>>;
					previewLimit?: number;
				};
				chart?: { url?: string; width: number; height: number; alt?: string };
				controlQuestions?: ReadonlyArray<string>;
				errorCode?: string;
				errorDetails?: string;
				sql?: string;
				results?: Array<Record<string, unknown>>;
				count?: number;
		  })
	>;
}
