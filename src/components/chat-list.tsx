"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "./ui/input";
import { useChatStore } from "@/stores/chat.store";
import { useMemo, useEffect } from "react";

export function ChatList() {
  const conversationsObj = useChatStore((state) => state.conversations);
  const setCurrentConversationId = useChatStore((state) => state.setCurrentConversationId);
  const loadConversations = useChatStore((state) => state.loadConversations);

  const conversations = useMemo(() => Object.values(conversationsObj), [conversationsObj]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  return (
    <div className="w-1/3 border-r pt-2 overflow-y-auto">
      <div className="px-4">
        <Input placeholder="Tìm kiếm hoặc bắt đầu cuộc trò chuyện mới" />
      </div>
      <ul>
        {conversations.map((convo) => {
          const lastMessage = convo.lastMessage;
          const counterpart = convo.counterpart;
          const displayName = `${counterpart.firstName} ${counterpart.lastName}`;
          return (
            <li
              key={convo.conversationId}
              className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                console.log('Clicking conversation:', convo.conversationId);
                setCurrentConversationId(convo.conversationId);
              }}>
              <Avatar>
                <AvatarImage src={counterpart.avatarUrl || ""} />
                <AvatarFallback>{counterpart.firstName.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="ml-3 flex-1">
                <p className="font-semibold">{displayName}</p>
                <p className="text-sm text-gray-500 truncate">
                  {lastMessage?.content}
                </p>
              </div>
              <div className="text-xs text-gray-400">
                <p>{lastMessage?.sentAt}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}