"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Image as ImageIcon, X } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

interface AttachmentPreview {
  file: File;
  url: string;
  type: 'image' | 'video';
}

interface MessageInputProps {
  onSendMessage: (content: string, attachments: File[]) => Promise<void> | void;
  disabled?: boolean;
}

export function MessageInput({ onSendMessage, disabled = false }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<AttachmentPreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments: AttachmentPreview[] = [];
    let hasError = false;

    Array.from(files).forEach((file) => {
      // Check file type
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');

      if (!isImage && !isVideo) {
        toast.error('Chỉ hỗ trợ file ảnh và video');
        hasError = true;
        return;
      }

      // Check file size (max 5MB per file)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error(`File "${file.name}" quá lớn. Kích thước tối đa 5MB/file`);
        hasError = true;
        return;
      }

      const url = URL.createObjectURL(file);
      newAttachments.push({
        file,
        url,
        type: isImage ? 'image' : 'video'
      });
    });

    if (!hasError && newAttachments.length > 0) {
      const updatedAttachments = [...attachments, ...newAttachments];
      
      // Check total size of all attachments (max 8MB total to be safe)
      const totalSize = updatedAttachments.reduce((sum, att) => sum + att.file.size, 0);
      const maxTotalSize = 8 * 1024 * 1024; // 8MB
      
      if (totalSize > maxTotalSize) {
        toast.error('Tổng dung lượng file vượt quá 8MB. Vui lòng giảm số lượng hoặc chọn file nhỏ hơn');
        // Cleanup new attachments
        newAttachments.forEach(a => URL.revokeObjectURL(a.url));
      } else {
        setAttachments(updatedAttachments);
      }
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    const newAttachments = [...attachments];
    URL.revokeObjectURL(newAttachments[index].url);
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
  };

  const handleSend = async () => {
    if (!message.trim() && attachments.length === 0) return;

    const files = attachments.map(a => a.file);

    // Final check before sending
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    const maxTotalSize = 8 * 1024 * 1024; // 8MB
    
    if (totalSize > maxTotalSize) {
      toast.error('Tổng dung lượng file vượt quá 8MB. Vui lòng giảm số lượng file');
      return;
    }

    try {
      await onSendMessage(message, files);

      // Cleanup after successful send
      attachments.forEach(a => URL.revokeObjectURL(a.url));
      setAttachments([]);
      setMessage("");
    } catch (error: unknown) {
      console.error('Failed to send message:', error);
      
      // Check for specific error types
      const err = error as { statusCode?: number; message?: string };
      
      // Check error message for specific types
      if (err?.message?.includes('TIMEOUT')) {
        toast.error('Upload hình ảnh quá lâu. Vui lòng kiểm tra kết nối mạng và thử lại');
      } else if (err?.message?.includes('FILE_TOO_LARGE') || err?.statusCode === 413 || err?.message?.includes('Body exceeded')) {
        toast.error('File quá lớn! Vui lòng giảm số lượng hoặc chọn file nhỏ hơn (tối đa 8MB)');
      } else if (err?.message?.includes('UPLOAD_FAILED')) {
        toast.error('Không thể upload file. Vui lòng thử lại');
      } else if (err?.message?.includes('Network') || err?.message?.includes('fetch')) {
        toast.error('Lỗi kết nối mạng. Vui lòng kiểm tra và thử lại');
      } else {
        toast.error('Không thể gửi tin nhắn. Vui lòng thử lại');
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 border-t bg-white">
      {/* Attachment Preview */}
      {attachments.length > 0 && (
        <div className="mb-3 flex gap-2 flex-wrap">
          {attachments.map((attachment, index) => (
            <div key={index} className="relative group">
              <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                {attachment.type === 'image' ? (
                  <Image
                    src={attachment.url}
                    alt="Preview"
                    width={80}
                    height={80}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <video
                    src={attachment.url}
                    className="object-cover w-full h-full"
                  />
                )}
              </div>
              <button
                onClick={() => removeAttachment(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-end gap-2">
        {/* Attachment Buttons */}
        <div className="flex gap-1 mb-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Đính kèm hình ảnh/video"
            disabled={disabled}
          >
            <ImageIcon size={20} />
          </button>

          {/* Other buttons can be added here */}
          {/* <button
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Emoji"
            disabled={disabled}
          >
            <Smile size={20} />
          </button> */}
        </div>

        {/* Text Input */}
        <Input
          type="text"
          placeholder="Nhập nội dung tin nhắn"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={disabled}
          className="flex-1"
        />

        {/* Send Button */}
        <Button
          onClick={handleSend}
          disabled={disabled || (!message.trim() && attachments.length === 0)}
        >
          Gửi
        </Button>
      </div>
    </div>
  );
}
