"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { useConversationStore } from '@/stores/conversation.store';
import { useUserStore } from '@/stores/userStore';
import { AIInput } from './ai-input';
import { cn } from '@/lib/utils';
import { Loader2, ChevronDown, Home, MessageSquare, Plus, RefreshCw, Brain } from 'lucide-react';
import type { AIHistoryMessage, ListItem, TableColumn, TableCell } from '@/types';
import type { ContentPayload, DataPayload, ControlPayload } from '@/types/ai';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AIHeader } from './ai-header';
import { AIMessageList } from './ai-message-list';
import { AIPostRoomDialog } from './ai-post-room-dialog';
import { ConversationList } from './conversation-list';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function AISidebar() {
  const router = useRouter();
  
  // Conversation store - Always use conversation API
  const conversationStore = useConversationStore();
  const {
    isSidebarOpen,
    toggleSidebar,
    conversations,
    currentConversationId,
    messages: conversationMessages,
    loading: conversationLoading,
    sending: conversationSending,
    loadingMessages,
    error: conversationError,
    loadConversations,
    createConversation,
    selectConversation,
    sendMessage: sendConversationMessage,
    updateTitle,
    deleteConversation,
    clearMessages,
    clearCurrentConversation,
  } = conversationStore;
  
  const user = useUserStore((s) => s.user);
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const isLandlord = user?.role === 'landlord';

  const [tableDialogOpen, setTableDialogOpen] = useState(false);
  const [tableDialogContent, setTableDialogContent] = useState<React.ReactNode>(null);
  const [postRoomDialogOpen, setPostRoomDialogOpen] = useState(false);
  const [showConversationList, setShowConversationList] = useState(false);
  
  // Always use conversation messages
  const activeMessages = conversationMessages;
  const activeLoading = conversationLoading || loadingMessages;
  const activeSending = conversationSending;
  const activeError = conversationError;
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


  // Load conversations on mount
  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  // Load messages when conversation is selected
  useEffect(() => {
    if (currentConversationId && !showConversationList) {
      void selectConversation(currentConversationId);
    }
  }, [currentConversationId, selectConversation, showConversationList]);


  // Convert conversation messages to AIHistoryMessage format for rendering
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

  const messageList = useMemo<Array<AIHistoryMessage | AssistantEnrichedMessage>>(() => {
    if (!currentConversationId || conversationMessages.length === 0) {
      return [];
    }
    
    // Messages from API are already in correct order (oldest first, newest last)
    // Convert ConversationMessage to AIHistoryMessage format
    return conversationMessages.map((msg) => {
      const base: AIHistoryMessage = {
        id: msg.id,
        role: msg.role === 'system' ? 'assistant' : msg.role,
        content: msg.content,
        timestamp: msg.createdAt,
        kind: msg.metadata?.kind,
        payload: msg.metadata?.payload,
      };
      
      // Enrich with metadata
      if (msg.metadata?.payload) {
        const payload = msg.metadata.payload;
        const enriched: AIHistoryMessage & Partial<AssistantEnrichedMessage> = { ...base };
        
        if ('mode' in payload) {
          if (payload.mode === 'CONTENT') {
            enriched.contentStats = (payload as ContentPayload).stats;
          } else if (payload.mode === 'LIST' || payload.mode === 'TABLE' || payload.mode === 'CHART') {
            const dataPayload = payload as DataPayload;
            if (dataPayload.list) enriched.dataList = dataPayload.list;
            if (dataPayload.table) enriched.dataTable = dataPayload.table;
            if (dataPayload.chart) {
              enriched.chart = {
                url: dataPayload.chart.url,
                width: dataPayload.chart.width,
                height: dataPayload.chart.height,
                alt: dataPayload.chart.alt,
              };
            }
          } else if (payload.mode === 'CLARIFY' || payload.mode === 'ERROR') {
            const controlPayload = payload as ControlPayload;
            if (payload.mode === 'CLARIFY') {
              enriched.controlQuestions = controlPayload.questions;
            } else {
              enriched.errorCode = controlPayload.code;
              enriched.errorDetails = controlPayload.details;
            }
          }
        }
        
        // Extract SQL and results from metadata
        if (msg.metadata.sql) {
          enriched.sql = msg.metadata.sql;
        }
        
        // Extract results from DataPayload if available
        if ('mode' in payload && (payload.mode === 'TABLE' || payload.mode === 'LIST' || payload.mode === 'CHART')) {
          const dataPayload = payload as DataPayload;
          if (dataPayload.table?.rows) {
            enriched.results = dataPayload.table.rows as unknown as Array<Record<string, unknown>>;
            enriched.count = dataPayload.table.rows.length;
          } else if (dataPayload.list) {
            enriched.results = dataPayload.list.items as unknown as Array<Record<string, unknown>>;
            enriched.count = dataPayload.list.total;
          }
        }
        
        return enriched;
      }
      
      return base;
    });
  }, [currentConversationId, conversationMessages]);

  const onSend = async (content: string, images?: string[]) => {
    // Always use conversation API
    // If no conversation exists, createConversation will be called automatically in sendMessage
    const currentPage = typeof window !== 'undefined' ? window.location.pathname : undefined;
    await sendConversationMessage(content, currentPage, images);
    // Note: images parameter is not yet supported by conversation API, but kept for compatibility
  };
  
  const handleNewChat = async () => {
    clearCurrentConversation();
    setShowConversationList(false);
  };
  
  const handleSelectConversation = async (id: string) => {
    await selectConversation(id);
    setShowConversationList(false);
  };
  
  const handleQuickSuggestion = async (suggestion: string) => {
    // Create new conversation with the suggestion or send to current
    const currentPage = typeof window !== 'undefined' ? window.location.pathname : undefined;
    if (!currentConversationId) {
      await createConversation(suggestion);
    } else {
      await sendConversationMessage(suggestion, currentPage);
    }
  };
  
  const handleDeleteConversation = async (id: string) => {
    try {
      await deleteConversation(id);
      toast.success('Đã xóa cuộc hội thoại');
    } catch {
      toast.error('Không thể xóa cuộc hội thoại');
    }
  };
  
  const handleRenameConversation = async (id: string, title: string) => {
    try {
      await updateTitle(id, title);
      toast.success('Đã đổi tên cuộc hội thoại');
    } catch {
      toast.error('Không thể đổi tên cuộc hội thoại');
    }
  };
  
  const handleClearConversation = async () => {
    if (currentConversationId) {
      try {
        await clearMessages(currentConversationId);
        toast.success('Đã xóa tất cả tin nhắn');
      } catch {
        toast.error('Không thể xóa tin nhắn');
      }
    } else {
      // If no conversation, just clear current state
      clearCurrentConversation();
    }
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

      {/* Conversation List Toggle, New Chat & Refresh Button */}
      <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 border-b flex-shrink-0 bg-gray-50/50">
        <Button
          variant={showConversationList ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setShowConversationList(!showConversationList)}
          className={cn(
            "h-8 px-2 text-xs transition-all duration-200 ease-in-out",
            showConversationList && "bg-primary/10 text-primary"
          )}
        >
          <MessageSquare className="h-4 w-4 mr-1 transition-transform duration-200" />
          <span className="hidden sm:inline">Cuộc hội thoại</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleNewChat}
          className="h-8 px-2 text-xs flex-1 hover:bg-primary/5"
        >
          <Plus className="h-4 w-4 mr-1" />
          <span>Cuộc trò chuyện mới</span>
        </Button>
        {showConversationList && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => loadConversations()}
            disabled={conversationLoading}
            className="h-8 w-8 p-0 hover:bg-primary/5"
            aria-label="Làm mới danh sách"
            title="Làm mới danh sách"
          >
            <RefreshCw className={cn("h-4 w-4", conversationLoading && "animate-spin")} />
          </Button>
        )}
      </div>

      {/* Main Content Area - Show conversation list or messages */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        {/* Conversation List View */}
        <div
          className={cn(
            "absolute inset-0 flex flex-col transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] will-change-transform",
            showConversationList 
              ? "opacity-100 translate-x-0 scale-100 z-10" 
              : "opacity-0 -translate-x-[100%] scale-[0.96] pointer-events-none z-0"
          )}
          style={{ 
            transitionProperty: 'opacity, transform',
            transform: showConversationList 
              ? 'translateX(0) scale(1)' 
              : 'translateX(-100%) scale(0.96)',
          }}
        >
          <ConversationList
            conversations={conversations}
            currentConversationId={currentConversationId}
            loading={conversationLoading}
            onSelect={handleSelectConversation}
            onDelete={handleDeleteConversation}
            onRename={handleRenameConversation}
          />
        </div>

        {/* Messages View */}
        <div
          className={cn(
            "absolute inset-0 flex flex-col transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] will-change-transform",
            showConversationList 
              ? "opacity-0 translate-x-[100%] scale-[0.96] pointer-events-none z-0" 
              : "opacity-100 translate-x-0 scale-100 z-10"
          )}
          style={{ 
            transitionProperty: 'opacity, transform',
            transform: showConversationList 
              ? 'translateX(100%) scale(0.96)' 
              : 'translateX(0) scale(1)',
          }}
        >
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {activeLoading && (
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 px-2 sm:px-3 py-2">
                  <Loader2 className="animate-spin" size={16} /> Đang tải…
                </div>
              )}
            {activeError && (
              <div className="text-xs sm:text-sm text-red-600 px-2 sm:px-3 py-2">{activeError}</div>
              )}
            {messageList.length === 0 && !activeLoading && (
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
                      onClick={() => handleQuickSuggestion(q)}
                      className="w-fit max-w-full px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gray-100 text-gray-800 text-xs sm:text-sm hover:bg-gray-200 border text-left cursor-pointer transition-colors"
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
            {messageList.length > 0 && (
              <AIMessageList
                messages={messageList}
                            onOpenTable={(node) => {
                              setTableDialogContent(node);
                              setTableDialogOpen(true);
                            }}
                onAsk={handleQuickSuggestion}
                          />
                        )}
                      </div>
          <div className="flex-shrink-0 border-t bg-white">
            <AIInput onSend={onSend} disabled={activeSending} />
        </div>
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


