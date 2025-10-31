'use server';

import { createServerApiCall } from '../lib/api-client';

const apiCall = createServerApiCall();

// Local interfaces follow the style of chat.action.ts
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
	messages: Array<{
		id: string;
		role: 'user' | 'assistant';
		content: string;
		timestamp: string;
	}>;
}

const AI_ENDPOINTS = {
	chat: (query: string) => `/api/ai/chat?query=${encodeURIComponent(query)}`,
	history: '/api/ai/chat/history',
	text2sql: '/api/ai/text2sql',
};

// Helper to unwrap ApiResponse if the backend wraps responses
function unwrap<T>(resp: any): T {
	if (resp && typeof resp === 'object' && 'data' in resp && resp.data) {
		return resp.data as T;
	}
	return resp as T;
}

export async function postAIChat(query: string, token?: string): Promise<AIChatResponse> {
	const resp = await apiCall<any>(AI_ENDPOINTS.chat(query), { method: 'POST' }, token);
	return unwrap<AIChatResponse>(resp);
}

export async function getAIHistory(token?: string): Promise<AIHistoryResponse> {
	const resp = await apiCall<any>(AI_ENDPOINTS.history, { method: 'GET' }, token);
	return unwrap<AIHistoryResponse>(resp);
}

export async function clearAIHistory(token?: string): Promise<void> {
	await apiCall<void>(AI_ENDPOINTS.history, { method: 'DELETE' }, token);
}

export async function textToSQL(
	query: string,
	token?: string,
): Promise<{ sql: string; results?: Array<Record<string, unknown>> }> {
	const resp = await apiCall<any>(
		AI_ENDPOINTS.text2sql,
		{ method: 'POST', data: { query } },
		token,
	);
	return unwrap<{ sql: string; results?: Array<Record<string, unknown>> }>(resp);
}
