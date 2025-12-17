"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { X, Loader2 } from 'lucide-react';
import { uploadBulkImages } from '@/actions/upload.action';
import Image from 'next/image';

interface AIInputProps {
  onSend: (content: string, images?: string[]) => void | Promise<void>;
  disabled?: boolean;
}

interface ImagePreview {
  id: string;
  file: File;
  preview: string;
  path?: string; // Server path after upload
  isUploading?: boolean;
  uploadError?: boolean;
}

export function AIInput({ onSend, disabled = false }: AIInputProps) {
  const [value, setValue] = useState("");
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Add custom scrollbar styles
  useEffect(() => {
    if (!scrollContainerRef.current) return;
    
    const styleId = 'ai-input-scrollbar-style';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .ai-input-scroll-container::-webkit-scrollbar {
        height: 6px;
      }
      .ai-input-scroll-container::-webkit-scrollbar-track {
        background: transparent;
      }
      .ai-input-scroll-container::-webkit-scrollbar-thumb {
        background-color: #cbd5e1;
        border-radius: 3px;
      }
      .ai-input-scroll-container::-webkit-scrollbar-thumb:hover {
        background-color: #94a3b8;
      }
    `;
    document.head.appendChild(style);

    return () => {
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || disabled) return;

    const newImages: ImagePreview[] = [];
    const filesToUpload: File[] = [];

    // Process selected files
    for (let i = 0; i < files.length; i++) {
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

    if (newImages.length === 0) return;

    // Add to state immediately
    setImages(prev => [...prev, ...newImages]);

    // Upload images
    try {
      setIsUploading(true);
      const response = await uploadBulkImages(filesToUpload);
      
      // Update images with server paths
      setImages(prev => prev.map((img) => {
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
    } catch (error) {
      console.error('Failed to upload images:', error);
      // Mark failed images
      setImages(prev => prev.map(img => {
        if (newImages.some(ni => ni.id === img.id)) {
          return { ...img, isUploading: false, uploadError: true };
        }
        return img;
      }));
    } finally {
      setIsUploading(false);
    }
  }, [disabled]);

  const removeImage = useCallback((id: string) => {
    setImages(prev => {
      const imageToRemove = prev.find(img => img.id === id);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return prev.filter(img => img.id !== id);
    });
  }, []);

  const doSend = async () => {
    const content = value.trim();
    if (!content && images.length === 0) return;

    // Wait for all images to finish uploading before sending
    const hasUploadingImages = images.some(img => img.isUploading);
    if (hasUploadingImages) {
      // Don't send if images are still uploading
      return;
    }

    // Get uploaded image paths (only successfully uploaded images)
    const imagePaths = images
      .filter(img => img.path && !img.isUploading && !img.uploadError)
      .map(img => img.path!);

    // Store current images for cleanup
    const imagesToCleanup = [...images];

    // Clear input and images immediately (optimistic clear)
    setValue("");
    imagesToCleanup.forEach(img => URL.revokeObjectURL(img.preview));
    setImages([]);

    // Send message (don't await to clear immediately)
    try {
      await onSend(content, imagePaths.length > 0 ? imagePaths : undefined);
    } catch (error) {
      // If send fails, restore the content (optional - depends on UX preference)
      console.error('Failed to send message:', error);
      // Uncomment below if you want to restore content on error:
      // setValue(content);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void doSend();
    }
  };

  return (
    <div className="p-2 sm:p-3 md:p-4 border-t bg-white flex-shrink-0 space-y-2">
      {/* Image previews */}
      {images.length > 0 && (
        <div 
          ref={scrollContainerRef}
          className="ai-input-scroll-container flex gap-2 overflow-x-auto pb-1 -mx-1 px-1"
          style={{ 
            scrollbarWidth: 'thin', 
            scrollbarColor: '#cbd5e1 transparent',
          }}
        >
          {images.map((img) => (
            <div key={img.id} className="relative group flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg border border-gray-200 overflow-visible bg-gray-100 shadow-sm">
              <div className="absolute inset-0 overflow-hidden rounded-lg">
                <Image
                  src={img.preview}
                  alt="Preview"
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 64px, 80px"
                />
              </div>
              {img.isUploading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10 rounded-lg">
                  <Loader2 className="h-5 w-5 text-white animate-spin" />
                </div>
              )}
              {img.uploadError && (
                <div className="absolute inset-0 bg-red-500/70 flex items-center justify-center z-10 rounded-lg">
                  <X className="h-5 w-5 text-white" />
                </div>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(img.id);
                }}
                className="absolute top-1.5 right-1.5 w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-red-500 hover:bg-red-600 active:bg-red-700 text-white flex items-center justify-center shadow-lg transition-all z-20 border-2 border-white"
                aria-label="Remove image"
              >
                <X className="h-2 w-2 sm:h-3.5 sm:w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={disabled || isUploading}
        />
        {/* <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
          className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Upload image"
          title="Upload image"
        >
          <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
        </Button> */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-1 bg-gray-50 border border-gray-200 rounded-xl sm:rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 min-h-[2rem] sm:min-h-[2.5rem]">
          <Input
            type="text"
            placeholder="Ask anything"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={disabled}
            className="flex-1 border-0 bg-transparent drop-shadow-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-500 text-xs sm:text-sm h-auto p-0"
          />
          <button
            onClick={() => void doSend()}
            disabled={
              disabled || 
              (value.trim().length === 0 && images.length === 0) || 
              isUploading ||
              images.some(img => img.isUploading)
            }
            className="inline-flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-black hover:bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 text-sm sm:text-base transition-colors"
            aria-label="Send"
            title={images.some(img => img.isUploading) ? "Đang tải ảnh..." : "Send"}
          >
            <span className="sr-only">Send</span>
            ↑
          </button>
        </div>
      </div>
    </div>
  );
}


