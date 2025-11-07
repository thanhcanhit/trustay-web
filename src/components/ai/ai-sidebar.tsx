"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { useAIAssistantStore } from '@/stores/aiAssistant.store';
import { AIInput } from './ai-input';
import { cn } from '@/lib/utils';
import { Loader2, ChevronDown } from 'lucide-react';
import type { AIHistoryMessage, ListItem, TableColumn, TableCell } from '@/types';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AIHeader } from './ai-header';
import { AITypingIndicator } from './ai-typing-indicator';
import { AIListPreview } from './ai-list-preview';
import { AITablePreview } from './ai-table-preview';
import { AIControlBlock } from './ai-control-block';
import { AIMessageMarkdown } from './ai-message-markdown';

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
  const [tableDialogOpen, setTableDialogOpen] = useState(false);
  const [tableDialogContent, setTableDialogContent] = useState<React.ReactNode>(null);
  const quickSuggestions: ReadonlyArray<string> = useMemo(
    () => [
      // --- Guest / Tìm phòng ---
      'Tìm phòng trọ có gác lửng, ban công ở Gò Vấp.',
      'Có studio full nội thất nào dưới 5 triệu ở Quận 1 không?',
      'Có ai đang tìm bạn ở ghép nữ gần HUTECH không?',

      // --- Landlord / Thống kê ---
      'Thống kê doanh thu 6 tháng qua của tôi.',
      'Tỷ lệ lấp đầy các phòng của tôi hiện tại?',
      'Danh sách các hoá đơn chưa thanh toán tháng này.',

      // --- Tenant / Tài khoản ---
      'Hoá đơn điện nước tháng này của tôi.',
      'Hợp đồng thuê nhà của tôi khi nào hết hạn?',
    ],
    [],
  );
  // dialog helpers handled inline where needed


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
  type AssistantEnrichedMessage = AIHistoryMessage & {
    contentStats?: ReadonlyArray<{ label: string; value: number; unit?: string }>;
    dataList?: { items: ReadonlyArray<ListItem>; total: number };
    dataTable?: { columns: ReadonlyArray<TableColumn>; rows: ReadonlyArray<Record<string, TableCell>>; previewLimit?: number };
    chart?: { url?: string; width: number; height: number; alt?: string };
    controlQuestions?: ReadonlyArray<string>;
    errorCode?: string;
    errorDetails?: string;
    sql?: string;
    results?: Array<Record<string, unknown>>;
    count?: number;
  };

  const hasErrorInfo = (m: AIHistoryMessage | AssistantEnrichedMessage): m is AssistantEnrichedMessage & { errorCode?: string; errorDetails?: string } => {
    return ('errorCode' in m && typeof m.errorCode === 'string') || ('errorDetails' in m && typeof m.errorDetails === 'string');
  };
  const hasContentStats = (m: AIHistoryMessage | AssistantEnrichedMessage): m is AssistantEnrichedMessage & { contentStats: ReadonlyArray<{ label: string; value: number; unit?: string }> } => {
    return 'contentStats' in m && Array.isArray(m.contentStats);
  };
  const hasDataList = (m: AIHistoryMessage | AssistantEnrichedMessage): m is AssistantEnrichedMessage & { dataList: { items: ReadonlyArray<ListItem>; total: number } } => {
    return 'dataList' in m && m.dataList !== undefined && Array.isArray(m.dataList.items);
  };
  const hasDataTable = (m: AIHistoryMessage | AssistantEnrichedMessage): m is AssistantEnrichedMessage & { dataTable: { columns: ReadonlyArray<TableColumn>; rows: ReadonlyArray<Record<string, TableCell>>; previewLimit?: number } } => {
    return 'dataTable' in m && m.dataTable !== undefined && Array.isArray(m.dataTable.columns) && Array.isArray(m.dataTable.rows);
  };
  const hasChart = (m: AIHistoryMessage | AssistantEnrichedMessage): m is AssistantEnrichedMessage & { chart: { url?: string; width: number; height: number; alt?: string } } => {
    return 'chart' in m && m.chart !== undefined && typeof m.chart.width === 'number' && typeof m.chart.height === 'number';
  };
  const hasControlQuestions = (m: AIHistoryMessage | AssistantEnrichedMessage): m is AssistantEnrichedMessage & { controlQuestions: ReadonlyArray<string> } => {
    return 'controlQuestions' in m && Array.isArray(m.controlQuestions);
  };

  const messageList = useMemo<Array<AIHistoryMessage | AssistantEnrichedMessage>>(
    () => (Array.isArray(messages) ? (messages as Array<AIHistoryMessage | AssistantEnrichedMessage>) : []),
    [messages]
  );

  const onSend = async (content: string) => {
    // Attachments not supported by current backend contract; ignore files for now
    await sendPrompt(content);
  };

  return (
    <aside
      className={cn(
        'fixed top-16 right-0 h-[calc(100vh-4rem)] z-[9990] w-[360px] border-l bg-white flex flex-col min-h-0 overflow-hidden transition-transform duration-300 ease-in-out',
        isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
      )}
      aria-label="AI assistant sidebar"
    >
      <AIHeader onClear={() => clearHistory()} onClose={() => toggleSidebar(false)} />

      <div className="flex-1 min-h-0 flex flex-col">
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            <PhotoProvider>
              {isLoading && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="animate-spin" size={16} /> Đang tải…
                </div>
              )}
              {error && (
                <div className="text-sm text-red-600">{error}</div>
              )}
              {messageList.length === 0 && !isLoading && (
                <div className="px-2 py-4">
                  <div className="text-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">What can I help with?</h2>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {quickSuggestions.slice(0, 5).map((q, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => sendPrompt(q)}
                        className="w-fit max-w-full px-4 py-2 rounded-full bg-gray-100 text-gray-800 text-sm hover:bg-gray-200 border text-left"
                        aria-label={q}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 text-center text-xs text-gray-500">
                    Gợi ý: Bạn có thể hỏi về phòng trọ, dãy trọ, người ở ghép…
                  </div>
                </div>
              )}
              {messageList.map((m) => (
                <div key={m.id} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                  <div className={cn('max-w-[85%] rounded-lg px-3 py-2 break-words', m.role === 'user' ? 'bg-primary text-white' : 'bg-gray-100')}>
                    {m.id === 'typing' ? (
                      <AITypingIndicator />
                    ) : m.role === 'assistant' ? (
                      <div className="prose prose-sm max-w-none">
                        {m.content && (
                          <AIMessageMarkdown
                            content={m.content}
                            onOpenTable={(node) => {
                              setTableDialogContent(node);
                              setTableDialogOpen(true);
                            }}
                          />
                        )}
                      </div>
                    ) : (
                      <span className="whitespace-pre-wrap">{m.content}</span>
                    )}
                    {hasContentStats(m) && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {m.contentStats.map((s, idx) => (
                          <span key={idx} className="text-xs bg-white/80 border rounded-full px-2 py-1">
                            {s.label}: {s.value}{s.unit ? s.unit : ''}
                          </span>
                        ))}
                      </div>
                    )}
                    {hasDataList(m) && (
                      <AIListPreview items={m.dataList.items} onOpenFull={(node) => { if (node) { setTableDialogContent(node); setTableDialogOpen(true); } }} />
                    )}
                    {hasDataTable(m) && (
                      <AITablePreview
                        columns={m.dataTable.columns}
                        rows={m.dataTable.rows}
                        previewLimit={m.dataTable.previewLimit}
                        onOpenFull={(node) => { setTableDialogContent(node); setTableDialogOpen(true); }}
                      />
                    )}
                    {hasChart(m) && m.chart.url && (
                      <div className="mt-3">
                        <PhotoView src={m.chart.url}>
                          <img src={m.chart.url} alt={m.chart.alt || 'Chart'} width={m.chart.width} height={m.chart.height} className="max-w-full h-auto rounded border" />
                        </PhotoView>
                      </div>
                    )}
                    {(hasControlQuestions(m) || hasErrorInfo(m)) && (
                      <AIControlBlock
                        questions={hasControlQuestions(m) ? m.controlQuestions : undefined}
                        errorCode={hasErrorInfo(m) ? m.errorCode : undefined}
                        errorDetails={hasErrorInfo(m) ? m.errorDetails : undefined}
                        onAsk={(q) => sendPrompt(q)}
                      />
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
                  <Dialog open={tableDialogOpen} onOpenChange={setTableDialogOpen}>
                    <DialogContent className="sm:max-w-3xl bg-white/95 backdrop:bg-black/20">
                      <DialogHeader>
                        <DialogTitle>Xem bảng đầy đủ</DialogTitle>
                      </DialogHeader>
                      {tableDialogContent}
                    </DialogContent>
                  </Dialog>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </PhotoProvider>
          </div>
          <AIInput onSend={onSend} disabled={useAIAssistantStore((s) => !!s.isThinking)} />
        </div>
      </div>
    </aside>
  );
}


