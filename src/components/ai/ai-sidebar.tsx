"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { useConversationStore } from '@/stores/conversation.store';
import { useUserStore } from '@/stores/userStore';
import { AIInput } from './ai-input';
import { cn } from '@/lib/utils';
import { Loader2, ChevronDown, Home, MessageSquare, Plus, RefreshCw, Brain, History } from 'lucide-react';
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
  // Show loading UI when loading messages or creating conversation
  const activeLoading = loadingMessages || conversationLoading;
  const activeSending = conversationSending;
  const activeError = conversationError;
  // Tenant suggestions (also used for guests)
  const tenantSuggestions: ReadonlyArray<string> = useMemo(
    () => [
      'Tìm trọ gần trường ĐH Công Nghiệp IUH',
      'Tìm phòng trọ giá rẻ dưới 4 triệu ở Gò Vấp',
      'Tìm phòng có máy lạnh và ban công',
      'Tìm bài đăng tìm người ở ghép mới nhất',
      'Hóa đơn tiền nhà tháng này bao nhiêu?',
      'Tôi còn nợ tiền phòng tháng nào không?',
      'Xem thông tin hợp đồng thuê của tôi',
      'Các vấn đề/sự cố tôi đã báo cáo',
      'Lấy thông tin liên lạc của chủ trọ',
      'Xem chỉ số điện nước tháng vừa rồi',
    ],
    [],
  );

  // Landlord suggestions
  const landlordSuggestions: ReadonlyArray<string> = useMemo(
    () => [
      'Có bao nhiêu phòng đang còn trống?',
      'Tổng doanh thu tháng trước',
      'Các phòng chưa thanh toán đầy đủ tiền thuê tháng này',
      'Các hợp đồng sắp hết hạn trong 30 ngày tới',
      'Có bao nhiêu vấn đề mới chưa được xử lý?',
      'Phòng nào sử dụng nhiều nước nhất tháng trước?',
      'Tổng số người thuê đang hoạt động trên tất cả các tòa nhà',
      'Có bao nhiêu người thuê đã dọn vào trong tháng này?',
      'Tôi còn trống phòng nào có diện tích lớn hơn 25m không',
      'Tỉ lệ nam nữ của dãy trọ',
      'Có bao nhiêu hợp đồng đang chờ ký?',
    ],
    [],
  );

  // Select suggestions based on user role (guest uses tenant suggestions)
  // Shuffle suggestions to show random order each time
  const quickSuggestions: ReadonlyArray<string> = useMemo(() => {
    const suggestions = isLandlord ? [...landlordSuggestions] : [...tenantSuggestions];
    // Fisher-Yates shuffle algorithm
    for (let i = suggestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [suggestions[i], suggestions[j]] = [suggestions[j], suggestions[i]];
    }
    return suggestions;
  }, [isLandlord, landlordSuggestions, tenantSuggestions]);
  // dialog helpers handled inline where needed


  // Load conversations on mount
  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  // Refresh conversations when opening the conversation list
  useEffect(() => {
    if (showConversationList) {
      void loadConversations();
    }
  }, [showConversationList, loadConversations]);

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
    // Always create a new conversation when clicking on suggestions
    // Clear current conversation first to ensure fresh start
    if (currentConversationId) {
      clearCurrentConversation();
    }
    await createConversation(suggestion);
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

      {/* Post Room, New Chat, Refresh & Conversation List Toggle */}
      <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 border-b flex-shrink-0 bg-gray-50/50">
        {/* Post Room Button for Landlords - First */}
        {isLandlord && (
          <Button
            variant="ghost"
            size="sm"
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
            className="h-8 px-2 text-xs hover:bg-primary/5"
          >
            <Home className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Đăng phòng</span>
          </Button>
        )}
        {/* New Chat Button - Second */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleNewChat}
          className="h-8 px-2 text-xs flex-1 hover:bg-primary/5"
        >
          <MessageSquare className="h-4 w-4 mr-1" />
          <span>Cuộc trò chuyện mới</span>
        </Button>
        {/* Refresh Button - Third */}
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
        {/* Conversation List Toggle - Last */}
        <Button
          variant={showConversationList ? "secondary" : "ghost"}
          size="sm"
          onClick={() => {
            const wasClosed = !showConversationList;
            setShowConversationList(!showConversationList);
            // Refresh conversations when opening the list
            if (wasClosed) {
              void loadConversations();
            }
          }}
          className={cn(
            "h-8 px-2 text-xs transition-all duration-200 ease-in-out",
            showConversationList && "bg-primary/10 text-primary"
          )}
        >
          <History className="h-4 w-4 mr-1 transition-transform duration-200" />
          <span className="hidden sm:inline">Lịch sử</span>
        </Button>
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
            {activeLoading && messageList.length === 0 && (
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 px-2 sm:px-3 py-2">
                  <Loader2 className="animate-spin" size={16} /> 
                  {conversationLoading ? 'Đang gửi tin nhắn...' : 'Đang tải...'}
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
                    {quickSuggestions.slice(0, 5).map((q, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleQuickSuggestion(q)}
                        disabled={activeLoading || activeSending}
                        className={cn(
                          "w-fit max-w-full px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm border text-left transition-colors",
                          activeLoading || activeSending
                            ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200 cursor-pointer"
                        )}
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
                    <DialogContent className="w-[90vw] max-w-[90vw] sm:max-w-[90vw] h-[90vh] max-h-[90vh] bg-white/95 backdrop:bg-black/20 top-8 flex flex-col">
                      <DialogHeader className="flex-shrink-0">
                        <DialogTitle className="text-sm sm:text-base">Xem bảng đầy đủ</DialogTitle>
                      </DialogHeader>
                      <div className="flex-1 overflow-auto w-full min-h-0">
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


