// 'use server';

import type { AIChatResponse, AIHistoryResponse } from '@/types/ai';
import type { ApiResponse } from '../lib/api-client';
import { createServerApiCall } from '../lib/api-client';

const apiCall = createServerApiCall();

// Use central types from '@/types/ai'

const AI_ENDPOINTS = {
	chat: (query: string) => `/api/ai/chat?query=${encodeURIComponent(query)}`,
	history: '/api/ai/chat/history',
	text2sql: '/api/ai/text2sql',
};

// Helper to unwrap ApiResponse if the backend wraps responses
function unwrap<T>(resp: unknown): T {
	if (
		resp &&
		typeof resp === 'object' &&
		'data' in (resp as Record<string, unknown>) &&
		(resp as Record<string, unknown>).data
	) {
		return (resp as ApiResponse<T>).data as T;
	}
	return resp as T;
}

export async function postAIChat(query: string, token?: string): Promise<AIChatResponse> {
	const resp = await apiCall<ApiResponse<AIChatResponse> | AIChatResponse>(
		AI_ENDPOINTS.chat(query),
		{ method: 'POST', timeout: 0 },
		token,
	);
	return unwrap<AIChatResponse>(resp);
}

export async function getAIHistory(token?: string): Promise<AIHistoryResponse> {
	const resp = await apiCall<ApiResponse<AIHistoryResponse> | AIHistoryResponse>(
		AI_ENDPOINTS.history,
		{ method: 'GET', timeout: 0 },
		token,
	);
	return unwrap<AIHistoryResponse>(resp);
}

export async function clearAIHistory(token?: string): Promise<void> {
	await apiCall<void>(AI_ENDPOINTS.history, { method: 'DELETE', timeout: 0 }, token);
}

export async function textToSQL(
	query: string,
	token?: string,
): Promise<{ sql: string; results?: Array<Record<string, unknown>> }> {
	const resp = await apiCall<
		| ApiResponse<{ sql: string; results?: Array<Record<string, unknown>> }>
		| { sql: string; results?: Array<Record<string, unknown>> }
	>(AI_ENDPOINTS.text2sql, { method: 'POST', data: { query }, timeout: 0 }, token);
	return unwrap<{ sql: string; results?: Array<Record<string, unknown>> }>(resp);
}
