export type AICollection = 'schema' | 'qa' | 'business' | 'docs';

export type AILogStatus = 'completed' | 'failed' | 'partial';

export interface AICanonicalEntry {
	id: number;
	question: string;
	sqlCanonical: string;
	sqlTemplate?: string;
	parameters?: Record<string, unknown>;
	createdAt: string;
	updatedAt: string;
	lastUsedAt?: string;
}

export interface AIChunk {
	id: number;
	collection: AICollection;
	content: string;
	createdAt: string;
	updatedAt: string;
}

export interface AILogEntry {
	id: string;
	question: string;
	response?: string | null;
	status: AILogStatus;
	error?: string | null;
	totalDuration?: number;
	createdAt: string;
}

export interface AdminAIPaginatedResponse<T> {
	items: T[];
	total: number;
	limit: number;
	offset: number;
}

export interface TeachOrUpdatePayload {
	id?: number;
	question: string;
	sql: string;
	sessionId?: string;
	userId?: string;
}

export interface TeachOrUpdateResult {
	success: boolean;
	message: string;
	chunkId: number;
	sqlQAId: number;
	isUpdate: boolean;
}
