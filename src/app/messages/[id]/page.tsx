"use client";

import { useChatStore } from "@/stores/chat.store";
import { useUserStore } from "@/stores/userStore";
import { useEffect, useRef, useMemo, useState } from "react";
import { format, isSameDay } from 'date-fns';
import { Check, CheckCheck, ArrowLeft } from 'lucide-react';
import { MESSAGE_TYPES, SYSTEM_MESSAGE_TYPES, MESSAGE_CONTENT_MAP } from '@/constants/chat.constants';
import type { SystemMessageType } from '@/constants/chat.constants';
import Image from "next/image";
import { InvitationRequestMessage } from "@/components/chat/invitation-request-message";
import { MessageInput } from "@/components/chat/message-input";
import { MessageAttachments } from "@/components/chat/message-attachments";
import { getMessageMetadata } from "@/lib/message-metadata";
import { decodeStructuredMessage } from "@/lib/chat-message-encoder";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserProfileModal } from "@/components/profile/user-profile-modal";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function ConversationPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.id as string;

  const getConversation = useChatStore((state) => state.getConversation);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const setCurrentUserId = useChatStore((state) => state.setCurrentUserId);
  const setCurrentConversationId = useChatStore((state) => state.setCurrentConversationId);
  const byConversation = useChatStore((state) => state.byConversation);
  const loadMessages = useChatStore((state) => state.loadMessages);
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

  const conversation = conversationId ? getConversation(conversationId) : null;

  const messages = useMemo(() => {
    const msgs = conversationId ? (byConversation[conversationId] ?? []) : [];

    // Attach metadata from local storage to messages
    return msgs.map(msg => {
      const metadata = getMessageMetadata(msg.id);
      return metadata ? { ...msg, metadata } : msg;
    });
  }, [conversationId, byConversation]);

  // Set current conversation ID on mount
  useEffect(() => {
    if (conversationId) {
      setCurrentConversationId(conversationId);
      loadMessages(conversationId);
    }

    return () => {
      setCurrentConversationId(null);
    };
  }, [conversationId, setCurrentConversationId, loadMessages]);

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

  const handleSendMessage = async (content: string, attachmentFiles: File[]) => {
    if ((!content.trim() && attachmentFiles.length === 0) || !conversation || !user) {
      console.log('Cannot send message: missing content or conversation');
      return;
    }

    try {
      await sendMessage({
        content,
        recipientId: conversation.counterpart.id,
        conversationId: conversation.conversationId,
        attachmentFiles,
        type: MESSAGE_TYPES.TEXT,
      });

      // Enable auto-scroll when sending message
      setShouldAutoScroll(true);
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (!conversation) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="flex flex-col justify-center items-center p-4">
          <Image
            src="/laptop.png"
            alt="Empty chat"
            width={300}
            height={300}
            className="mx-auto"
          />
          <p className="font-semibold text-center mt-4">Không tìm thấy cuộc trò chuyện</p>
          <Button onClick={handleBack} className="mt-4">
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  const conversationTitle = `${conversation.counterpart.firstName} ${conversation.counterpart.lastName}`;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-primary text-white px-3 py-3 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="text-white hover:bg-primary-600"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Avatar className="h-10 w-10 ring-2 ring-white/20">
            <AvatarImage
              src={conversation.counterpart.avatarUrl || ""}
              alt={conversation.counterpart.lastName}
            />
            <AvatarFallback>
              {conversation.counterpart.lastName.charAt(0)}
              {conversation.counterpart.firstName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <h1 className="text-lg font-semibold truncate">{conversationTitle}</h1>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 p-4 overflow-y-auto bg-gray-50"
        onScroll={handleScroll}
      >
        {messages.map((msg, index) => {
          const showDateSeparator = index === 0 || !isSameDay(new Date(messages[index - 1].sentAt), new Date(msg.sentAt));
          const isOwnMessage = msg.senderId === user?.id;
          const isInvitationOrRequest = msg.type === MESSAGE_TYPES.INVITATION || msg.type === MESSAGE_TYPES.REQUEST;

          return (
            <div key={msg.id || `message-${index}`}>
              {showDateSeparator && (
                <div className="text-center text-sm text-gray-500 my-4">
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
                        <AvatarFallback>
                          {conversation.counterpart.lastName.charAt(0)}
                          {conversation.counterpart.firstName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  )}

                  {/* Message content container */}
                  <div className={`flex flex-col gap-1 ${isOwnMessage ? "items-end" : "items-start"} max-w-[75%] overflow-hidden`}>
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="w-full max-w-full">
                        <MessageAttachments attachments={msg.attachments} />
                      </div>
                    )}

                    {msg.content && (
                      <div
                        className={`p-3 rounded-2xl break-words overflow-wrap-anywhere w-full ${
                          isOwnMessage
                            ? "bg-primary text-white rounded-br-sm"
                            : "bg-white text-gray-900 rounded-bl-sm shadow-sm"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words overflow-wrap-anywhere">
                          {(() => {
                            // Try to decode structured message
                            const structuredData = decodeStructuredMessage(msg.content);
                            return structuredData?.message || msg.content;
                          })()}
                        </p>
                      </div>
                    )}

                    {/* Timestamp and read status */}
                    <div className={`text-xs text-gray-400 flex items-center gap-1 px-1 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
                      {format(new Date(msg.sentAt), 'HH:mm')}
                      {isOwnMessage && (
                        <span>
                          {msg.readAt ? <CheckCheck size={14} className="text-blue-500" /> : <Check size={14} />}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
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
