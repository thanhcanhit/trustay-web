"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useChatStore } from "@/stores/chat.store";
import { useMemo, useEffect } from "react";
import { format } from 'date-fns';

export function ChatList() {
  const conversationsObj = useChatStore((state) => state.conversations);
  const setCurrentConversationId = useChatStore((state) => state.setCurrentConversationId);
  const loadConversations = useChatStore((state) => state.loadConversations);
  const markAllRead = useChatStore((state) => state.markAllRead);
  const currentCoversationId = useChatStore((state) => state.currentConversationId);

  const conversations = useMemo(() => Object.values(conversationsObj), [conversationsObj]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  return (
    <div className="w-1/3 border-r pt-2 overflow-y-auto">
      <div className="px-4 mb-2">
        <Input placeholder="Tìm kiếm hoặc bắt đầu cuộc trò chuyện mới" />
      </div>
      <ul>
        {conversations.map((convo) => {
          const lastMessage = convo.lastMessage;
          const counterpart = convo.counterpart;
          const displayName = `${counterpart.firstName} ${counterpart.lastName}`;
          const isSelected = convo.conversationId === currentCoversationId;
          return (
            <li
              key={convo.conversationId}
              className={`flex items-center p-2 hover:bg-gray-100 cursor-pointer ${isSelected ? 'bg-gray-200' : ''}`}
              onClick={() => {
                console.log('Clicking conversation:', convo.conversationId);
                setCurrentConversationId(convo.conversationId);
                markAllRead(convo.conversationId);
              }}>
              <Avatar>
                <AvatarImage src={counterpart.avatarUrl || undefined} />
                <AvatarFallback>{counterpart.firstName.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="ml-3 flex-1 line-clamp-1">
                <p className={`font-semibold ${convo.unreadCount && convo.unreadCount > 0 ? 'font-bold' : ''}`}>{displayName}</p>
                <p className={`text-sm text-gray-500 truncate ${convo.unreadCount && convo.unreadCount > 0 ? 'font-bold text-black' : ''}`}>
                  {lastMessage?.content}
                </p>
              </div>
              <div className="flex flex-col items-end text-xs text-gray-400">
                <p className="mb-1">{lastMessage?.sentAt ? format(new Date(lastMessage.sentAt), 'HH:mm') : ''}</p>
                {convo.unreadCount && convo.unreadCount > 0 ? (
                  <span className="flex items-center justify-center w-4 h-4 bg-red-500 text-white rounded-full text-xs">
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