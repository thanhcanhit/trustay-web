"use client";

import { useUserStore } from '@/stores/userStore'
import { useChatStore } from '@/stores/chat.store'
import { MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { ChatWindow } from "./chat-window";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

export function ChatBubble() {
  const router = useRouter();
  const { user, isAuthenticated } = useUserStore();
  const [isChatOpen, setChatOpen] = useState(false);
  const getUnreadConversationCount = useChatStore((state) => state.getUnreadConversationCount);
  const loadConversations = useChatStore((state) => state.loadConversations);
  const conversations = useChatStore((state) => state.conversations);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load conversations when component mounts
  useEffect(() => {
    if (isAuthenticated && user) {
      loadConversations();
    }
  }, [isAuthenticated, user, loadConversations]);

  // Update unread count when conversations change
  useEffect(() => {
    if (isAuthenticated && user) {
      const count = getUnreadConversationCount();
      setUnreadCount(count);
    }
  }, [conversations, isAuthenticated, user, getUnreadConversationCount]);

  // Chỉ hiển thị khi đã đăng nhập
  if (!isAuthenticated || !user) {
    return null;
  }

  const handleChatClick = () => {
    if (isMobile) {
      // Redirect to /messages page on mobile
      router.push('/messages');
    } else {
      // Toggle chat window on desktop
      setChatOpen(!isChatOpen);
    }
  };

  return (
    <>
      {/* Ẩn ChatBubble trên mobile vì đã có nút tin nhắn trong navigation */}
      {!isChatOpen && !isMobile && (
        <div className="fixed bottom-0 right-6 z-50">
          <button
            onClick={handleChatClick}
            className="flex items-center justify-center w-30 h-12 bg-primary hover:bg-green-600 text-white shadow-lg transition-all duration-300 ease-in-out cursor-pointer relative"
            aria-label="Chat"
          >
            <MessageCircle size={24} />
            <span className="ml-2">Tin nhắn</span>
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-bold bg-red-500 text-white border-2 border-white"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </button>
        </div>
      )}
      {/* Only show ChatWindow on desktop */}
      {isChatOpen && !isMobile && <ChatWindow onClose={() => setChatOpen(false)} />}
    </>
  );
}