"use client";

import { useAIAssistantStore } from '@/stores/aiAssistant.store';
import type { PropsWithChildren } from 'react';

export function AIOffset({ children }: PropsWithChildren) {
  const isOpen = useAIAssistantStore((s) => s.isSidebarOpen);
  const paddingRight = isOpen ? 360 : 0;
  return (
    <div style={{ paddingRight }}>{children}</div>
  );
}


