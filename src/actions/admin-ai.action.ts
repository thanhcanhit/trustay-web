//'use server';

import { createServerApiCall, TokenManager } from '../lib/api-client';
import type {
	AdminAIPaginatedResponse,
	AICanonicalEntry,
	AIChunk,
	AICollection,
	AILogEntry,
	AILogStatus,
	ApprovePendingKnowledgeRequest,
	ApprovePendingKnowledgeResponse,
	PendingKnowledge,
	PendingKnowledgeStatus,
	RejectPendingKnowledgeRequest,
	RejectPendingKnowledgeResponse,
	TeachBatchPayload,
	TeachBatchResult,
	TeachOrUpdatePayload,
	TeachOrUpdateResult,
} from '../types/admin-ai';
import { extractErrorMessage } from '../utils/api-error-handler';

const apiCall = createServerApiCall(() => TokenManager.getAccessToken() ?? null);
const BASE_ENDPOINT = '/api/admin/ai';

export interface CanonicalQuery {
	search?: string;
	limit?: number;
	offset?: number;
}

export interface ChunkQuery {
	search?: string;
	collection?: AICollection;
	limit?: number;
	offset?: number;
}

export interface LogQuery {
	search?: string;
	status?: AILogStatus;
	limit?: number;
	offset?: number;
}

export interface PendingKnowledgeQuery {
	search?: string;
	status?: PendingKnowledgeStatus;
	limit?: number;
	offset?: number;
}

function buildQueryString(params?: Record<string, string | number | undefined>): string {
	if (!params) return '';
	const query = new URLSearchParams();

	Object.entries(params).forEach(([key, value]) => {
		if (value === undefined || value === null || value === '') return;
		query.append(key, value.toString());
	});

	return query.toString();
}

export const getCanonicalEntries = async (
	params?: CanonicalQuery,
	token?: string,
): Promise<AdminAIPaginatedResponse<AICanonicalEntry>> => {
	try {
		const queryString = buildQueryString(params as Record<string, string | number | undefined>);
		const endpoint = `${BASE_ENDPOINT}/canonical${queryString ? `?${queryString}` : ''}`;

		return await apiCall<AdminAIPaginatedResponse<AICanonicalEntry>>(
			endpoint,
			{ method: 'GET' },
			token,
		);
	} catch (error) {
		throw new Error(extractErrorMessage(error, 'Could not load canonical data'));
	}
};

export const getAIChunks = async (
	params?: ChunkQuery,
	token?: string,
): Promise<AdminAIPaginatedResponse<AIChunk>> => {
	try {
		const queryString = buildQueryString(params as Record<string, string | number | undefined>);
		const endpoint = `${BASE_ENDPOINT}/chunks${queryString ? `?${queryString}` : ''}`;

		return await apiCall<AdminAIPaginatedResponse<AIChunk>>(endpoint, { method: 'GET' }, token);
	} catch (error) {
		throw new Error(extractErrorMessage(error, 'Could not load chunks'));
	}
};

export const getAILogs = async (
	params?: LogQuery,
	token?: string,
): Promise<AdminAIPaginatedResponse<AILogEntry>> => {
	try {
		const queryString = buildQueryString(params as Record<string, string | number | undefined>);
		const endpoint = `${BASE_ENDPOINT}/logs${queryString ? `?${queryString}` : ''}`;

		return await apiCall<AdminAIPaginatedResponse<AILogEntry>>(endpoint, { method: 'GET' }, token);
	} catch (error) {
		throw new Error(extractErrorMessage(error, 'Could not load AI logs'));
	}
};

export const getAILogById = async (logId: string, token?: string): Promise<AILogEntry> => {
	try {
		return await apiCall<AILogEntry>(`${BASE_ENDPOINT}/logs/${logId}`, { method: 'GET' }, token);
	} catch (error) {
		throw new Error(extractErrorMessage(error, 'Could not load AI log'));
	}
};

export const teachOrUpdateKnowledge = async (
	payload: TeachOrUpdatePayload,
	token?: string,
): Promise<TeachOrUpdateResult> => {
	try {
		return await apiCall<TeachOrUpdateResult>(
			`${BASE_ENDPOINT}/teach-or-update`,
			{
				method: 'POST',
				data: payload,
			},
			token,
		);
	} catch (error) {
		throw new Error(extractErrorMessage(error, 'Could not update knowledge'));
	}
};

export interface CanonicalChunkResponse {
	chunkId: number;
}

export interface ChunkCanonicalResponse {
	sqlQAId: number;
}

export const getCanonicalChunkId = async (
	canonicalId: number,
	token?: string,
): Promise<CanonicalChunkResponse> => {
	try {
		return await apiCall<CanonicalChunkResponse>(
			`${BASE_ENDPOINT}/canonical/${canonicalId}/chunk`,
			{ method: 'GET' },
			token,
		);
	} catch (error) {
		throw new Error(extractErrorMessage(error, 'Could not load chunk ID for canonical'));
	}
};

export const getChunkCanonicalId = async (
	chunkId: number,
	token?: string,
): Promise<ChunkCanonicalResponse> => {
	try {
		return await apiCall<ChunkCanonicalResponse>(
			`${BASE_ENDPOINT}/chunk/${chunkId}/canonical`,
			{ method: 'GET' },
			token,
		);
	} catch (error) {
		throw new Error(extractErrorMessage(error, 'Could not load canonical ID for chunk'));
	}
};

export const teachBatchKnowledge = async (
	payload: TeachBatchPayload,
	token?: string,
): Promise<TeachBatchResult> => {
	try {
		return await apiCall<TeachBatchResult>(
			`${BASE_ENDPOINT}/teach-json`,
			{
				method: 'POST',
				data: payload,
			},
			token,
		);
	} catch (error) {
		throw new Error(extractErrorMessage(error, 'Could not batch teach knowledge'));
	}
};

export const getPendingKnowledge = async (
	params?: PendingKnowledgeQuery,
	token?: string,
): Promise<AdminAIPaginatedResponse<PendingKnowledge>> => {
	try {
		const queryString = buildQueryString(params as Record<string, string | number | undefined>);
		const endpoint = `${BASE_ENDPOINT}/pending-knowledge${queryString ? `?${queryString}` : ''}`;

		return await apiCall<AdminAIPaginatedResponse<PendingKnowledge>>(
			endpoint,
			{ method: 'GET' },
			token,
		);
	} catch (error) {
		throw new Error(extractErrorMessage(error, 'Could not load pending knowledge'));
	}
};

export const getPendingKnowledgeById = async (
	id: string,
	token?: string,
): Promise<PendingKnowledge> => {
	try {
		return await apiCall<PendingKnowledge>(
			`${BASE_ENDPOINT}/pending-knowledge/${id}`,
			{ method: 'GET' },
			token,
		);
	} catch (error) {
		throw new Error(extractErrorMessage(error, 'Could not load pending knowledge'));
	}
};

export const approvePendingKnowledge = async (
	id: string,
	payload?: ApprovePendingKnowledgeRequest,
	token?: string,
): Promise<ApprovePendingKnowledgeResponse> => {
	try {
		return await apiCall<ApprovePendingKnowledgeResponse>(
			`${BASE_ENDPOINT}/pending-knowledge/${id}/approve`,
			{
				method: 'POST',
				data: payload || {},
			},
			token,
		);
	} catch (error) {
		throw new Error(extractErrorMessage(error, 'Could not approve pending knowledge'));
	}
};

export const rejectPendingKnowledge = async (
	id: string,
	payload: RejectPendingKnowledgeRequest,
	token?: string,
): Promise<RejectPendingKnowledgeResponse> => {
	try {
		return await apiCall<RejectPendingKnowledgeResponse>(
			`${BASE_ENDPOINT}/pending-knowledge/${id}/reject`,
			{
				method: 'POST',
				data: payload,
			},
			token,
		);
	} catch (error) {
		throw new Error(extractErrorMessage(error, 'Could not reject pending knowledge'));
	}
};

export interface DeleteChunkResponse {
	success: boolean;
	message: string;
}

export const deleteChunk = async (
	chunkId: number,
	token?: string,
): Promise<DeleteChunkResponse> => {
	try {
		return await apiCall<DeleteChunkResponse>(
			`/api/ai/knowledge/knowledge/chunk/${chunkId}`,
			{ method: 'DELETE' },
			token,
		);
	} catch (error) {
		throw new Error(extractErrorMessage(error, 'Could not delete chunk'));
	}
};

export interface DeleteSQLQAResponse {
	success: boolean;
	message: string;
}

export const deleteSQLQA = async (
	sqlQAId: number,
	token?: string,
): Promise<DeleteSQLQAResponse> => {
	try {
		return await apiCall<DeleteSQLQAResponse>(
			`/api/ai/knowledge/knowledge/sql_qa/${sqlQAId}`,
			{ method: 'DELETE' },
			token,
		);
	} catch (error) {
		throw new Error(extractErrorMessage(error, 'Could not delete SQL QA'));
	}
};

export interface ReEmbedSchemaRequest {
	tenantId: string;
	dbKey: string;
	schemaName: string;
}

export interface ReEmbedSchemaResponse {
	success: boolean;
	message: string;
}

export const reEmbedSchema = async (
	payload: ReEmbedSchemaRequest,
	token?: string,
): Promise<ReEmbedSchemaResponse> => {
	try {
		return await apiCall<ReEmbedSchemaResponse>(
			'/api/ai/knowledge/re-embed-schema',
			{
				method: 'POST',
				data: payload,
			},
			token,
		);
	} catch (error) {
		throw new Error(extractErrorMessage(error, 'Could not re-embed schema'));
	}
};

export interface ExportGoldenDataParams {
	format?: 'json' | 'csv';
	search?: string;
	limit?: number;
}

export const exportGoldenData = async (
	params?: ExportGoldenDataParams,
	token?: string,
): Promise<Blob> => {
	try {
		const queryString = buildQueryString(params as Record<string, string | number | undefined>);
		const endpoint = `/api/ai/knowledge/export-golden-data${queryString ? `?${queryString}` : ''}`;
		const accessToken = token || TokenManager.getAccessToken() || '';

		// Fetch as blob for file download
		const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
		const response = await fetch(`${baseUrl}${endpoint}`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`Export failed: ${response.statusText} - ${errorText}`);
		}

		return await response.blob();
	} catch (error) {
		throw new Error(extractErrorMessage(error, 'Could not export golden data'));
	}
};
