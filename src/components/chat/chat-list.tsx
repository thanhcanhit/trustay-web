"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useChatStore } from "@/stores/chat.store";
import { useMemo, useEffect } from "react";
import { format } from 'date-fns';
import { MESSAGE_TYPES, MESSAGE_CONTENT_MAP } from '@/constants/chat.constants';
import { Image as ImageIcon } from 'lucide-react';
import SizingImage from "../sizing-image";

// Helper to get preview text for last message
function getMessagePreview(lastMessage: { content: string; type: string } | undefined): { text: string; icon?: React.ReactNode } {
  if (!lastMessage) return { text: '' };

  // Handle special message types
  if (lastMessage.type === MESSAGE_TYPES.INVITATION) {
    return { text: 'Lời mời thuê', icon: <ImageIcon size={14} className="inline mr-1" /> };
  }

  if (lastMessage.type === MESSAGE_TYPES.REQUEST) {
    return { text: 'Yêu cầu thuê', icon: <ImageIcon size={14} className="inline mr-1" /> };
  }

  // Handle system messages
  if (lastMessage.type in MESSAGE_CONTENT_MAP) {
    return { text: MESSAGE_CONTENT_MAP[lastMessage.type as keyof typeof MESSAGE_CONTENT_MAP] };
  }

  // For text messages, show content
  if (lastMessage.content) {
    return { text: lastMessage.content };
  }

  // If no content, might be attachments only
  return { text: 'Đã gửi file đính kèm', icon: <ImageIcon size={14} className="inline mr-1" /> };
}

interface ChatListProps {
  onMobileSelect?: () => void;
}

export function ChatList({ onMobileSelect }: ChatListProps) {
  const conversationsObj = useChatStore((state) => state.conversations);
  const setCurrentConversationId = useChatStore((state) => state.setCurrentConversationId);
  const loadConversations = useChatStore((state) => state.loadConversations);
  const markAllRead = useChatStore((state) => state.markAllRead);
  const currentCoversationId = useChatStore((state) => state.currentConversationId);

  const conversations = useMemo(() => Object.values(conversationsObj), [conversationsObj]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const handleConversationClick = (conversationId: string) => {
    console.log('Clicking conversation:', conversationId);
    setCurrentConversationId(conversationId);
    markAllRead(conversationId);

    // Trigger mobile select callback if provided
    if (onMobileSelect) {
      onMobileSelect();
    }
  };

  return (
    <div className="w-full md:w-1/3 border-r pt-2 overflow-y-auto">
      <div className="px-4 mb-2">
        <Input placeholder="Tìm kiếm hoặc bắt đầu cuộc trò chuyện mới" />
      </div>
      <ul>
        {conversations.map((convo) => {
          const lastMessage = convo.lastMessage;
          const counterpart = convo.counterpart;
          const displayName = `${counterpart.firstName} ${counterpart.lastName}`;
          const isSelected = convo.conversationId === currentCoversationId;
          const messagePreview = getMessagePreview(lastMessage);

          return (
            <li
              key={convo.conversationId}
              className={`flex items-center p-3 hover:bg-gray-100 cursor-pointer ${isSelected ? 'bg-gray-200' : ''}`}
              onClick={() => handleConversationClick(convo.conversationId)}>
              <Avatar className="h-12 w-12">
                {counterpart.avatarUrl ? (
                  <SizingImage
                    src={counterpart.avatarUrl}
                    alt={`${counterpart.firstName} ${counterpart.lastName}`}
                    width={48}
                    height={48}
                  />
                ) : (
                  <AvatarFallback>{counterpart.firstName.charAt(0).toUpperCase()}</AvatarFallback>
                )}
              </Avatar>
              <div className="ml-3 flex-1 line-clamp-1 min-w-0">
                <p className={`font-semibold truncate ${convo.unreadCount && convo.unreadCount > 0 ? 'font-bold' : ''}`}>{displayName}</p>
                <p className={`text-sm text-gray-500 truncate flex items-center ${convo.unreadCount && convo.unreadCount > 0 ? 'font-bold text-black' : ''}`}>
                  {messagePreview.icon}
                  {messagePreview.text}
                </p>
              </div>
              <div className="flex flex-col items-end text-xs text-gray-400 ml-2">
                <p className="mb-1">{lastMessage?.sentAt ? format(new Date(lastMessage.sentAt), 'HH:mm') : ''}</p>
                {convo.unreadCount && convo.unreadCount > 0 ? (
                  <span className="flex items-center justify-center w-5 h-5 bg-red-500 text-white rounded-full text-xs">
                    {convo.unreadCount}
                  </span>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}