"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Image as ImageIcon, X } from "lucide-react";
import Image from "next/image";

interface AttachmentPreview {
  file: File;
  url: string;
  type: 'image' | 'video';
}

interface MessageInputProps {
  onSendMessage: (content: string, attachments: File[]) => void;
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

    Array.from(files).forEach((file) => {
      // Check file type
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');

      if (!isImage && !isVideo) {
        alert('Chỉ hỗ trợ file ảnh và video');
        return;
      }

      // Check file size (max 10MB)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        alert('File quá lớn. Kích thước tối đa 10MB');
        return;
      }

      const url = URL.createObjectURL(file);
      newAttachments.push({
        file,
        url,
        type: isImage ? 'image' : 'video'
      });
    });

    setAttachments([...attachments, ...newAttachments]);

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

  const handleSend = () => {
    if (!message.trim() && attachments.length === 0) return;

    const files = attachments.map(a => a.file);
    onSendMessage(message, files);

    // Cleanup
    attachments.forEach(a => URL.revokeObjectURL(a.url));
    setAttachments([]);
    setMessage("");
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
