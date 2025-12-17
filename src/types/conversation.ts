// Conversation API types based on conversation.md specification
// Extends types from ai.ts

import type { ChatEnvelopeKind, ContentPayload, ControlPayload, DataPayload } from './ai';

/**
 * Conversation metadata
 */
export interface Conversation {
	id: string;
	userId?: string;
	title: string;
	summary?: string | null;
	messageCount: number;
	lastMessageAt: string | null; // ISO 8601 format
	createdAt: string; // ISO 8601 format
	updatedAt: string; // ISO 8601 format
}

/**
 * Message in a conversation
 */
export interface ConversationMessage {
	id: string;
	sessionId: string;
	role: 'user' | 'assistant' | 'system';
	content: string;
	metadata?: ConversationMessageMetadata | null;
	sequenceNumber: number;
	createdAt: string; // ISO 8601 format
}

/**
 * Message metadata (enriched from ChatResponse payload)
 */
export interface ConversationMessageMetadata {
	kind?: ChatEnvelopeKind;
	payload?: ContentPayload | DataPayload | ControlPayload;
	sql?: string;
	canonicalQuestion?: string;
}

/**
 * Raw payload structure from conversation API (before conversion)
 */
export interface ChatResponseRawPayload {
	mode?: 'TABLE' | 'LIST' | 'CHART' | 'INSIGHT' | 'CONTENT' | 'CLARIFY' | 'ERROR';
	sql?: string;
	results?: unknown[];
	columns?: Array<{ key: string; label: string }>;
	questions?: string[]; // For CLARIFY mode
	details?: string; // For ERROR mode
	[key: string]: unknown;
}

/**
 * ChatResponse from AI (matches conversation.md spec)
 * This is the raw response from API, payload needs to be converted
 */
export interface ChatResponse {
	kind: ChatEnvelopeKind;
	sessionId: string;
	timestamp: string; // ISO 8601 format
	message: string; // Human-readable message
	payload?: ChatResponseRawPayload;
}

/**
 * Request body for creating a conversation
 */
export interface CreateConversationRequest {
	title?: string; // Optional: Custom title
	initialMessage?: string; // Optional: First message
	currentPage?: string; // Optional: Current page for context
}

/**
 * Request body for sending a message
 */
export interface SendMessageRequest {
	message: string;
	currentPage?: string; // Optional: For context
}

/**
 * Request body for updating conversation title
 */
export interface UpdateTitleRequest {
	title: string;
}

/**
 * Response from GET /api/ai/conversations
 */
export interface ListConversationsResponse {
	success: boolean;
	data: {
		items: Conversation[];
		total: number;
	};
}

/**
 * Response from GET /api/ai/conversations/:id
 */
export interface GetConversationResponse {
	success: boolean;
	data: Conversation & {
		messages: ConversationMessage[];
	};
}

/**
 * Response from POST /api/ai/conversations
 */
export interface CreateConversationResponse {
	success: boolean;
	data: {
		conversation: Conversation;
		response?: ChatResponse; // Present if initialMessage was provided
	};
}

/**
 * Response from POST /api/ai/conversations/:id/messages
 */
export interface SendMessageResponse {
	success: boolean;
	data: ChatResponse;
}

/**
 * Response from GET /api/ai/conversations/:id/messages
 */
export interface GetMessagesResponse {
	success: boolean;
	data: {
		items: ConversationMessage[];
		total: number;
	};
}

/**
 * Response from PATCH /api/ai/conversations/:id/title
 */
export interface UpdateTitleResponse {
	success: boolean;
	data: {
		conversationId: string;
		title: string;
	};
}

/**
 * Response from DELETE /api/ai/conversations/:id
 */
export interface DeleteConversationResponse {
	success: boolean;
	data: {
		conversationId: string;
	};
}

/**
 * Response from POST /api/ai/conversations/:id/clear
 */
export interface ClearMessagesResponse {
	success: boolean;
	data: {
		conversationId: string;
	};
}
