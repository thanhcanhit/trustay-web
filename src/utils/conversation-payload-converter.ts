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

	// Handle LIST mode - check if list structure already exists
	if (mode === 'LIST') {
		if (rawPayload.list && typeof rawPayload.list === 'object' && 'items' in rawPayload.list) {
			// List structure already exists, convert items to ListItem format
			const listData = rawPayload.list as { items: unknown[]; total?: number };
			const convertedItems = convertResultsToList(listData.items);
			if (convertedItems) {
				dataPayload.list = {
					items: convertedItems.items,
					total: listData.total ?? convertedItems.total,
				};
			}
		} else if (rawPayload.results) {
			// Convert from results array
			const list = convertResultsToList(rawPayload.results);
			if (list) {
				dataPayload.list = list;
			}
		}
	}

	// Handle TABLE mode - check if table structure already exists
	if (mode === 'TABLE') {
		if (
			rawPayload.table &&
			typeof rawPayload.table === 'object' &&
			'columns' in rawPayload.table &&
			'rows' in rawPayload.table
		) {
			// Table structure already exists, use it directly
			const tableData = rawPayload.table as {
				columns: Array<{ key: string; label: string }>;
				rows: unknown[];
				previewLimit?: number;
			};
			const columns = convertColumns(tableData.columns);
			const rows = convertResultsToRows(tableData.rows);
			if (columns && rows) {
				dataPayload.table = {
					columns,
					rows,
					previewLimit: tableData.previewLimit,
				};
			}
		} else if (rawPayload.columns && rawPayload.results) {
			// Convert from columns and results
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
 * Check if payload is already in converted format (has proper structure)
 */
function isAlreadyConverted(
	payload: unknown,
): payload is ContentPayload | DataPayload | ControlPayload {
	if (!payload || typeof payload !== 'object') return false;

	// Check if it has mode and proper structure
	if ('mode' in payload) {
		const mode = (payload as { mode: string }).mode;

		// Check for DataPayload structure
		if (mode === 'LIST' || mode === 'TABLE' || mode === 'CHART') {
			const dataPayload = payload as DataPayload;
			// If it already has list/table/chart structure, it's converted
			return !!(dataPayload.list || dataPayload.table || dataPayload.chart);
		}

		// Check for ContentPayload structure
		if (mode === 'CONTENT') {
			const contentPayload = payload as ContentPayload;
			return 'stats' in contentPayload;
		}

		// Check for ControlPayload structure
		if (mode === 'CLARIFY' || mode === 'ERROR') {
			const controlPayload = payload as ControlPayload;
			return !!(controlPayload.questions || controlPayload.code || controlPayload.details);
		}
	}

	return false;
}

/**
 * Convert ChatResponseRawPayload to ContentPayload | DataPayload | ControlPayload
 */
export function convertChatResponsePayload(
	rawPayload?: ChatResponseRawPayload,
): ContentPayload | DataPayload | ControlPayload | undefined {
	if (!rawPayload || !rawPayload.mode) return undefined;

	// If payload is already in converted format, return as-is
	if (isAlreadyConverted(rawPayload)) {
		return rawPayload as ContentPayload | DataPayload | ControlPayload;
	}

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
