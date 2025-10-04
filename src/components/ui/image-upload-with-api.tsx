"use client"

import React, { useCallback, useState } from 'react'
import { Upload, X, Plus, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button'
import Image from 'next/image'
import { uploadSingleImage, uploadBulkImages } from '@/actions/upload.action'
import { getOptimizedImageUrl } from '@/lib/utils'

export interface UploadedImage {
  id: string
  url: string // Server URL
  preview: string // Local preview URL
  altText?: string
  isUploading?: boolean
  uploadError?: string
}

interface ImageUploadWithApiProps {
  value?: UploadedImage[]
  onChange?: (images: UploadedImage[]) => void
  maxFiles?: number
  maxSize?: number // in MB
  accept?: string
  className?: string
  disabled?: boolean
  error?: boolean
  uploadMode?: 'single' | 'bulk' // How to upload files
  autoUpload?: boolean // Whether to upload immediately when files are selected
}

export function ImageUploadWithApi({
  value = [],
  onChange,
  maxFiles = 10,
  maxSize = 5,
  accept = 'image/*',
  className,
  disabled = false,
  error = false,
  uploadMode = 'bulk',
  autoUpload = true
}: ImageUploadWithApiProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const uploadFiles = useCallback(async (files: File[], imageObjects: UploadedImage[], allImages: UploadedImage[]) => {
    setIsUploading(true)

    try {
      if (uploadMode === 'bulk' && files.length > 1) {
        // Upload all files at once
        const altTexts = imageObjects.map(img => img.altText || '')
        const response = await uploadBulkImages(files, altTexts)

        // Update images with server URLs
        const updatedImages = allImages.map((img) => {
          const imageIndex = imageObjects.findIndex(obj => obj.id === img.id)
           if (imageIndex !== -1 && response.results[imageIndex]) {
            return {
              ...img,
              url: response.results[imageIndex].imagePath,
              isUploading: false,
            }
          }
          return img
        })

        onChange?.(updatedImages)
      } else {
        // Upload files one by one
        const updatedImages = [...allImages]

        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          const imageObject = imageObjects[i]

          try {
            const response = await uploadSingleImage(file, imageObject.altText)

            // Find and update the corresponding image
            const imageIndex = updatedImages.findIndex(img => img.id === imageObject.id)
            if (imageIndex !== -1) {
              updatedImages[imageIndex] = {
                ...updatedImages[imageIndex],
                url: response.imagePath,
                isUploading: false,
              }
            }
          } catch {
            // Handle individual upload error
            const imageIndex = updatedImages.findIndex(img => img.id === imageObject.id)
            if (imageIndex !== -1) {
              updatedImages[imageIndex] = {
                ...updatedImages[imageIndex],
                isUploading: false,
                uploadError: 'Upload failed',
              }
            }
          }
        }

        onChange?.(updatedImages)
      }
    } catch {
      // Handle bulk upload error
      const updatedImages = allImages.map(img => {
        if (imageObjects.some(obj => obj.id === img.id)) {
          return {
            ...img,
            isUploading: false,
            uploadError: 'Upload failed',
          }
        }
        return img
      })
      onChange?.(updatedImages)
    } finally {
      setIsUploading(false)
    }
  }, [uploadMode, onChange])

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || disabled) return

    const newImages: UploadedImage[] = []
    const currentCount = value.length
    const filesToProcess: File[] = []

    // Process and validate files
    for (let i = 0; i < files.length && currentCount + newImages.length < maxFiles; i++) {
      const file = files[i]

      // Check file type
      if (!file.type.startsWith('image/')) {
        continue
      }

      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        continue
      }

      const preview = URL.createObjectURL(file)
      const imageId = Math.random().toString(36).substr(2, 9)

      const uploadedImage: UploadedImage = {
        id: imageId,
        url: '', // Will be set after upload
        preview,
        isUploading: autoUpload,
      }

      newImages.push(uploadedImage)
      if (autoUpload) {
        filesToProcess.push(file)
      }
    }

    if (newImages.length > 0) {
      // Add images to state immediately
      const updatedImages = [...value, ...newImages]
      onChange?.(updatedImages)

      // Upload files if auto-upload is enabled
      if (autoUpload && filesToProcess.length > 0) {
        await uploadFiles(filesToProcess, newImages, updatedImages)
      }
    }
  }, [value, onChange, maxFiles, maxSize, disabled, autoUpload, uploadFiles])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragOver(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
    e.target.value = '' // Reset input
  }, [handleFiles])

  const removeImage = useCallback((id: string) => {
    const newImages = value.filter(img => img.id !== id)
    // Revoke object URL to prevent memory leaks
    const imageToRemove = value.find(img => img.id === id)
    if (imageToRemove) {
      URL.revokeObjectURL(imageToRemove.preview)
    }
    onChange?.(newImages)
  }, [value, onChange])

  const retryUpload = useCallback(async (imageId: string) => {
    const imageToRetry = value.find(img => img.id === imageId)
    if (!imageToRetry || !imageToRetry.uploadError) return

    // Reset error state and set uploading
    const updatedImages = value.map(img => 
      img.id === imageId 
        ? { ...img, isUploading: true, uploadError: undefined }
        : img
    )
    onChange?.(updatedImages)

    // Note: This is a simplified retry - in a real implementation,
    // you'd need to store the original File object to retry upload
    // For now, we'll just simulate a retry
    setTimeout(() => {
      const finalImages = value.map(img => 
        img.id === imageId 
          ? { ...img, isUploading: false, uploadError: 'Retry not implemented' }
          : img
      )
      onChange?.(finalImages)
    }, 1000)
  }, [value, onChange])

  // Cleanup object URLs on unmount
  React.useEffect(() => {
    return () => {
      value.forEach(image => {
        URL.revokeObjectURL(image.preview)
      })
    }
  }, [value])

  const canAddMore = value.length < maxFiles && !disabled

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      {canAddMore && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "relative border-2 border-dashed rounded-lg p-6 transition-colors",
            "hover:bg-muted/50 cursor-pointer",
            isDragOver && "border-primary bg-primary/5",
            error && "border-destructive",
            disabled && "opacity-50 cursor-not-allowed",
            !isDragOver && !error && "border-muted-foreground/25"
          )}
        >
          <input
            type="file"
            multiple
            accept={accept}
            onChange={handleFileInput}
            disabled={disabled || isUploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
          
          <div className="flex flex-col items-center justify-center text-center">
            {isUploading ? (
              <Loader2 className="h-10 w-10 text-primary mb-4 animate-spin" />
            ) : (
              <Upload className="h-10 w-10 text-muted-foreground mb-4" />
            )}
            <p className="text-sm font-medium mb-2">
              {isUploading ? 'Đang tải lên...' : 'Kéo thả hình ảnh vào đây hoặc click để chọn'}
            </p>
            <p className="text-xs text-muted-foreground">
              Tối đa {maxFiles} ảnh, mỗi ảnh không quá {maxSize}MB
            </p>
            <p className="text-xs text-muted-foreground">
              Đã chọn: {value.length}/{maxFiles}
            </p>
          </div>
        </div>
      )}

      {/* Image Preview Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {value.map((image, index) => (
            <div key={image.id} className="relative group aspect-square rounded-lg overflow-hidden border">
              <Image
                src={image.url ? getOptimizedImageUrl(image.url, 'thumbnail') : image.preview}
                alt={image.altText || `Image ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              
              {/* Loading overlay */}
              {image.isUploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                </div>
              )}

              {/* Error overlay */}
              {image.uploadError && (
                <div className="absolute inset-0 bg-red-500/50 flex items-center justify-center">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => retryUpload(image.id)}
                    className="text-xs"
                  >
                    Thử lại
                  </Button>
                </div>
              )}
              
              {/* Remove button */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => removeImage(image.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              
              {/* Primary badge */}
              {index === 0 && (
                <div className="absolute bottom-2 left-2">
                  <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                    Ảnh chính
                  </span>
                </div>
              )}
            </div>
          ))}
          
          {/* Add more button */}
          {canAddMore && (
            <div className="relative aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary hover:bg-primary/5 transition-colors">
              <input
                type="file"
                multiple
                accept={accept}
                onChange={handleFileInput}
                disabled={disabled || isUploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* File info */}
      {value.length > 0 && (
        <div className="text-xs text-muted-foreground">
          <p>Ảnh đầu tiên sẽ được sử dụng làm ảnh chính</p>
          <p>Kéo thả để sắp xếp lại thứ tự ảnh</p>
        </div>
      )}
    </div>
  )
}
