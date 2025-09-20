"use client";

import { useUserStore } from '@/stores/userStore'
import { MessageCircle } from "lucide-react";
import Link from "next/link";

export function ChatBubble() {
  const { user, isAuthenticated } = useUserStore();

  // Chỉ hiển thị khi đã đăng nhập
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Link
        href="/chat"
        className="flex items-center justify-center w-14 h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg transition-all duration-300 ease-in-out"
        aria-label="Chat"
      >
        <MessageCircle size={24} />
      </Link>
    </div>
  );
}