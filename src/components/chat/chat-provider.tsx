"use client"

import { create } from "zustand"
import { ChatWindow } from "./chat-window"
import { Button } from "../ui/button"
import { MessageCircle, X } from "lucide-react"
import { useEffect } from "react"
import { useChatStore } from "@/stores/chat.store"
import { useUserStore } from "@/stores/userStore"

interface ChatProviderState {
  isOpen: boolean
  toggleOpen: () => void
  activeConversation?: {
    id: string
    userId: string
  }
  setActiveConversation: (id: string, userId: string) => void
  clearActiveConversation: () => void
}

const useChatProviderStore = create<ChatProviderState>((set) => ({
  isOpen: false,
  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
  activeConversation: undefined,
  setActiveConversation: (id, userId) => set({ activeConversation: { id, userId } }),
  clearActiveConversation: () => set({ activeConversation: undefined }),
}))

export function ChatProvider() {
  const user = useUserStore(state => state.user)
  const chatStore = useChatStore()
  const { isOpen, toggleOpen, activeConversation } = useChatProviderStore()

  useEffect(() => {
    const currentChatUserId = chatStore.getCurrentUserId()
    if (user?.id && currentChatUserId !== user.id) {
      chatStore.setCurrentUserId(user.id)
    }
  }, [user?.id, chatStore])

  if (!user) return null

  return (
    <>
      {/* Chat Button */}
      <Button
        size="icon"
        className="fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg"
        onClick={toggleOpen}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </Button>

      {/* Active Chat Window */}
      {isOpen && activeConversation && (
        <ChatWindow
          conversationId={activeConversation.id}
          toUserId={activeConversation.userId}
          onClose={() => useChatProviderStore.getState().clearActiveConversation()}
        />
      )}

      {/* Chat List - Only show when no active conversation */}
      {isOpen && !activeConversation && (
        <div className="fixed bottom-20 right-4 w-80 bg-background rounded-lg shadow-lg p-4">
          <h3 className="font-semibold mb-4">Recent Chats</h3>
          {/* TODO: Add list of recent conversations */}
          <div className="text-muted-foreground text-sm">
            No recent conversations
          </div>
        </div>
      )}
    </>
  )
}