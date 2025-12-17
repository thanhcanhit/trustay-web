"use client";

import { useConversationStore } from '@/stores/conversation.store';
import type { PropsWithChildren } from 'react';

export function AIOffset({ children }: PropsWithChildren) {
  const isOpen = useConversationStore((s) => s.isSidebarOpen);
  const paddingRight = isOpen ? 360 : 0;
  return (
    <div style={{ paddingRight }}>{children}</div>
  );
}


