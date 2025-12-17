"use client";

import type { Conversation } from '@/types/conversation';
import { ConversationItem } from './conversation-item';
import { Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ConversationListProps {
	conversations: Conversation[];
	currentConversationId: string | null;
	loading?: boolean;
	onSelect: (id: string) => void;
	onDelete: (id: string) => void;
	onRename: (id: string, title: string) => void;
}

export function ConversationList({
	conversations,
	currentConversationId,
	loading = false,
	onSelect,
	onDelete,
	onRename,
}: ConversationListProps) {
	if (loading) {
		return (
			<div className="flex items-center justify-center p-4">
				<Loader2 className="h-5 w-5 animate-spin text-gray-400" />
			</div>
		);
	}

	if (conversations.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center p-6 text-center">
				<p className="text-sm text-gray-500">Chưa có cuộc hội thoại nào</p>
				<p className="text-xs text-gray-400 mt-1">Bắt đầu một cuộc trò chuyện mới</p>
			</div>
		);
	}

	return (
		<div className="flex-1 flex flex-col overflow-hidden">
			<ScrollArea className="flex-1">
				<div className="p-2 space-y-1">
					{conversations.map((conversation) => (
						<ConversationItem
							key={conversation.id}
							conversation={conversation}
							isActive={conversation.id === currentConversationId}
							onSelect={() => onSelect(conversation.id)}
							onDelete={() => onDelete(conversation.id)}
							onRename={(title) => onRename(conversation.id, title)}
						/>
					))}
				</div>
			</ScrollArea>
		</div>
	);
}



