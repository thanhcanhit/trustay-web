"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { useAIAssistantStore } from '@/stores/aiAssistant.store';
import { useUserStore } from '@/stores/userStore';
import { AIInput } from './ai-input';
import { cn } from '@/lib/utils';
import { Loader2, ChevronDown, Home } from 'lucide-react';
import type { AIHistoryMessage, ListItem, TableColumn, TableCell } from '@/types';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AIHeader } from './ai-header';
import { AITypingIndicator } from './ai-typing-indicator';
import { AIListPreview } from './ai-list-preview';
import { AITablePreview } from './ai-table-preview';
import { AIControlBlock } from './ai-control-block';
import { AIMessageMarkdown } from './ai-message-markdown';
import { AIPostRoomDialog } from './ai-post-room-dialog';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function AISidebar() {
  const router = useRouter();
  const isSidebarOpen = useAIAssistantStore((s) => s.isSidebarOpen);
  const toggleSidebar = useAIAssistantStore((s) => s.toggleSidebar);
  const loadHistory = useAIAssistantStore((s) => s.loadHistory);
  const clearHistory = useAIAssistantStore((s) => s.clearHistory);
  const sendPrompt = useAIAssistantStore((s) => s.sendPrompt);
  const isLoading = useAIAssistantStore((s) => s.isLoading);
  const error = useAIAssistantStore((s) => s.error);
  const messages = useAIAssistantStore((s) => s.messages);
  const user = useUserStore((s) => s.user);
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const isLandlord = user?.role === 'landlord';

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [tableDialogOpen, setTableDialogOpen] = useState(false);
  const [tableDialogContent, setTableDialogContent] = useState<React.ReactNode>(null);
  const [postRoomDialogOpen, setPostRoomDialogOpen] = useState(false);
  const shouldAutoScrollRef = useRef(true);
  const quickSuggestions: ReadonlyArray<string> = useMemo(
    () => [
      // --- Guest / Tìm phòng (không cần đăng nhập) ---
      'Tìm phòng trọ có máy lạnh ở Gò Vấp dưới 5 triệu.',
      'Có phòng trọ đầy đủ nội thất nào ở Quận 1 không?',
      'Tìm phòng trọ gần trường IUH',
  
      // --- Tenant / Tài khoản & Quản lý ---
      'Hóa đơn điện nước tháng này của tôi bao nhiêu?',
      "Có hoá đơn nào chưa thanh toán không?",
      'Hợp đồng thuê nhà của tôi khi nào hết hạn?',
      'Lịch sử thanh toán 3 tháng qua của tôi.',
  
      // --- Tenant / Tìm bạn ở ghép ---
      'Tìm người ở ghép nam cho phòng 2 người ở HCM.',
      'Có bài đăng tìm bạn ở ghép nào ở Bình Thạnh không?',
  
      // --- Landlord / Thống kê & Doanh thu ---
      'Thống kê doanh thu 6 tháng qua của tôi.',
      'Tỷ lệ lấp đầy các phòng của tôi hiện tại bao nhiêu?',
      'Danh sách các hóa đơn chưa thanh toán tháng này.',
      'Có bao nhiêu phòng đang trống?',
      'Tổng số tiền thu được tháng này là bao nhiêu?',
      'Phòng nào đang có hợp đồng sắp hết hạn?',
  
      // --- Landlord / Quản lý phòng ---
      'Danh sách tất cả phòng của tôi.',
      'Có yêu cầu thuê phòng nào đang chờ duyệt không?',
      'Thống kê số lượng phòng theo trạng thái.',
      "Tôi muốn đăng tải phòng trọ của tôi",
      "Tôi muốn đăng tải dãy trọ của tôi",
  
      // --- Phân tích phòng (khi đang xem trang phòng) ---
      'Đánh giá phòng hiện tại.',
      'Giá phòng hiện tại có hợp lý không?',
      'Phân tích chi tiết phòng này.',
    ],
    [],
  );
  // dialog helpers handled inline where needed


  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  // Auto-scroll to bottom when new messages arrive (only if user hasn't scrolled up)
  useEffect(() => {
    if (!shouldAutoScrollRef.current || !messagesEndRef.current || !messagesContainerRef.current) return;
    
    const container = messagesContainerRef.current;
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
    
    if (isNearBottom) {
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
    if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
    }
  }, [messages]);

  // Track scroll position to determine if we should auto-scroll
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      shouldAutoScrollRef.current = isNearBottom;
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

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

  const onSend = async (content: string, images?: string[]) => {
    await sendPrompt(content, images);
  };

  return (
    <aside
      className={cn(
        'fixed top-14 sm:top-16 right-0 h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] z-[9990] w-full sm:w-[400px] md:w-[420px] lg:w-[450px] max-w-[95vw] border-l bg-white flex flex-col overflow-hidden transition-transform duration-300 ease-in-out',
        isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
      )}
      aria-label="AI assistant sidebar"
      style={{ contain: 'layout style paint' }}
    >
      <AIHeader 
        onClear={() => clearHistory()} 
        onClose={() => toggleSidebar(false)}
        onPostRoom={() => {
          if (!isAuthenticated) {
            toast.info('Đăng nhập để đăng tải phòng', {
              description: 'Bạn cần đăng nhập để sử dụng tính năng đăng tải phòng với AI. Hãy đăng nhập hoặc đăng ký tài khoản ngay!',
              action: {
                label: 'Đăng nhập',
                onClick: () => router.push('/login'),
              },
              duration: 5000,
            });
            return;
          }
          setPostRoomDialogOpen(true);
        }}
      />

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto overflow-x-hidden p-2 sm:p-3 space-y-2"
          style={{ 
            scrollBehavior: 'smooth',
            WebkitOverflowScrolling: 'touch',
          }}
        >
            <PhotoProvider>
              {isLoading && (
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                  <Loader2 className="animate-spin" size={16} /> Đang tải…
                </div>
              )}
              {error && (
                <div className="text-xs sm:text-sm text-red-600">{error}</div>
              )}
              {messageList.length === 0 && !isLoading && (
                <div className="px-1 sm:px-2 py-3 sm:py-4">
                  <div className="text-center mb-3 sm:mb-4">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">What can I help with?</h2>
                  </div>
                  <div className="grid grid-cols-1 gap-1.5 sm:gap-2">
                    {/* Post Room Button for Landlords - Show at top */}
                    {isLandlord && (
                      <Button
                        type="button"
                        onClick={() => {
                          if (!isAuthenticated) {
                            toast.info('Đăng nhập để đăng tải phòng', {
                              description: 'Bạn cần đăng nhập để sử dụng tính năng đăng tải phòng với AI. Hãy đăng nhập hoặc đăng ký tài khoản ngay!',
                              action: {
                                label: 'Đăng nhập',
                                onClick: () => router.push('/login'),
                              },
                              duration: 5000,
                            });
                            return;
                          }
                          setPostRoomDialogOpen(true);
                        }}
                        className="w-fit cursor-pointer justify-start px-3 sm:px-4 py-1.5 sm:py-2 h-auto rounded-full bg-primary text-primary-foreground hover:bg-primary/90 text-xs sm:text-sm font-medium"
                      >
                        <Home size={14} className="sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                        Đăng tải phòng với Trustay AI
                      </Button>
                    )}
                    {quickSuggestions.slice(0, 5).map((q, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => sendPrompt(q)}
                        className="w-fit max-w-full px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gray-100 text-gray-800 text-xs sm:text-sm hover:bg-gray-200 border text-left cursor-pointer"
                        aria-label={q}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 sm:mt-4 text-center text-[10px] sm:text-xs text-gray-500">
                    Gợi ý: Bạn có thể hỏi về phòng trọ, dãy trọ, người ở ghép…
                  </div>
                </div>
              )}
              {messageList.map((m) => (
                <div key={m.id} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                  <div className={cn('max-w-[90%] sm:max-w-[85%] rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 break-words text-xs sm:text-sm', m.role === 'user' ? 'bg-primary text-white' : 'bg-gray-100')}>
                    {m.id === 'typing' ? (
                      <AITypingIndicator />
                    ) : m.role === 'assistant' ? (
                      <div className="prose prose-sm max-w-none [&_*]:text-xs [&_*]:sm:text-sm">
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
                      <span className="whitespace-pre-wrap text-xs sm:text-sm">{m.content}</span>
                    )}
                    {hasContentStats(m) && (
                      <div className="mt-1.5 sm:mt-2 flex flex-wrap gap-1 sm:gap-2">
                        {m.contentStats.map((s, idx) => (
                          <span key={idx} className="text-[10px] sm:text-xs bg-white/80 border rounded-full px-1.5 sm:px-2 py-0.5 sm:py-1">
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
                      <div className="mt-2 sm:mt-3">
                        <PhotoView src={m.chart.url}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
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
                      <details className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs">
                        <summary className="cursor-pointer inline-flex items-center gap-0.5 sm:gap-1">
                          <ChevronDown size={10} className="sm:w-3 sm:h-3" /> Chi tiết kết quả
                        </summary>
                        <div className="mt-1.5 sm:mt-2">
                          <div className="text-gray-600 mb-0.5 sm:mb-1 text-[10px] sm:text-xs">SQL:</div>
                          <pre className="bg-white border rounded p-1.5 sm:p-2 overflow-auto max-h-32 sm:max-h-40 whitespace-pre-wrap text-gray-700 text-[10px] sm:text-xs">{m.sql}</pre>
                          {m.results && Array.isArray(m.results) && (
                            <div className="mt-1.5 sm:mt-2">
                              <div className="text-gray-600 mb-0.5 sm:mb-1 text-[10px] sm:text-xs">Kết quả {m.count ?? m.results.length}:</div>
                              <pre className="bg-white border rounded p-1.5 sm:p-2 overflow-auto max-h-40 sm:max-h-48 whitespace-pre-wrap text-gray-700 text-[10px] sm:text-xs">{JSON.stringify(m.results, null, 2)}</pre>
                            </div>
                          )}
                        </div>
                      </details>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} style={{ height: '1px' }} />
            </PhotoProvider>
        </div>
        <div className="flex-shrink-0">
          <AIInput onSend={onSend} disabled={useAIAssistantStore((s) => !!s.isThinking)} />
        </div>
      </div>
      
      {/* Dialog moved outside of map to prevent re-renders */}
                  <Dialog open={tableDialogOpen} onOpenChange={setTableDialogOpen}>
                    <DialogContent className="w-[95vw] max-w-3xl bg-white/95 backdrop:bg-black/20">
                      <DialogHeader>
                        <DialogTitle className="text-sm sm:text-base">Xem bảng đầy đủ</DialogTitle>
                      </DialogHeader>
                      <div className="overflow-x-auto">
                        {tableDialogContent}
                      </div>
                    </DialogContent>
                  </Dialog>

      {/* Post Room Dialog */}
      <AIPostRoomDialog
        open={postRoomDialogOpen}
        onOpenChange={setPostRoomDialogOpen}
      />
    </aside>
  );
}


