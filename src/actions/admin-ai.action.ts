//'use server';

import { createServerApiCall, TokenManager } from '../lib/api-client';
import type {
	AdminAIPaginatedResponse,
	AICanonicalEntry,
	AIChunk,
	AICollection,
	AILogEntry,
	AILogStatus,
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
