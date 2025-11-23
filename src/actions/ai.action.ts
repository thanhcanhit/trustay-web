//'use server';

import type { AIChatResponse, AIHistoryResponse } from '@/types/ai';
import type { ApiResponse } from '../lib/api-client';
import { createServerApiCall } from '../lib/api-client';

const apiCall = createServerApiCall();

// Use central types from '@/types/ai'

const AI_ENDPOINTS = {
	chat: '/api/ai/chat',
	history: '/api/ai/chat/history',
	text2sql: '/api/ai/text2sql',
	roomPublish: '/api/ai/room-publish',
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

export interface ChatRequest {
	query: string;
	currentPage?: string;
	images?: string[];
}

export async function postAIChat(
	query: string,
	currentPage?: string,
	token?: string,
	images?: string[],
): Promise<AIChatResponse> {
	const requestBody: ChatRequest = {
		query,
		...(currentPage && { currentPage }),
		...(images && images.length > 0 && { images }),
	};
	const resp = await apiCall<ApiResponse<AIChatResponse> | AIChatResponse>(
		AI_ENDPOINTS.chat,
		{ method: 'POST', data: requestBody, timeout: 0 },
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

// Room Publishing with AI - Dedicated endpoint for room publishing flow
export interface RoomPublishRequest {
	message?: string; // Optional - can be empty to trigger creation
	buildingId?: string;
	images?: string[];
}

export enum RoomPublishingStatus {
	NEED_MORE_INFO = 'NEED_MORE_INFO',
	READY_TO_CREATE = 'READY_TO_CREATE',
	CREATED = 'CREATED',
	CREATION_FAILED = 'CREATION_FAILED',
}

export interface RoomPublishResponse {
	success: boolean;
	data?: {
		kind: 'CONTENT' | 'CONTROL';
		sessionId: string;
		timestamp?: string;
		message: string;
		payload?: {
			mode: 'ROOM_PUBLISH';
			status: RoomPublishingStatus;
			// For NEED_MORE_INFO
			missingField?: string;
			hasPendingActions?: boolean;
			// For READY_TO_CREATE
			plan?: {
				shouldCreateBuilding: boolean;
				buildingId?: string;
				buildingPayload?: unknown;
				roomPayload: unknown;
				description?: string;
			};
			// For CREATED
			roomId?: string;
			roomSlug?: string;
			roomPath?: string; // "/rooms/{slug}" - dùng để redirect
			// For CREATION_FAILED
			error?: string;
		};
		meta?: {
			stage: string;
			planReady?: boolean;
			shouldCreateBuilding?: boolean;
			pendingActions?: number;
			actionTypes?: string;
		};
	};
	error?: string;
	message?: string;
}

export async function postAIRoomPublish(
	message: string,
	images?: string[],
	token?: string,
	buildingId?: string,
): Promise<RoomPublishResponse> {
	const requestBody: RoomPublishRequest = {
		message,
		...(images && images.length > 0 && { images }),
		...(buildingId && { buildingId }),
	};
	const resp = await apiCall<RoomPublishResponse>(
		AI_ENDPOINTS.roomPublish,
		{ method: 'POST', data: requestBody, timeout: 0 },
		token,
	);
	return resp;
}
