"use client"

import { cn } from "@/lib/utils"

interface ChatBubbleProps {
  message: string
  isMe: boolean
  timestamp?: string
  className?: string
}

export function ChatBubble({ message, isMe, timestamp, className }: ChatBubbleProps) {
  return (
    <div className={cn(
      "flex gap-2 mb-2",
      isMe ? "flex-row-reverse" : "flex-row",
      className
    )}>
      <div className={cn(
        "max-w-[70%] rounded-2xl px-4 py-2",
        isMe ? "bg-primary text-primary-foreground" : "bg-muted"
      )}>
        <p className="text-sm break-words">{message}</p>
        {timestamp && (
          <p className={cn(
            "text-xs mt-1",
            isMe ? "text-primary-foreground/70" : "text-muted-foreground"
          )}>
            {timestamp}
          </p>
        )}
      </div>
    </div>
  )
}