"use client";

import { useUserStore } from '@/stores/userStore'
import { MessageCircle } from "lucide-react";
import { useState } from "react";
import { ChatWindow } from "./chat-window";

export function ChatBubble() {
  const { user, isAuthenticated } = useUserStore();
  const [isChatOpen, setChatOpen] = useState(false);

  // Chỉ hiển thị khi đã đăng nhập
  if (!isAuthenticated || !user) {
    return null;
  }

  const toggleChat = () => {
    setChatOpen(!isChatOpen);
  };

  return (
    <>
      {!isChatOpen && (
        <div className="fixed bottom-0 right-6 z-50">
          <button
            onClick={toggleChat}
            className="flex items-center justify-center w-14 h-14 bg-primary hover:bg-orange-600 text-white rounded-full shadow-lg transition-all duration-300 ease-in-out"
            aria-label="Chat"
          >
            <MessageCircle size={24} />
          </button>
        </div>
      )}
      {isChatOpen && <ChatWindow onClose={toggleChat} />}
    </>
  );
}