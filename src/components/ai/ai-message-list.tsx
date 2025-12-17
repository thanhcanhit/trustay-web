"use client";

import { useRef, useEffect } from 'react';
import type { AIHistoryMessage } from '@/types';
import { AIMessageItem } from './ai-message-item';
import { PhotoProvider } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';

type AssistantEnrichedMessage = AIHistoryMessage & {
	contentStats?: ReadonlyArray<{ label: string; value: number; unit?: string }>;
	dataList?: { items: ReadonlyArray<unknown>; total: number };
	dataTable?: { columns: ReadonlyArray<unknown>; rows: ReadonlyArray<Record<string, unknown>>; previewLimit?: number };
	chart?: { url?: string; width: number; height: number; alt?: string };
	controlQuestions?: ReadonlyArray<string>;
	errorCode?: string;
	errorDetails?: string;
	sql?: string;
	results?: Array<Record<string, unknown>>;
	count?: number;
};

interface AIMessageListProps {
	messages: Array<AIHistoryMessage | AssistantEnrichedMessage>;
	onOpenTable: (node: React.ReactNode) => void;
	onAsk: (question: string) => void;
	shouldAutoScroll?: boolean;
}

export function AIMessageList({ messages, onOpenTable, onAsk, shouldAutoScroll = true }: AIMessageListProps) {
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const messagesContainerRef = useRef<HTMLDivElement>(null);
	const shouldAutoScrollRef = useRef(shouldAutoScroll);

	// Update shouldAutoScrollRef when prop changes
	useEffect(() => {
		shouldAutoScrollRef.current = shouldAutoScroll;
	}, [shouldAutoScroll]);

	// Auto-scroll to bottom when new messages arrive
	useEffect(() => {
		if (!shouldAutoScrollRef.current || !messagesEndRef.current || !messagesContainerRef.current) return;

		const container = messagesContainerRef.current;
		const scrollToBottom = () => {
			messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
		};

		// Small delay to ensure DOM is updated
		const timeoutId = setTimeout(scrollToBottom, 100);
		return () => clearTimeout(timeoutId);
	}, [messages]);

	// Track scroll position to disable auto-scroll when user scrolls up
	useEffect(() => {
		const container = messagesContainerRef.current;
		if (!container) return;

		const handleScroll = () => {
			if (!container) return;
			const { scrollTop, scrollHeight, clientHeight } = container;
			const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
			shouldAutoScrollRef.current = isNearBottom;
		};

		container.addEventListener('scroll', handleScroll, { passive: true });
		return () => container.removeEventListener('scroll', handleScroll);
	}, []);

	return (
		<div 
			ref={messagesContainerRef}
			className="flex-1 overflow-y-auto overflow-x-hidden p-2 sm:p-3 space-y-2"
			style={{ 
				scrollBehavior: 'smooth',
				WebkitOverflowScrolling: 'touch',
			}}
		>
			<PhotoProvider>
				{messages.map((m) => (
					<AIMessageItem
						key={m.id}
						message={m}
						onOpenTable={onOpenTable}
						onAsk={onAsk}
					/>
				))}
				<div ref={messagesEndRef} style={{ height: '1px' }} />
			</PhotoProvider>
		</div>
	);
}





