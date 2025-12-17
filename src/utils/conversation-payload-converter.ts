/**
 * Converter utilities to convert ChatResponse payload from conversation API
 * to ContentPayload | DataPayload | ControlPayload format used in ai.ts
 */

import type {
	ContentPayload,
	ControlPayload,
	DataPayload,
	ListItem,
	TableCell,
	TableColumn,
} from '@/types/ai';
import type { ChatResponseRawPayload } from '@/types/conversation';

/**
 * Convert raw API columns to TableColumn format
 */
function convertColumns(
	columns?: Array<{ key: string; label: string }>,
): ReadonlyArray<TableColumn> | undefined {
	if (!columns || columns.length === 0) return undefined;

	return columns.map((col) => ({
		key: col.key,
		label: col.label,
		type: 'string' as const, // Default type, could be inferred from data
	}));
}

/**
 * Convert raw API results to table rows format
 */
function convertResultsToRows(
	results?: unknown[],
): ReadonlyArray<Record<string, TableCell>> | undefined {
	if (!results || results.length === 0) return undefined;

	return results.map((result) => {
		if (typeof result === 'object' && result !== null) {
			const row: Record<string, TableCell> = {};
			for (const [key, value] of Object.entries(result)) {
				row[key] = value as TableCell;
			}
			return row;
		}
		return {};
	});
}

/**
 * Convert raw API results to ListItem format (if applicable)
 */
function convertResultsToList(
	results?: unknown[],
): { items: ReadonlyArray<ListItem>; total: number } | undefined {
	if (!results || results.length === 0) return undefined;

	const items: ListItem[] = results.map((result, index) => {
		if (typeof result === 'object' && result !== null) {
			const obj = result as Record<string, unknown>;
			return {
				id: (obj.id as string) || `item-${index}`,
				title: (obj.title as string) || (obj.name as string) || String(obj.id || index),
				description: (obj.description as string) || undefined,
				thumbnailUrl: (obj.thumbnailUrl as string) || (obj.imageUrl as string) || undefined,
				entity: (obj.entity as 'room' | 'post' | 'room_seeking_post') || undefined,
				path: (obj.path as string) || undefined,
				externalUrl: (obj.externalUrl as string) || undefined,
				extra: obj.extra as Record<string, string | number | boolean> | undefined,
			};
		}
		return {
			id: `item-${index}`,
			title: String(result),
		};
	});

	return { items, total: items.length };
}

/**
 * Convert CONTROL mode payload
 */
function convertControlPayload(
	mode: 'CLARIFY' | 'ERROR',
	rawPayload: ChatResponseRawPayload,
): ControlPayload {
	const controlPayload: ControlPayload = {
		mode,
	};

	if (mode === 'CLARIFY' && rawPayload.questions) {
		controlPayload.questions = rawPayload.questions as ReadonlyArray<string>;
	}

	if (mode === 'ERROR') {
		if (rawPayload.details) {
			controlPayload.details = rawPayload.details as string;
		}
		if (rawPayload.code) {
			controlPayload.code = rawPayload.code as string;
		}
	}

	return controlPayload;
}

/**
 * Convert CONTENT mode payload
 */
function convertContentPayload(rawPayload: ChatResponseRawPayload): ContentPayload {
	const contentPayload: ContentPayload = {
		mode: 'CONTENT',
	};

	if (rawPayload.stats && Array.isArray(rawPayload.stats)) {
		contentPayload.stats = rawPayload.stats as ReadonlyArray<{
			label: string;
			value: number;
			unit?: string;
		}>;
	}

	return contentPayload;
}

/**
 * Convert DATA mode payload (TABLE, LIST, CHART, INSIGHT)
 * biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Necessary conversion logic
 */
function convertDataPayload(
	mode: 'TABLE' | 'LIST' | 'CHART' | 'INSIGHT',
	rawPayload: ChatResponseRawPayload,
): DataPayload {
	const dataPayload: DataPayload = {
		mode: mode === 'INSIGHT' ? 'CHART' : mode,
	};

	// Convert table data
	if (rawPayload.columns && rawPayload.results) {
		const columns = convertColumns(rawPayload.columns);
		const rows = convertResultsToRows(rawPayload.results);

		if (columns && rows) {
			dataPayload.table = {
				columns,
				rows,
				previewLimit: rawPayload.previewLimit as number | undefined,
			};
		}
	}

	// Convert list data
	if (mode === 'LIST' && rawPayload.results) {
		const list = convertResultsToList(rawPayload.results);
		if (list) {
			dataPayload.list = list;
		}
	}

	// Handle chart data
	if ((mode === 'CHART' || mode === 'INSIGHT') && rawPayload.chart) {
		const chart = rawPayload.chart as {
			url?: string;
			width?: number;
			height?: number;
			alt?: string;
			mimeType?: string;
			base64?: string;
		};

		if (chart.url || chart.base64) {
			dataPayload.chart = {
				mimeType: (chart.mimeType as 'image/png' | 'image/jpeg' | 'image/webp') || 'image/png',
				url: chart.url,
				base64: chart.base64,
				width: chart.width || 800,
				height: chart.height || 600,
				alt: chart.alt,
			};
		}
	}

	return dataPayload;
}

/**
 * Convert ChatResponseRawPayload to ContentPayload | DataPayload | ControlPayload
 */
export function convertChatResponsePayload(
	rawPayload?: ChatResponseRawPayload,
): ContentPayload | DataPayload | ControlPayload | undefined {
	if (!rawPayload || !rawPayload.mode) return undefined;

	const mode = rawPayload.mode;

	switch (mode) {
		case 'CLARIFY':
		case 'ERROR':
			return convertControlPayload(mode, rawPayload);
		case 'CONTENT':
			return convertContentPayload(rawPayload);
		case 'TABLE':
		case 'LIST':
		case 'CHART':
		case 'INSIGHT':
			return convertDataPayload(mode, rawPayload);
		default:
			return undefined;
	}
}
