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
	// Orchestrator Agent data
	orchestratorData?: Record<string, unknown> | null;
	// SQL Generation Agent data (array vì có thể retry nhiều lần)
	sqlGenerationAttempts?: Record<string, unknown>[] | null;
	// Result Validator Agent data
	validatorData?: Record<string, unknown> | null;
	// RAG Context từ vector DB
	ragContext?: Record<string, unknown> | null;
	// Token usage tổng hợp
	tokenUsage?: Record<string, unknown> | null;
	// Steps log - log các bước xử lý
	stepsLog?: string | null;
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

export interface TeachBatchItem {
	question: string;
	sql: string;
}

export interface TeachBatchPayload {
	items: TeachBatchItem[];
	failFast?: boolean;
}

export interface TeachBatchItemResult {
	index: number;
	success: boolean;
	message: string;
	chunkId?: number;
	sqlQAId?: number;
	error?: string;
}

export interface TeachBatchResult {
	success: boolean;
	total: number;
	successful: number;
	failed: number;
	results: TeachBatchItemResult[];
}

export type PendingKnowledgeStatus = 'pending' | 'approved' | 'rejected';

export interface PendingKnowledgeValidatorData {
	isValid: boolean;
	reason?: string;
	violations?: string[];
	severity?: 'ERROR' | 'WARN';
	evaluation?: string;
	tokenUsage?: {
		promptTokens: number;
		completionTokens: number;
		totalTokens: number;
	};
}

export interface PendingKnowledge {
	id: string;
	question: string;
	sql: string | null;
	evaluation: string | null;
	status: PendingKnowledgeStatus;
	validatorData: PendingKnowledgeValidatorData | null;
	sessionId: string | null;
	userId: string | null;
	processingLogId: string | null;
	approvedAt: string | null;
	approvedBy: string | null;
	rejectedAt: string | null;
	rejectedBy: string | null;
	rejectionReason: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface ApprovePendingKnowledgeRequest {
	note?: string;
}

export interface ApprovePendingKnowledgeResponse {
	success: boolean;
	message: string;
	pendingKnowledgeId: string;
	chunkId?: number;
	sqlQAId?: number;
}

export interface RejectPendingKnowledgeRequest {
	reason: string;
}

export interface RejectPendingKnowledgeResponse {
	success: boolean;
	message: string;
	pendingKnowledgeId: string;
	status: 'rejected';
}
