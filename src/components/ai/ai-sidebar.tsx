"use client";

import { useEffect, useMemo, useRef } from 'react';
import { useAIAssistantStore } from '@/stores/aiAssistant.store';
import { Button } from '@/components/ui/button';
import { MessageInput } from '@/components/chat/message-input';
import { cn } from '@/lib/utils';
import { Loader2, Sparkles, Trash2, ChevronDown } from 'lucide-react';
import type { AIHistoryMessage } from '@/types';
import ReactMarkdown from 'react-markdown';

export function AISidebar() {
  const isSidebarOpen = useAIAssistantStore((s) => s.isSidebarOpen);
  const toggleSidebar = useAIAssistantStore((s) => s.toggleSidebar);
  const loadHistory = useAIAssistantStore((s) => s.loadHistory);
  const clearHistory = useAIAssistantStore((s) => s.clearHistory);
  const sendPrompt = useAIAssistantStore((s) => s.sendPrompt);
  const isLoading = useAIAssistantStore((s) => s.isLoading);
  const error = useAIAssistantStore((s) => s.error);
  const messages = useAIAssistantStore((s) => s.messages);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  type AssistantResultMessage = AIHistoryMessage & { sql?: string; results?: Array<Record<string, unknown>>; count?: number };
  const hasAssistantResult = (m: AIHistoryMessage | AssistantResultMessage): m is AssistantResultMessage => {
    return 'sql' in m || 'results' in m || 'count' in m;
  };
  const messageList = useMemo<Array<AIHistoryMessage | AssistantResultMessage>>(
    () => (Array.isArray(messages) ? (messages as Array<AIHistoryMessage | AssistantResultMessage>) : []),
    [messages]
  );

  const onSend = async (content: string, files: File[]) => {
    // Attachments not supported by current backend contract; ignore files for now
    await sendPrompt(content);
  };

  if (!isSidebarOpen) return null;

  return (
    <aside
      className={cn(
        'fixed top-0 right-0 h-screen z-[9999] w-[360px] border-l bg-white flex flex-col min-h-0 transition-all'
      )}
      aria-label="AI assistant sidebar"
    >
      <div className="h-12 flex items-center justify-between px-2 border-b">
        <div className="flex items-center gap-2 overflow-hidden">
          <Sparkles className="text-primary" size={18} />
          <span className="font-semibold truncate">Trustay AI</span>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
        <div className="h-10 px-2 border-b flex items-center justify-between">
          <div className="text-sm text-gray-500">Phiên trò chuyện hiện tại</div>
          <Button variant="ghost" size="icon" onClick={() => clearHistory()} aria-label="Xoá lịch sử">
            <Trash2 size={16} />
          </Button>
        </div>
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {isLoading && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="animate-spin" size={16} /> Đang tải…
              </div>
            )}
            {error && (
              <div className="text-sm text-red-600">{error}</div>
            )}
            {messageList.map((m) => (
              <div key={m.id} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                  <div className={cn('max-w-[85%] rounded-lg px-3 py-2 break-words', m.role === 'user' ? 'bg-primary text-white' : 'bg-gray-100')}>
                    {m.role === 'assistant' ? (
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown
                          components={{
                            a: (props) => <a {...props} target="_blank" rel="noopener noreferrer" />,
                            pre: ({ children }) => (
                              <pre className="overflow-auto max-h-64">{children as React.ReactNode}</pre>
                            ),
                            code: (props) => <code className={props.className}>{props.children as React.ReactNode}</code>,
                          }}
                        >
                          {m.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <span className="whitespace-pre-wrap">{m.content}</span>
                    )}
                  {hasAssistantResult(m) && m.sql && (
                    <details className="mt-2 text-xs">
                      <summary className="cursor-pointer inline-flex items-center gap-1">
                        <ChevronDown size={12} /> Chi tiết kết quả
                      </summary>
                      <div className="mt-2">
                        <div className="text-gray-600 mb-1">SQL:</div>
                        <pre className="bg-white border rounded p-2 overflow-auto max-h-40 whitespace-pre-wrap text-gray-700">{m.sql}</pre>
                        {m.results && Array.isArray(m.results) && (
                          <div className="mt-2">
                            <div className="text-gray-600 mb-1">Kết quả {m.count ?? m.results.length}:</div>
                            <pre className="bg-white border rounded p-2 overflow-auto max-h-48 whitespace-pre-wrap text-gray-700">{JSON.stringify(m.results, null, 2)}</pre>
                          </div>
                        )}
                      </div>
                    </details>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <MessageInput onSendMessage={onSend} />
        </div>
      </div>
    </aside>
  );
}


