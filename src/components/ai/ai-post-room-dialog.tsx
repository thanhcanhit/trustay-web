"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { X, Loader2, Upload, Send, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { uploadBulkImages } from '@/actions/upload.action';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { postAIRoomPublish, type RoomPublishResponse, RoomPublishingStatus } from '@/actions/ai.action';
import { getMyBuildings } from '@/actions/building.action';
import { TokenManager } from '@/lib/api-client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import type { CreateBuildingRequest, CreateRoomRequest, Building } from '@/types/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import parse from 'html-react-parser';

interface AIPostRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ImagePreview {
  id: string;
  file: File;
  preview: string;
  path?: string;
  isUploading?: boolean;
  uploadError?: boolean;
}

type DialogState = 'form' | 'loading' | 'clarification' | 'ready-to-create' | 'created' | 'creation-failed' | 'conversation';

interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export function AIPostRoomDialog({ open, onOpenChange }: AIPostRoomDialogProps) {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogState, setDialogState] = useState<DialogState>('form');
  const [replyText, setReplyText] = useState("");
  const [clarificationQuestions, setClarificationQuestions] = useState<string[]>([]);
  const [publishPlan, setPublishPlan] = useState<RoomPublishResponse['data'] | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [creationError, setCreationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const [conversationMessages, setConversationMessages] = useState<ConversationMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>("");
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [isLoadingBuildings, setIsLoadingBuildings] = useState(false);
  const [hasFetchedBuildings, setHasFetchedBuildings] = useState(false);

  const MAX_IMAGES = 5;

  // Fetch buildings when dialog opens
  useEffect(() => {
    if (!open || isLoadingBuildings || hasFetchedBuildings) return;

    const fetchBuildings = async () => {
      setIsLoadingBuildings(true);
      try {
        const token = TokenManager.getAccessToken();
        if (!token) {
          return;
        }

        const result = await getMyBuildings({ limit: 100 }, token);
        if (result.success && result.data?.buildings) {
          setBuildings(result.data.buildings);
          console.log('Fetched buildings:', result.data.buildings.length);
        } else {
          const errorMessage = 'error' in result ? result.error : 'Không thể tải danh sách dãy trọ';
          console.error('Failed to fetch buildings:', errorMessage);
        }
      } catch (error) {
        console.error('Error fetching buildings:', error);
      } finally {
        setIsLoadingBuildings(false);
        setHasFetchedBuildings(true);
      }
    };

    void fetchBuildings();
  }, [open, isLoadingBuildings, hasFetchedBuildings]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setDescription("");
      setImages([]);
      setSelectedBuildingId("");
      setDialogState('form');
      setConversationMessages([]);
      setReplyText("");
      setClarificationQuestions([]);
      setPublishPlan(null);
      setCreationError(null);
      setBuildings([]);
      setHasFetchedBuildings(false);
    }
  }, [open]);

  // Helper to send message to room-publish API
  const sendRoomPublishMessage = async (message: string, imagePaths?: string[], buildingId?: string) => {
    const token = TokenManager.getAccessToken();
    if (!token) {
      toast.error('Bạn cần đăng nhập để đăng phòng');
      return null;
    }

    try {
      setIsThinking(true);
      const response = await postAIRoomPublish(message, imagePaths, token, buildingId);

      if (!response.success) {
        toast.error(response.error || response.message || 'Có lỗi xảy ra');
        return null;
      }

      return response;
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Không thể gửi tin nhắn. Vui lòng thử lại.');
      return null;
    } finally {
      setIsThinking(false);
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if ((dialogState === 'conversation' || dialogState === 'clarification') && messagesEndRef.current && messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      if (isNearBottom) {
        requestAnimationFrame(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
      }
    }
  }, [conversationMessages, dialogState]);

  // Auto-redirect when room is created
  useEffect(() => {
    if (dialogState === 'created' && publishPlan?.payload?.roomId) {
      const roomId = publishPlan.payload.roomId;
      if (roomId) {
        const timer = setTimeout(() => {
          // Use roomId to build path
          router.push(`/rooms/${roomId}`);
          // Close dialog after navigation
          onOpenChange(false);
        }, 2000);

        return () => clearTimeout(timer);
      }
    }
  }, [dialogState, publishPlan?.payload?.roomId, router, onOpenChange]);

  // Handle response and update state based on status
  const handleResponse = (response: RoomPublishResponse | null) => {
    if (!response || !response.data) return;

    const { data } = response;
    // Status is now in payload.status
    const status = data.payload?.status || RoomPublishingStatus.NEED_MORE_INFO;

    // Prepare assistant message (but don't add to conversation yet)
    const assistantMessage: ConversationMessage = {
      id: `assistant_${Date.now()}`,
      role: 'assistant',
      content: data.message,
      timestamp: data.timestamp || new Date().toISOString(),
    };

    // Handle different statuses
    switch (status) {
      case RoomPublishingStatus.NEED_MORE_INFO:
        // AI needs more information
        // Don't add assistant message to conversation in clarification mode
        // Only set the plan data to access the message
        setPublishPlan(data);
        setClarificationQuestions([]);
        // Extract questions from message if available
        const questionLines = data.message
          .split('\n')
          .filter(line => {
            const trimmed = line.trim();
            return trimmed.startsWith('•') ||
              trimmed.startsWith('-') ||
              trimmed.startsWith('*') ||
              /^\d+\./.test(trimmed);
          })
          .map(line => line.replace(/^[•\-*\d.]+\s*/, '').trim())
          .filter(line => line.length > 0);

        if (questionLines.length > 0) {
          setClarificationQuestions(questionLines);
          setDialogState('clarification');
        } else {
          // If no structured questions, add to conversation
          setConversationMessages(prev => [...prev, assistantMessage]);
          setDialogState('conversation');
        }
        break;

      case RoomPublishingStatus.READY_TO_CREATE:
        // AI has enough info, show plan
        setPublishPlan(data);
        setDialogState('ready-to-create');
        break;

      case RoomPublishingStatus.CREATED:
        // Room created successfully
        setPublishPlan(data);
        setDialogState('created');
        break;

      case RoomPublishingStatus.CREATION_FAILED:
        // Creation failed
        setCreationError(data.payload?.error || data.message || 'Không thể tạo phòng');
        setDialogState('creation-failed');
        break;

      default:
        // Fallback to conversation
        setDialogState('conversation');
        break;
    }
  };

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files) return;

    setImages((currentImages) => {
      const currentCount = currentImages.length;
      const remainingSlots = MAX_IMAGES - currentCount;
      if (remainingSlots <= 0) return currentImages;

      const newImages: ImagePreview[] = [];
      const filesToUpload: File[] = [];

      for (let i = 0; i < files.length && newImages.length < remainingSlots; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;
        if (file.size > 5 * 1024 * 1024) continue; // Max 5MB

        const preview = URL.createObjectURL(file);
        const imagePreview: ImagePreview = {
          id: Math.random().toString(36).substr(2, 9),
          file,
          preview,
          isUploading: true,
        };
        newImages.push(imagePreview);
        filesToUpload.push(file);
      }

      if (newImages.length === 0) return currentImages;

      // Add new images immediately
      const updatedImages = [...currentImages, ...newImages];

      // Upload images
      setIsUploading(true);
      uploadBulkImages(filesToUpload)
        .then((response) => {
          setImages((prev) => prev.map((img) => {
            const newImageIndex = newImages.findIndex(ni => ni.id === img.id);
            if (newImageIndex !== -1 && response.results[newImageIndex]) {
              return {
                ...img,
                path: response.results[newImageIndex].imagePath,
                isUploading: false,
              };
            }
            return img;
          }));
        })
        .catch((error) => {
          console.error('Failed to upload images:', error);
          setImages((prev) => prev.map(img => {
            if (newImages.some(ni => ni.id === img.id)) {
              return { ...img, isUploading: false, uploadError: true };
            }
            return img;
          }));
        })
        .finally(() => {
          setIsUploading(false);
        });

      return updatedImages;
    });
  }, []);

  const removeImage = useCallback((id: string) => {
    setImages(prev => {
      const imageToRemove = prev.find(img => img.id === id);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return prev.filter(img => img.id !== id);
    });
  }, []);

  const handleSubmit = async () => {
    const content = description.trim();
    if (!content && images.length === 0) return;

    const hasUploadingImages = images.some(img => img.isUploading);
    if (hasUploadingImages) return;

    const imagePaths = images
      .filter(img => img.path && !img.isUploading && !img.uploadError)
      .map(img => img.path!);

    try {
      setIsSubmitting(true);
      const messageContent = content || 'Đăng tải phòng trọ';

      // Add initial user message to conversation
      const userMessage: ConversationMessage = {
        id: `user_${Date.now()}`,
        role: 'user',
        content: messageContent,
        timestamp: new Date().toISOString(),
      };
      setConversationMessages([userMessage]);

      // Change to loading state
      setDialogState('loading');

      // Send to room-publish API
      const response = await sendRoomPublishMessage(
        messageContent,
        imagePaths.length > 0 ? imagePaths : undefined,
        selectedBuildingId || undefined
      );

      // Handle response
      handleResponse(response);

      // Clear initial form but keep images for context
      setDescription("");
    } catch (error) {
      console.error('Failed to send:', error);
      setDialogState('form');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (question?: string) => {
    const content = question || replyText.trim();
    if (!content || isThinking) return;

    try {
      // Add user message to conversation
      const userMessage: ConversationMessage = {
        id: `user_${Date.now()}`,
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
      };
      setConversationMessages(prev => [...prev, userMessage]);

      setReplyText("");
      if (dialogState === 'clarification') {
        setDialogState('loading');
      }

      // Get image paths if available
      const imagePaths = images
        .filter(img => img.path && !img.isUploading && !img.uploadError)
        .map(img => img.path!);

      // Send to room-publish API
      const response = await sendRoomPublishMessage(
        content,
        imagePaths.length > 0 ? imagePaths : undefined,
        selectedBuildingId || undefined
      );

      // Handle response
      handleResponse(response);
    } catch (error) {
      console.error('Failed to reply:', error);
    }
  };

  // Trigger room creation by sending empty request (backend will handle creation)
  const handleCreateRoom = async () => {
    if (!publishPlan) return;

    const token = TokenManager.getAccessToken();
    if (!token) {
      toast.error('Bạn cần đăng nhập');
      return;
    }

    try {
      setIsCreating(true);
      setDialogState('loading');

      // Send empty request to trigger creation
      const imagePaths = images
        .filter(img => img.path && !img.isUploading && !img.uploadError)
        .map(img => img.path!);

      const response = await sendRoomPublishMessage(
        '', // Empty message triggers creation
        imagePaths.length > 0 ? imagePaths : undefined,
        selectedBuildingId || undefined
      );

      // Handle response (should be CREATED or CREATION_FAILED)
      handleResponse(response);
    } catch (error) {
      console.error('Failed to create room:', error);
      toast.error('Có lỗi xảy ra khi tạo phòng');
      setDialogState('ready-to-create');
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting || isThinking || isCreating) return;
    setDescription("");
    setReplyText("");
    setDialogState('form');
    setConversationMessages([]);
    setClarificationQuestions([]);
    setPublishPlan(null);
    images.forEach(img => URL.revokeObjectURL(img.preview));
    setImages([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0"
        style={{ zIndex: 10001 }}
      >
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0">
          <DialogTitle>Đăng phòng nhanh với Trustay AI</DialogTitle>
          <DialogDescription>
            {dialogState === 'form' && "Mô tả phòng trọ của bạn và thêm hình ảnh. AI sẽ giúp bạn tạo bài đăng hoàn chỉnh."}
            {dialogState === 'loading' && "AI đang xử lý yêu cầu của bạn..."}
            {dialogState === 'clarification' && "AI cần thêm thông tin để hoàn thiện bài đăng."}
            {dialogState === 'ready-to-create' && "AI đã sẵn sàng tạo phòng cho bạn. Bạn có muốn tạo ngay không?"}
            {dialogState === 'created' && "Tuyệt vời! Phòng trọ của bạn đã được tạo thành công."}
            {dialogState === 'creation-failed' && "Có lỗi xảy ra khi tạo phòng. Vui lòng thử lại."}
            {dialogState === 'conversation' && "Tiếp tục trò chuyện với AI để hoàn thiện bài đăng của bạn."}
          </DialogDescription>
        </DialogHeader>

        {dialogState === 'form' && (
          <div className="flex-1 overflow-y-auto space-y-4 px-6 pb-4">
            {/* Building Select */}
            <div className="space-y-2">
              <label htmlFor="building" className="text-sm font-medium">
                Chọn dãy trọ (tùy chọn)
              </label>
              {isLoadingBuildings ? (
                <div className="border border-gray-200 rounded-lg p-4 text-center">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">Đang tải danh sách dãy trọ...</p>
                </div>
              ) : buildings.length === 0 ? (
                <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-900 font-medium mb-1">
                    Bạn chưa có dãy trọ nào
                  </p>
                  <p className="text-xs text-blue-700">
                    Hãy điền thông tin phòng trọ bên dưới, chúng tôi sẽ tạo dãy trọ mới giúp bạn.
                  </p>
                </div>
              ) : (
                <>
                  <Select
                    value={selectedBuildingId || "new-building"}
                    onValueChange={(value) => setSelectedBuildingId(value === "new-building" ? "" : value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="building" className="w-full">
                      <SelectValue placeholder="Chọn dãy trọ hoặc để trống để tạo mới">
                        {selectedBuildingId ? (
                          buildings.find(b => b.id === selectedBuildingId)?.name || ""
                        ) : null}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="z-[10002]">
                      <SelectItem value="new-building">
                        <span className="text-gray-500 italic">Không chọn (Tạo dãy trọ mới)</span>
                      </SelectItem>
                      {buildings.map((building) => {
                        // Format location string
                        const locationParts: string[] = [];
                        if (building.location?.wardName) locationParts.push(building.location.wardName);
                        if (building.location?.districtName) locationParts.push(building.location.districtName);
                        if (building.location?.provinceName) locationParts.push(building.location.provinceName);
                        const locationText = locationParts.length > 0
                          ? locationParts.join(', ')
                          : building.addressLine1 || '';

                        return (
                          <SelectItem key={building.id} value={building.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{building.name}</span>
                              {locationText && (
                                <span className="text-xs text-gray-500 mt-0.5">
                                  {locationText}
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {selectedBuildingId && (
                    <p className="text-xs text-gray-500">
                      Phòng sẽ được thêm vào dãy trọ đã chọn
                    </p>
                  )}
                  {!selectedBuildingId && (
                    <p className="text-xs text-gray-500">
                      Để trống nếu bạn muốn tạo dãy trọ mới
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Description Textarea */}
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Mô tả phòng trọ
              </label>
              <Textarea
                id="description"
                placeholder="Ví dụ: Phòng trọ 20m², có máy lạnh, wifi, gần trường học, giá 2 triệu/tháng..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[120px] resize-none"
                disabled={isSubmitting}
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Hình ảnh phòng (tùy chọn)</label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
                disabled={isUploading || isSubmitting}
              />

              {/* Upload Button */}
              {images.length < MAX_IMAGES && (
                <div
                  onClick={() => !isUploading && !isSubmitting && fileInputRef.current?.click()}
                  className={cn(
                    "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
                    isUploading || isSubmitting
                      ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-50"
                      : "border-gray-300 cursor-pointer hover:border-primary hover:bg-primary/5"
                  )}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && !isUploading && !isSubmitting) {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-8 w-8 text-primary animate-spin" />
                      <p className="text-sm text-gray-600">Đang tải lên...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-8 w-8 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Click để chọn ảnh</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {images.length}/{MAX_IMAGES} ảnh • Tối đa 5MB/ảnh
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Image Preview Grid */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                  {images.map((img) => (
                    <div key={img.id} className="relative group aspect-square rounded-lg border border-gray-200 overflow-hidden bg-gray-100">
                      <div className="absolute inset-0">
                        <Image
                          src={img.preview}
                          alt="Preview"
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 50vw, 33vw"
                        />
                      </div>
                      {img.isUploading && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                          <Loader2 className="h-6 w-6 text-white animate-spin" />
                        </div>
                      )}
                      {img.uploadError && (
                        <div className="absolute inset-0 bg-red-500/70 flex items-center justify-center z-10">
                          <X className="h-6 w-6 text-white" />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(img.id);
                        }}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-all z-20 border-2 border-white opacity-0 group-hover:opacity-100"
                        aria-label="Remove image"
                        disabled={isSubmitting}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loading State */}
        {dialogState === 'loading' && (
          <div className="flex-1 flex items-center justify-center px-6 py-12">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="relative">
                  <Sparkles className="h-16 w-16 text-primary animate-pulse" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">AI đang xử lý...</h3>
                <p className="text-sm text-gray-600">Vui lòng đợi trong giây lát</p>
              </div>
            </div>
          </div>
        )}

        {/* Clarification State */}
        {dialogState === 'clarification' && (
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">AI cần thêm thông tin</h3>
                  {/* Show AI message if available */}
                  {publishPlan?.message && (
                    <div className="text-sm text-blue-800 mb-3 prose prose-sm max-w-none [&_*]:text-sm [&_*]:text-blue-800 [&_p]:mb-2">
                      {parse(publishPlan.message)}
                    </div>
                  )}
                  {clarificationQuestions.length > 0 && (
                    <>
                      <p className="text-sm text-blue-800 mb-3">
                        Bạn có thể trả lời bằng cách chọn một trong các gợi ý sau:
                      </p>
                      <div className="space-y-2">
                        {clarificationQuestions.map((question, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleReply(question)}
                            className="w-full text-left bg-white border border-blue-200 rounded-lg px-4 py-3 hover:bg-blue-50 hover:border-blue-300 transition-colors text-sm text-blue-900"
                          >
                            {question}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Reply Input */}
            <div className="border-t pt-4">
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder="Hoặc nhập câu trả lời của bạn..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      void handleReply();
                    }
                  }}
                  disabled={isThinking}
                  className="flex-1"
                />
                <Button
                  onClick={() => handleReply()}
                  disabled={!replyText.trim() || isThinking}
                  size="icon"
                >
                  {isThinking ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Ready to Create State - Show plan confirmation */}
        {dialogState === 'ready-to-create' && publishPlan?.payload?.plan && (() => {
          const plan = publishPlan.payload.plan;
          const building = plan.buildingPayload as CreateBuildingRequest | undefined;
          const room = plan.roomPayload as CreateRoomRequest | undefined;

          return (
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-green-900 mb-2">Sẵn sàng tạo phòng!</h3>
                    <p className="text-sm text-green-800 mb-3">
                      {publishPlan.message || "AI đã chuẩn bị xong thông tin. Bạn có muốn tạo phòng ngay không?"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Plan Details */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                <h4 className="text-sm font-semibold text-gray-900">Thông tin sẽ được tạo:</h4>

                {plan.shouldCreateBuilding && building && (
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-gray-700">Dãy trọ mới:</div>
                    <div className="text-xs text-gray-600 pl-3">
                      {String(building?.name || 'N/A')}
                    </div>
                  </div>
                )}

                {room && (
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-gray-700">Phòng trọ:</div>
                    <div className="text-xs text-gray-600 pl-3 space-y-1">
                      <div>Tên: {String(room?.name || 'N/A')}</div>
                      {room?.pricing && (
                        <div>
                          Giá: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                            room.pricing?.basePriceMonthly || 0
                          )}/tháng
                        </div>
                      )}
                      {room?.description && (
                        <div className="text-gray-500 prose prose-sm max-w-none [&_*]:text-xs [&_*]:text-gray-500 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-gray-700 [&_h3]:mt-2 [&_h3]:mb-1 [&_p]:mb-1 [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:space-y-1 [&_li]:mb-0.5 [&_strong]:font-semibold [&_strong]:text-gray-700">
                          {parse(String(room.description))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {plan.description && (
                  <div className="text-xs text-gray-500 prose prose-sm max-w-none pt-2 border-t [&_*]:text-xs [&_*]:text-gray-500 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-gray-700 [&_h3]:mt-2 [&_h3]:mb-1 [&_p]:mb-1 [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:space-y-1 [&_li]:mb-0.5 [&_strong]:font-semibold [&_strong]:text-gray-700">
                    {parse(String(plan.description))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={isCreating}
                  className="flex-1"
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleCreateRoom}
                  disabled={isCreating}
                  className="flex-1"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang tạo...
                    </>
                  ) : (
                    'Tạo phòng ngay'
                  )}
                </Button>
              </div>
            </div>
          );
        })()}

        {/* Created State - Room created successfully */}
        {dialogState === 'created' && (
          <div className="flex-1 flex items-center justify-center px-6 py-12">
            <div className="text-center space-y-4 max-w-md">
              <div className="flex justify-center">
                <div className="relative">
                  <CheckCircle2 className="h-20 w-20 text-green-500" />
                  <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Thành công!</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {publishPlan?.message || "Phòng trọ của bạn đã được tạo thành công. Đang chuyển hướng..."}
                </p>
              </div>
              {publishPlan?.payload?.roomId && (
                <div className="flex gap-3 w-full">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const roomId = publishPlan.payload?.roomId;
                      if (roomId) {
                        router.push(`/rooms/${roomId}`);
                        handleClose();
                      }
                    }}
                    className="flex-1"
                  >
                    Xem phòng
                  </Button>
                  <Button
                    onClick={() => {
                      const roomId = publishPlan.payload?.roomId;
                      if (roomId) {
                        router.push(`/dashboard/landlord/properties/rooms/${roomId}`);
                        handleClose();
                      }
                    }}
                    className="flex-1"
                  >
                    Chỉnh sửa chi tiết phòng
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Creation Failed State */}
        {dialogState === 'creation-failed' && (
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-red-900 mb-2">Không thể tạo phòng</h3>
                  <p className="text-sm text-red-800 mb-3">
                    {creationError || publishPlan?.message || "Đã xảy ra lỗi khi tạo phòng. Vui lòng thử lại."}
                  </p>
                </div>
              </div>
            </div>

            {/* Show plan details if available */}
            {publishPlan?.payload?.plan && (() => {
              const plan = publishPlan.payload.plan;
              const building = plan.buildingPayload as CreateBuildingRequest | undefined;
              const room = plan.roomPayload as CreateRoomRequest | undefined;

              return (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                  <h4 className="text-sm font-semibold text-gray-900">Thông tin đã chuẩn bị:</h4>

                  {plan.shouldCreateBuilding && building && (
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-gray-700">Dãy trọ mới:</div>
                      <div className="text-xs text-gray-600 pl-3">
                        {String(building?.name || 'N/A')}
                      </div>
                    </div>
                  )}

                  {room && (
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-gray-700">Phòng trọ:</div>
                      <div className="text-xs text-gray-600 pl-3 space-y-1">
                        <div>Tên: {String(room?.name || 'N/A')}</div>
                        {room?.pricing && (
                          <div>
                            Giá: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                              room.pricing?.basePriceMonthly || 0
                            )}/tháng
                          </div>
                        )}
                        {room?.description && (
                          <div className="text-gray-500 prose prose-sm max-w-none [&_*]:text-xs [&_*]:text-gray-500 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-gray-700 [&_h3]:mt-2 [&_h3]:mb-1 [&_p]:mb-1 [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:space-y-1 [&_li]:mb-0.5 [&_strong]:font-semibold [&_strong]:text-gray-700">
                            {parse(String(room.description))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {plan.description && (
                    <div className="text-xs text-gray-500 prose prose-sm max-w-none pt-2 border-t [&_*]:text-xs [&_*]:text-gray-500 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-gray-700 [&_h3]:mt-2 [&_h3]:mb-1 [&_p]:mb-1 [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:space-y-1 [&_li]:mb-0.5 [&_strong]:font-semibold [&_strong]:text-gray-700">
                      {parse(String(plan.description))}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setDialogState('ready-to-create');
                  setCreationError(null);
                }}
                className="flex-1"
              >
                Thử lại
              </Button>
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Hủy
              </Button>
            </div>
          </div>
        )}

        {/* Conversation State */}
        {dialogState === 'conversation' && (
          <>
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto px-6 py-4 space-y-3 min-h-0"
            >
              {conversationMessages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg px-3 py-2 text-sm break-words",
                      message.role === 'user'
                        ? "bg-primary text-primary-foreground"
                        : "bg-gray-100 text-gray-900"
                    )}
                  >
                    {message.id === 'typing' ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>AI đang suy nghĩ...</span>
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    )}
                  </div>
                </div>
              ))}
              {isThinking && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg px-3 py-2 bg-gray-100 text-sm">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>AI đang suy nghĩ...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply Input */}
            <div className="border-t px-6 py-4 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder="Trả lời AI..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      void handleReply();
                    }
                  }}
                  disabled={isThinking}
                  className="flex-1"
                />
                <Button
                  onClick={() => handleReply()}
                  disabled={!replyText.trim() || isThinking}
                  size="icon"
                >
                  {isThinking ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        )}

        {dialogState === 'form' && (
          <DialogFooter className="px-6 pb-6 flex-shrink-0">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                isSubmitting ||
                (!description.trim() && images.length === 0) ||
                images.some(img => img.isUploading)
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                'Tạo phòng ngay'
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

