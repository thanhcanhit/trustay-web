"use client";

import { useChatStore } from "@/stores/chat.store";
import { useUserStore } from "@/stores/userStore";
import { useEffect, useRef, useMemo, useState } from "react";
import { format, isSameDay } from 'date-fns';
import { Check, CheckCheck } from 'lucide-react';
import { MESSAGE_TYPES, SYSTEM_MESSAGE_TYPES, MESSAGE_CONTENT_MAP } from '@/constants/chat.constants';
import type { SystemMessageType } from '@/constants/chat.constants';
import Image from "next/image";
import { InvitationRequestMessage } from "./invitation-request-message";
import { MessageInput } from "./message-input";
import { MessageAttachments } from "./message-attachments";
import { getMessageMetadata } from "@/lib/message-metadata";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { UserProfileModal } from "../profile/user-profile-modal";

export function ChatConversation() {
  const getConversation = useChatStore((state) => state.getConversation);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const setCurrentUserId = useChatStore((state) => state.setCurrentUserId);
  const currentConversationId = useChatStore((state) => state.currentConversationId);
  const byConversation = useChatStore((state) => state.byConversation);
  const { user } = useUserStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

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
    const msgs = currentConversationId
      ? (byConversation[currentConversationId] ?? [])
      : [];

    // Attach metadata from local storage to messages
    return msgs.map(msg => {
      const metadata = getMessageMetadata(msg.id);
      return metadata ? { ...msg, metadata } : msg;
    });
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

  const handleSendMessage = async (content: string, attachmentFiles: File[]) => {
    if ((!content.trim() && attachmentFiles.length === 0) || !conversation || !user) {
      console.log('Cannot send message: missing content or conversation');
      return;
    }

    console.log('Sending message:', { content, attachmentFiles, conversationId: conversation.conversationId });

    try {
      await sendMessage({
        content,
        recipientId: conversation.counterpart.id,
        conversationId: conversation.conversationId,
        attachmentFiles,
        type: MESSAGE_TYPES.TEXT,
      });

      console.log('Message sent successfully');

      // Enable auto-scroll when sending message
      setShouldAutoScroll(true);
    } catch (error) {
      console.error('Error sending message:', error);
      throw error; // Re-throw to let MessageInput handle it
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
          const isOwnMessage = msg.senderId === user?.id;
          const isInvitationOrRequest = msg.type === MESSAGE_TYPES.INVITATION || msg.type === MESSAGE_TYPES.REQUEST;

          return (
            <div key={msg.id || `message-${index}`}>
              {showDateSeparator && (
                <div className="text-center text-sm text-gray-500 my-2">
                  {format(new Date(msg.sentAt), 'eeee, dd MMMM, yyyy')}
                </div>
              )}
              {isInvitationOrRequest ? (
                // Render invitation/request as user message with card
                <div className={`flex my-2 items-end ${isOwnMessage ? "justify-end" : ""}`}>
                  <div className="flex flex-col gap-1">
                    <InvitationRequestMessage message={msg} isOwnMessage={isOwnMessage} />
                    <div className={`text-xs text-gray-400 flex items-center ${isOwnMessage ? 'justify-end' : ''}`}>
                      {format(new Date(msg.sentAt), 'HH:mm')}
                      {isOwnMessage && (
                        <span className="ml-1">
                          {msg.readAt ? <CheckCheck size={16} className="text-blue-500" /> : <Check size={16} />}
                        </span>
                      )}
                    </div>
                  </div>
                  {!isOwnMessage && !msg.readAt && (
                    <div className="w-2 h-2 bg-red-500 rounded-full ml-1 self-center" />
                  )}
                </div>
              ) : isSystemMessage(msg.type) ? (
                // Render other system messages centered
                <div className="flex justify-center my-3">
                  <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-2 rounded-lg text-sm max-w-sm text-center">
                    <p>{getSystemMessageContent(msg.type, msg.content)}</p>
                    <div className="text-xs text-blue-600 mt-1">
                      {format(new Date(msg.sentAt), 'HH:mm')}
                    </div>
                  </div>
                </div>
              ) : (
                // Render normal text messages
                <div className={`flex my-2 gap-2 ${isOwnMessage ? "justify-end" : ""}`}>
                  {!isOwnMessage && (
                    <div 
                      className="flex-shrink-0 cursor-pointer"
                      onClick={() => {
                        setSelectedUserId(conversation.counterpart.id);
                        setProfileModalOpen(true);
                      }}
                    >
                      <Avatar className="rounded-lg hover:ring-2 hover:ring-primary transition-all">
                        <AvatarImage
                          src={conversation.counterpart.avatarUrl || ""}
                          alt={conversation.counterpart.lastName}
                        />
                        <AvatarFallback>{conversation.counterpart.lastName.charAt(0)}{conversation.counterpart.firstName.charAt(0)}  </AvatarFallback>
                      </Avatar>
                    </div>
                  )}

                  {/* Message content container */}
                  <div className={`flex flex-col gap-1 ${isOwnMessage ? "items-end" : "items-start"} max-w-xs overflow-hidden`}>
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="w-full max-w-full">
                        <MessageAttachments attachments={msg.attachments} />
                      </div>
                    )}

                    {msg.content && (
                      <div
                        className={`p-2 rounded-lg break-words overflow-wrap-anywhere w-full ${
                          isOwnMessage
                            ? "bg-primary text-white"
                            : "bg-gray-200"
                        }`}>
                        <p className="whitespace-pre-wrap break-words overflow-wrap-anywhere">{msg.content}</p>
                      </div>
                    )}

                    {/* Timestamp and read status */}
                    <div className={`text-xs text-gray-400 flex items-center gap-1 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
                      {format(new Date(msg.sentAt), 'HH:mm')}
                      {isOwnMessage && (
                        <span>
                          {msg.readAt ? <CheckCheck size={16} className="text-blue-500" /> : <Check size={16} />}
                        </span>
                      )}
                      {!isOwnMessage && !msg.readAt && (
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                      )}
                    </div>
                  </div>

                  {/* Avatar cho tin nhắn của mình */}
                  {!isOwnMessage && !msg.readAt && (
                   <div className="w-2 h-2 bg-red-500 rounded-full ml-1 self-center" />
                  )}
                </div>
              )}
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>
      <MessageInput onSendMessage={handleSendMessage} />
      
      {/* User Profile Modal */}
      {selectedUserId && (
        <UserProfileModal
          userId={selectedUserId}
          open={profileModalOpen}
          onOpenChange={setProfileModalOpen}
        />
      )}
    </div>
  );
}