"use client";

import { cn } from '@/lib/utils';
import { Brain } from 'lucide-react';
import type { AIHistoryMessage, ListItem, TableColumn, TableCell } from '@/types';
import { AITypingIndicator } from './ai-typing-indicator';
import { AIMessageMarkdown } from './ai-message-markdown';
import { AIListPreview } from './ai-list-preview';
import { AITablePreview } from './ai-table-preview';
import { AIControlBlock } from './ai-control-block';
import { PhotoView } from 'react-photo-view';

type AssistantResultMessage = AIHistoryMessage & { sql?: string; results?: Array<Record<string, unknown>>; count?: number };

type AssistantEnrichedMessage = AIHistoryMessage & {
	contentStats?: ReadonlyArray<{ label: string; value: number; unit?: string }>;
	dataList?: { items: ReadonlyArray<ListItem>; total: number };
	dataTable?: { columns: ReadonlyArray<TableColumn>; rows: ReadonlyArray<Record<string, TableCell>>; previewLimit?: number };
	chart?: { url?: string; width: number; height: number; alt?: string };
	controlQuestions?: ReadonlyArray<string>;
	errorCode?: string;
	errorDetails?: string;
	sql?: string;
	results?: Array<Record<string, unknown>>;
	count?: number;
};

const hasErrorInfo = (m: AIHistoryMessage | AssistantEnrichedMessage): m is AssistantEnrichedMessage & { errorCode?: string; errorDetails?: string } => {
	return ('errorCode' in m && typeof m.errorCode === 'string') || ('errorDetails' in m && typeof m.errorDetails === 'string');
};

const hasContentStats = (m: AIHistoryMessage | AssistantEnrichedMessage): m is AssistantEnrichedMessage & { contentStats: ReadonlyArray<{ label: string; value: number; unit?: string }> } => {
	return 'contentStats' in m && Array.isArray(m.contentStats);
};

const hasDataList = (m: AIHistoryMessage | AssistantEnrichedMessage): m is AssistantEnrichedMessage & { dataList: { items: ReadonlyArray<ListItem>; total: number } } => {
	return 'dataList' in m && m.dataList !== undefined && Array.isArray(m.dataList.items);
};

const hasDataTable = (m: AIHistoryMessage | AssistantEnrichedMessage): m is AssistantEnrichedMessage & { dataTable: { columns: ReadonlyArray<TableColumn>; rows: ReadonlyArray<Record<string, TableCell>>; previewLimit?: number } } => {
	return 'dataTable' in m && m.dataTable !== undefined && Array.isArray(m.dataTable.columns) && Array.isArray(m.dataTable.rows);
};

const hasChart = (m: AIHistoryMessage | AssistantEnrichedMessage): m is AssistantEnrichedMessage & { chart: { url?: string; width: number; height: number; alt?: string } } => {
	return 'chart' in m && m.chart !== undefined && typeof m.chart.width === 'number' && typeof m.chart.height === 'number';
};

const hasControlQuestions = (m: AIHistoryMessage | AssistantEnrichedMessage): m is AssistantEnrichedMessage & { controlQuestions: ReadonlyArray<string> } => {
	return 'controlQuestions' in m && Array.isArray(m.controlQuestions);
};

interface AIMessageItemProps {
	message: AIHistoryMessage | AssistantEnrichedMessage;
	onOpenTable: (node: React.ReactNode) => void;
	onAsk: (question: string) => void;
}

export function AIMessageItem({ message, onOpenTable, onAsk }: AIMessageItemProps) {
	return (
		<div className={cn('flex items-start gap-2', message.role === 'user' ? 'justify-end' : 'justify-start')}>
			{message.role === 'assistant' && (
				<div className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
					<Brain className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
				</div>
			)}
			<div className={cn('max-w-[90%] sm:max-w-[85%] rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 break-words text-xs sm:text-sm', message.role === 'user' ? 'bg-primary text-white' : 'bg-gray-100')}>
				{message.id === 'typing' ? (
					<AITypingIndicator />
				) : message.role === 'assistant' ? (
					<div className="prose prose-sm max-w-none [&_*]:text-xs [&_*]:sm:text-sm">
						{message.content && (
							<AIMessageMarkdown
								content={message.content}
								onOpenTable={onOpenTable}
							/>
						)}
					</div>
				) : (
					<span className="whitespace-pre-wrap text-xs sm:text-sm">{message.content}</span>
				)}
				{hasContentStats(message) && (
					<div className="mt-1.5 sm:mt-2 flex flex-wrap gap-1 sm:gap-2">
						{message.contentStats.map((s, idx) => (
							<span key={idx} className="text-[10px] sm:text-xs bg-white/80 border rounded-full px-1.5 sm:px-2 py-0.5 sm:py-1">
								{s.label}: {s.value}{s.unit ? s.unit : ''}
							</span>
						))}
					</div>
				)}
				{hasDataList(message) && (
					<AIListPreview items={message.dataList.items} onOpenFull={(node) => { if (node) { onOpenTable(node); } }} />
				)}
				{hasDataTable(message) && (
					<AITablePreview
						columns={message.dataTable.columns}
						rows={message.dataTable.rows}
						previewLimit={message.dataTable.previewLimit}
						onOpenFull={(node) => { onOpenTable(node); }}
					/>
				)}
				{hasChart(message) && message.chart.url && (
					<div className="mt-2 sm:mt-3">
						<PhotoView src={message.chart.url}>
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img src={message.chart.url} alt={message.chart.alt || 'Chart'} width={message.chart.width} height={message.chart.height} className="max-w-full h-auto rounded border" />
						</PhotoView>
					</div>
				)}
				{(hasControlQuestions(message) || hasErrorInfo(message)) && (
					<AIControlBlock
						questions={hasControlQuestions(message) ? message.controlQuestions : undefined}
						errorCode={hasErrorInfo(message) ? message.errorCode : undefined}
						errorDetails={hasErrorInfo(message) ? message.errorDetails : undefined}
						onAsk={onAsk}
					/>
				)}
				{/* SQL details - commented out */}
				{/* {hasAssistantResult(message) && message.sql && (
					<details className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs">
						<summary className="cursor-pointer inline-flex items-center gap-0.5 sm:gap-1">
							<ChevronDown size={10} className="sm:w-3 sm:h-3" /> Chi tiết kết quả
						</summary>
						<div className="mt-1.5 sm:mt-2">
							<div className="text-gray-600 mb-0.5 sm:mb-1 text-[10px] sm:text-xs">SQL:</div>
							<pre className="bg-white border rounded p-1.5 sm:p-2 overflow-auto max-h-32 sm:max-h-40 whitespace-pre-wrap text-gray-700 text-[10px] sm:text-xs">{message.sql}</pre>
							{message.results && Array.isArray(message.results) && (
								<div className="mt-1.5 sm:mt-2">
									<div className="text-gray-600 mb-0.5 sm:mb-1 text-[10px] sm:text-xs">Kết quả {message.count ?? message.results.length}:</div>
									<pre className="bg-white border rounded p-1.5 sm:p-2 overflow-auto max-h-40 sm:max-h-48 whitespace-pre-wrap text-gray-700 text-[10px] sm:text-xs">{JSON.stringify(message.results, null, 2)}</pre>
								</div>
							)}
						</div>
					</details>
				)} */}
			</div>
		</div>
	);
}





