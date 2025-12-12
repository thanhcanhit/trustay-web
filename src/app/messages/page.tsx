"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useChatStore } from "@/stores/chat.store";
import { useMemo, useEffect } from "react";
import { format } from 'date-fns';
import { MESSAGE_TYPES, MESSAGE_CONTENT_MAP } from '@/constants/chat.constants';
import { Image as ImageIcon, ArrowLeft } from 'lucide-react';
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

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

export default function MessagesPage() {
  const router = useRouter();
  const conversationsObj = useChatStore((state) => state.conversations);
  const loadConversations = useChatStore((state) => state.loadConversations);
  const markAllRead = useChatStore((state) => state.markAllRead);

  const conversations = useMemo(() => Object.values(conversationsObj), [conversationsObj]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const handleConversationClick = (conversationId: string) => {
    markAllRead(conversationId);
    router.push(`/messages/${conversationId}`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-primary text-white px-4 py-3 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="text-white hover:bg-primary-600"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-lg font-semibold flex-1">Tin nhắn</h1>
      </div>

      {/* Search */}
      <div className="p-4 border-b">
        <Input placeholder="Tìm kiếm hoặc bắt đầu cuộc trò chuyện mới" />
      </div>

      {/* Conversations List */}
      <ul className="divide-y">
        {conversations.map((convo) => {
          const lastMessage = convo.lastMessage;
          const counterpart = convo.counterpart;
          const displayName = `${counterpart.firstName} ${counterpart.lastName}`;
          const messagePreview = getMessagePreview(lastMessage);

          return (
            <li
              key={convo.conversationId}
              className="flex items-center p-4 hover:bg-gray-50 active:bg-gray-100 cursor-pointer"
              onClick={() => handleConversationClick(convo.conversationId)}
            >
              <Avatar className="h-14 w-14">
                <AvatarImage src={counterpart.avatarUrl || undefined} />
                <AvatarFallback>{counterpart.firstName.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="ml-3 flex-1 min-w-0">
                <p className={`font-semibold truncate ${convo.unreadCount && convo.unreadCount > 0 ? 'font-bold' : ''}`}>
                  {displayName}
                </p>
                <p className={`text-sm text-gray-500 truncate flex items-center ${convo.unreadCount && convo.unreadCount > 0 ? 'font-bold text-black' : ''}`}>
                  {messagePreview.icon}
                  {messagePreview.text}
                </p>
              </div>
              <div className="flex flex-col items-end text-xs text-gray-400 ml-2">
                <p className="mb-1">{lastMessage?.sentAt ? format(new Date(lastMessage.sentAt), 'HH:mm') : ''}</p>
                {convo.unreadCount && convo.unreadCount > 0 ? (
                  <span className="flex items-center justify-center min-w-5 h-5 px-1.5 bg-red-500 text-white rounded-full text-xs">
                    {convo.unreadCount}
                  </span>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>

      {/* Empty State */}
      {conversations.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="text-gray-400 mb-4">
            <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-gray-500 text-center">Chưa có cuộc trò chuyện nào</p>
          <p className="text-gray-400 text-sm text-center mt-2">Tin nhắn của bạn sẽ hiển thị ở đây</p>
        </div>
      )}
    </div>
  );
}
