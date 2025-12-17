"use client";

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { Conversation } from '@/types/conversation';
import { Trash2, Edit2, X } from 'lucide-react';
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ConversationItemProps {
	conversation: Conversation;
	isActive: boolean;
	onSelect: () => void;
	onDelete: () => void;
	onRename: (title: string) => void;
}

/**
 * Format date to relative time or date string
 */
function formatConversationDate(dateString: string | null): string {
	if (!dateString) return 'Chưa có tin nhắn';
	
	const date = new Date(dateString);
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffMins = Math.floor(diffMs / 60000);
	const diffHours = Math.floor(diffMs / 3600000);
	const diffDays = Math.floor(diffMs / 86400000);
	
	if (diffMins < 1) return 'Vừa xong';
	if (diffMins < 60) return `${diffMins} phút trước`;
	if (diffHours < 24) return `${diffHours} giờ trước`;
	if (diffDays < 7) return `${diffDays} ngày trước`;
	
	// Return formatted date
	return date.toLocaleDateString('vi-VN', {
		day: '2-digit',
		month: '2-digit',
		year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
	});
}

export function ConversationItem({
	conversation,
	isActive,
	onSelect,
	onDelete,
	onRename,
}: ConversationItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(conversation.title);

	const handleRename = () => {
		if (editTitle.trim() && editTitle.trim() !== conversation.title) {
			onRename(editTitle.trim());
		} else {
			setEditTitle(conversation.title);
		}
		setIsEditing(false);
	};

	const handleCancelEdit = () => {
		setEditTitle(conversation.title);
		setIsEditing(false);
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			handleRename();
		} else if (e.key === 'Escape') {
			handleCancelEdit();
		}
	};

	return (
		<ContextMenu>
			<ContextMenuTrigger asChild>
				<div
					className={cn(
						'group relative flex items-start gap-2 p-2 sm:p-3 rounded-lg cursor-pointer transition-colors',
						'hover:bg-gray-50 dark:hover:bg-gray-800',
						isActive && 'bg-primary/10 hover:bg-primary/15',
					)}
					onClick={onSelect}
				>
					<div className="flex-1 min-w-0 overflow-hidden">
						{isEditing ? (
							<div className="flex items-center gap-1">
								<Input
									value={editTitle}
									onChange={(e) => setEditTitle(e.target.value)}
									onBlur={handleRename}
									onKeyDown={handleKeyDown}
									className="h-7 text-xs sm:text-sm flex-1 min-w-0"
									autoFocus
									onClick={(e) => e.stopPropagation()}
								/>
								<Button
									variant="ghost"
									size="icon"
									className="h-7 w-7 flex-shrink-0"
									onClick={(e) => {
										e.stopPropagation();
										handleRename();
									}}
								>
									<X className="h-3 w-3" />
								</Button>
							</div>
						) : (
							<>
								<div
									className={cn(
										'text-xs sm:text-sm font-medium mb-0.5 break-words line-clamp-2',
										isActive && 'text-primary',
									)}
									title={conversation.title}
								>
									{conversation.title}
								</div>
								<div className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-500">
									<span>{formatConversationDate(conversation.lastMessageAt)}</span>
									{conversation.messageCount > 0 && (
										<span>• {conversation.messageCount} tin nhắn</span>
									)}
								</div>
							</>
						)}
					</div>
					
					{!isEditing && (
						<Button
							variant="ghost"
							size="icon"
							className={cn(
								'h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity',
								'hover:bg-destructive/10 hover:text-destructive',
								'flex-shrink-0'
							)}
							onClick={(e) => {
								e.stopPropagation();
								onDelete();
							}}
							aria-label="Xóa cuộc hội thoại"
						>
							<Trash2 className="h-3.5 w-3.5" />
						</Button>
					)}
					
					{!isEditing && (
						<ContextMenuContent>
							<ContextMenuItem
								onClick={(e) => {
									e.stopPropagation();
									setIsEditing(true);
								}}
							>
								<Edit2 className="mr-2 h-4 w-4" />
								Đổi tên
							</ContextMenuItem>
							<ContextMenuItem
								onClick={(e) => {
									e.stopPropagation();
									onDelete();
								}}
								className="text-destructive focus:text-destructive"
							>
								<Trash2 className="mr-2 h-4 w-4" />
								Xóa
							</ContextMenuItem>
						</ContextMenuContent>
					)}
				</div>
			</ContextMenuTrigger>
		</ContextMenu>
	);
}






