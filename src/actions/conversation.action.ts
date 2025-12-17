// Conversation API actions based on conversation.md specification

import type {
	ClearMessagesResponse,
	CreateConversationRequest,
	CreateConversationResponse,
	DeleteConversationResponse,
	GetConversationResponse,
	GetMessagesResponse,
	ListConversationsResponse,
	SendMessageRequest,
	SendMessageResponse,
	UpdateTitleRequest,
	UpdateTitleResponse,
} from '@/types/conversation';
import type { ApiResponse } from '../lib/api-client';
import { createServerApiCall } from '../lib/api-client';

const apiCall = createServerApiCall();

const CONVERSATION_ENDPOINTS = {
	list: '/api/ai/conversations',
	create: '/api/ai/conversations',
	get: (id: string) => `/api/ai/conversations/${id}`,
	sendMessage: (id: string) => `/api/ai/conversations/${id}/messages`,
	getMessages: (id: string) => `/api/ai/conversations/${id}/messages`,
	updateTitle: (id: string) => `/api/ai/conversations/${id}/title`,
	delete: (id: string) => `/api/ai/conversations/${id}`,
	clear: (id: string) => `/api/ai/conversations/${id}/clear`,
};

// Helper to unwrap ApiResponse if the backend wraps responses
// Only unwrap if response doesn't have 'success' field (meaning it's wrapped in ApiResponse)
// If response already has 'success' field, it's already in the correct format
function unwrap<T>(resp: unknown): T {
	// If response is not an object, return as-is
	if (!resp || typeof resp !== 'object') {
		return resp as T;
	}

	const respObj = resp as Record<string, unknown>;

	// If response already has 'success' field, it's in correct format, don't unwrap
	if ('success' in respObj) {
		return resp as T;
	}

	// If response has 'data' field but no 'success', it might be wrapped
	// Only unwrap if data exists and is not null/undefined
	if ('data' in respObj && respObj.data !== null && respObj.data !== undefined) {
		return respObj.data as T;
	}

	// Otherwise return as-is
	return resp as T;
}

/**
 * List all conversations for the current user
 * GET /api/ai/conversations?limit=50
 */
export async function listConversations(
	limit: number = 50,
	token?: string,
): Promise<ListConversationsResponse> {
	const resp = await apiCall<ApiResponse<ListConversationsResponse> | ListConversationsResponse>(
		`${CONVERSATION_ENDPOINTS.list}?limit=${limit}`,
		{ method: 'GET', timeout: 0 },
		token,
	);
	return unwrap<ListConversationsResponse>(resp);
}

/**
 * Create a new conversation
 * POST /api/ai/conversations
 */
export async function createConversation(
	data: CreateConversationRequest,
	token?: string,
): Promise<CreateConversationResponse> {
	const resp = await apiCall<ApiResponse<CreateConversationResponse> | CreateConversationResponse>(
		CONVERSATION_ENDPOINTS.create,
		{ method: 'POST', data, timeout: 0 },
		token,
	);
	const result = unwrap<CreateConversationResponse>(resp);
	console.log('[createConversation] Response after unwrap:', result);
	return result;
}

/**
 * Get conversation details including all messages
 * GET /api/ai/conversations/:id
 */
export async function getConversation(
	conversationId: string,
	token?: string,
): Promise<GetConversationResponse> {
	const resp = await apiCall<ApiResponse<GetConversationResponse> | GetConversationResponse>(
		CONVERSATION_ENDPOINTS.get(conversationId),
		{ method: 'GET', timeout: 0 },
		token,
	);
	return unwrap<GetConversationResponse>(resp);
}

/**
 * Send a message in a conversation
 * POST /api/ai/conversations/:id/messages
 */
export async function sendConversationMessage(
	conversationId: string,
	data: SendMessageRequest,
	token?: string,
): Promise<SendMessageResponse> {
	const resp = await apiCall<ApiResponse<SendMessageResponse> | SendMessageResponse>(
		CONVERSATION_ENDPOINTS.sendMessage(conversationId),
		{ method: 'POST', data, timeout: 0 },
		token,
	);
	return unwrap<SendMessageResponse>(resp);
}

/**
 * Get messages from a conversation
 * GET /api/ai/conversations/:id/messages?limit=100
 */
export async function getConversationMessages(
	conversationId: string,
	limit: number = 100,
	token?: string,
): Promise<GetMessagesResponse> {
	const resp = await apiCall<ApiResponse<GetMessagesResponse> | GetMessagesResponse>(
		`${CONVERSATION_ENDPOINTS.getMessages(conversationId)}?limit=${limit}`,
		{ method: 'GET', timeout: 0 },
		token,
	);
	return unwrap<GetMessagesResponse>(resp);
}

/**
 * Update conversation title
 * PATCH /api/ai/conversations/:id/title
 */
export async function updateConversationTitle(
	conversationId: string,
	title: string,
	token?: string,
): Promise<UpdateTitleResponse> {
	const data: UpdateTitleRequest = { title };
	const resp = await apiCall<ApiResponse<UpdateTitleResponse> | UpdateTitleResponse>(
		CONVERSATION_ENDPOINTS.updateTitle(conversationId),
		{ method: 'PATCH', data, timeout: 0 },
		token,
	);
	return unwrap<UpdateTitleResponse>(resp);
}

/**
 * Delete a conversation
 * DELETE /api/ai/conversations/:id
 */
export async function deleteConversation(
	conversationId: string,
	token?: string,
): Promise<DeleteConversationResponse> {
	const resp = await apiCall<ApiResponse<DeleteConversationResponse> | DeleteConversationResponse>(
		CONVERSATION_ENDPOINTS.delete(conversationId),
		{ method: 'DELETE', timeout: 0 },
		token,
	);
	return unwrap<DeleteConversationResponse>(resp);
}

/**
 * Clear all messages in a conversation
 * POST /api/ai/conversations/:id/clear
 */
export async function clearConversationMessages(
	conversationId: string,
	token?: string,
): Promise<ClearMessagesResponse> {
	const resp = await apiCall<ApiResponse<ClearMessagesResponse> | ClearMessagesResponse>(
		CONVERSATION_ENDPOINTS.clear(conversationId),
		{ method: 'POST', timeout: 0 },
		token,
	);
	return unwrap<ClearMessagesResponse>(resp);
}
