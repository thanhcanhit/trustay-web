"use client";

import { usePathname } from "next/navigation";
import { ChatBubble } from "./chat/chat-bubble";

export function ConditionalChatBubble() {
	const pathname = usePathname();
	
	// Hide chat bubble on admin pages
	if (pathname?.startsWith("/admin")) {
		return null;
	}
	
	return <ChatBubble />;
}
