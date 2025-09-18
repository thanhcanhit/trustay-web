"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { X, Minimize2, Maximize2, Send } from "lucide-react"
import { useState } from "react"
import { ChatBubble } from "./chat-bubble"
import { useChatStore } from "@/stores/chat.store"
import "./chat-window.css"

interface ChatWindowProps {
  className?: string
  conversationId: string
  toUserId: string
  onClose?: () => void
}

export function ChatWindow({ className, conversationId, toUserId, onClose }: ChatWindowProps) {
  const [isMinimized, setIsMinimized] = useState(false)
  const [message, setMessage] = useState("")
  const messages = useChatStore()

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    try {
      // toUserId is passed as a prop
      await messages.sendMessage(conversationId, toUserId, message.trim());
      setMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
      // TODO: Show error toast
    }
  };

  return (
    <Card className={cn(
      "fixed bottom-4 right-4 w-80 shadow-lg transition-all duration-300",
      isMinimized ? "h-12" : "h-[500px]",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="font-semibold">Chat</div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Message List */}
      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-4 h-[calc(500px-120px)] chat-messages">
            {messages.getMessages(conversationId).map((msg) => (
              <ChatBubble 
                key={msg.messageId}
                message={msg.content as string}
                isMe={msg.fromUserId === messages.currentUserId}
                timestamp={new Date(msg.sentAt || "").toLocaleTimeString()}
              />
            ))}
          </div>

          {/* Input Area */}
          <div className="p-3 border-t bg-background">
            <div className="flex gap-2">
              <Input 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..." 
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && message.trim()) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button 
                size="icon" 
                className="hover:bg-primary hover:text-primary-foreground"
                onClick={handleSendMessage}
                disabled={!message.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </Card>
  )
}