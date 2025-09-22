"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChatStore } from "@/stores/chat.store";
import { useUserStore } from "@/stores/userStore";
import { useState, useEffect, useRef, useMemo } from "react";
import { format, isSameDay } from 'date-fns';
import { Check, CheckCheck } from 'lucide-react';
import { MESSAGE_TYPES, SYSTEM_MESSAGE_TYPES, MESSAGE_CONTENT_MAP } from '@/constants/chat.constants';
import type { SystemMessageType } from '@/constants/chat.constants';
import Image from "next/image";

export function ChatConversation() {
  const getConversation = useChatStore((state) => state.getConversation);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const setCurrentUserId = useChatStore((state) => state.setCurrentUserId);
  const currentConversationId = useChatStore((state) => state.currentConversationId);
  const byConversation = useChatStore((state) => state.byConversation);
  const { user } = useUserStore();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  const isSystemMessage = (messageType: string) => {
    return SYSTEM_MESSAGE_TYPES.includes(messageType as SystemMessageType);
  };

  const getSystemMessageContent = (messageType: string, originalContent: string) => {
    if (messageType in MESSAGE_CONTENT_MAP) {
      return MESSAGE_CONTENT_MAP[messageType as keyof typeof MESSAGE_CONTENT_MAP];
    }
    return originalContent;
  };

  const conversation = currentConversationId
    ? getConversation(currentConversationId)
    : null;

  const messages = useMemo(() => {
    return currentConversationId
      ? (byConversation[currentConversationId] ?? [])
      : [];
  }, [currentConversationId, byConversation]);

  // Set current user ID in chat store when user is available
  useEffect(() => {
    if (user?.id) {
      setCurrentUserId(user.id);
    }
  }, [user?.id, setCurrentUserId]);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    if (shouldAutoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, shouldAutoScroll]);

  // Handle scroll detection to pause auto-scroll when user scrolls up
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;
      setShouldAutoScroll(isNearBottom);
    }
  };

  console.log('ChatConversation render:', {
    currentConversationId,
    conversation,
    messagesCount: messages.length,
    messages
  });

  const handleSendMessage = () => {
    if (message.trim() && conversation && user) {
      sendMessage({
        content: message,
        recipientId: conversation.counterpart.id,
        conversationId: conversation.conversationId,
        attachmentUrls: [],
        type: MESSAGE_TYPES.TEXT,
      });
      setMessage("");
      // Enable auto-scroll when sending message
      setShouldAutoScroll(true);
    }
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center pt-2">
        <div className="flexjustify-center items-center p-4">
          <Image
            src="/laptop.png"
            alt="Empty chat"
            width={300}
            height={300}
            className="mx-auto"
          />
          <p className="font-semibold">Chào mừng bạn đến với Trustay Chat</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col pt-2 min-h-0">
      <div
        ref={messagesContainerRef}
        className="flex-1 p-4 overflow-y-auto"
        onScroll={handleScroll}>
        {messages.map((msg, index) => {
          const showDateSeparator = index === 0 || !isSameDay(new Date(messages[index - 1].sentAt), new Date(msg.sentAt));
          return (
            <div key={msg.id || `message-${index}`}>
              {showDateSeparator && (
                <div className="text-center text-sm text-gray-500 my-2">
                  {format(new Date(msg.sentAt), 'eeee, dd MMMM, yyyy')}
                </div>
              )}
              {isSystemMessage(msg.type) ? (
                <div className="flex justify-center my-3">
                  <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-2 rounded-lg text-sm max-w-sm text-center">
                    <p>{getSystemMessageContent(msg.type, msg.content)}</p>
                    <div className="text-xs text-blue-600 mt-1">
                      {format(new Date(msg.sentAt), 'HH:mm')}
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className={`flex my-2 items-end ${msg.senderId === user?.id ? "justify-end" : ""}`}>
                  <div
                    className={`p-2 rounded-lg max-w-xs md:max-w-md ${
                      msg.senderId === user?.id
                        ? "bg-primary text-white"
                        : "bg-gray-200"
                    }`}>
                    <p>{msg.content}</p>
                  </div>
                  <div className="text-xs text-gray-400 ml-2 flex items-center">
                    {format(new Date(msg.sentAt), 'HH:mm')}
                    {msg.senderId === user?.id && (
                      <span className="ml-1">
                        {msg.readAt ? <CheckCheck size={16} className="text-blue-500" /> : <Check size={16} />}
                      </span>
                    )}
                  </div>
                  {msg.senderId !== user?.id && !msg.readAt && (
                    <div className="w-2 h-2 bg-red-500 rounded-full ml-1 self-center" />
                  )}
                </div>
              )}
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t">
        <div className="flex w-full items-center space-x-2">
          <Input
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <Button type="submit" onClick={handleSendMessage}>
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}