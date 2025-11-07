"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowDown, ArrowLeft } from "lucide-react";
import { ChatList } from "./chat-list";
import { ChatConversation } from "./chat-conversation";
import { useChatStore } from "@/stores/chat.store";
import { useState } from "react";

interface ChatWindowProps {
  onClose: () => void;
}

export function ChatWindow({ onClose }: ChatWindowProps) {
  const currentConversationId = useChatStore((state) => state.currentConversationId);
  const setCurrentConversationId = useChatStore((state) => state.setCurrentConversationId);
  const getConversation = useChatStore((state) => state.getConversation);
  const [showMobileConversation, setShowMobileConversation] = useState(false);

  const conversation = currentConversationId ? getConversation(currentConversationId) : null;
  const conversationTitle = conversation
    ? `${conversation.counterpart.firstName} ${conversation.counterpart.lastName}`
    : "Cuộc trò chuyện";

  // Handle back from conversation to list on mobile
  const handleBackToList = () => {
    setShowMobileConversation(false);
    setCurrentConversationId(null);
  };

  // Handle selecting a conversation on mobile
  const handleMobileConversationSelect = () => {
    setShowMobileConversation(true);
  };

  return (
    <>
      {/* Mobile Full Screen */}
      <div className="md:hidden fixed inset-0 z-50 bg-white">
        <Card className="w-full h-full flex flex-col !rounded-none !p-0 !gap-0 border-0">
          <CardHeader className="flex flex-row items-center justify-between px-3 py-3 bg-primary text-white shrink-0">
            {showMobileConversation && currentConversationId ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBackToList}
                className="text-white hover:bg-primary-600"
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>
            ) : null}
            <CardTitle className="text-lg flex-1 ml-2">
              {showMobileConversation && currentConversationId ? conversationTitle : "Tin nhắn"}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-primary-600"
            >
              <ArrowDown className="h-6 w-6" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0 min-h-0 overflow-hidden">
            {showMobileConversation && currentConversationId ? (
              <ChatConversation />
            ) : (
              <ChatList onMobileSelect={handleMobileConversationSelect} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Desktop Popup */}
      <div className="hidden md:block fixed bottom-0 right-6 z-50">
        <Card className="w-[700px] h-[500px] flex flex-col !rounded-none !p-0 !gap-0">
          <CardHeader className="flex flex-row items-center justify-between px-3 py-1 bg-primary text-white">
            <CardTitle className="text-lg">Tin nhắn</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <ArrowDown className="h-6 w-6" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 flex flex-row p-0 min-h-0">
            <ChatList />
            <ChatConversation />
          </CardContent>
        </Card>
      </div>
    </>
  );
}