"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowDown} from "lucide-react";
import { ChatList } from "./chat-list";
import { ChatConversation } from "./chat-conversation";

interface ChatWindowProps {
  onClose: () => void;
}

export function ChatWindow({ onClose }: ChatWindowProps) {
  return (
    <div className="fixed bottom-0 right-6 z-50">
      <Card className="w-[600px] h-[500px] flex flex-col !rounded-none !p-0 !gap-0">
        <CardHeader className="flex flex-row items-center justify-between p-1 bg-primary text-white">
          <CardTitle className="text-lg">Chat</CardTitle>
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
  );
}