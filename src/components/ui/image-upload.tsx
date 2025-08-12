"use client"

import React, { useCallback, useState } from 'react'
import { Upload, X, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button'
import Image from 'next/image'

interface ImageFile {
  file: File
  preview: string
  id: string
}

interface ImageUploadProps {
  value?: ImageFile[]
  onChange?: (files: ImageFile[]) => void
  maxFiles?: number
  maxSize?: number // in MB
  accept?: string
  className?: string
  disabled?: boolean
  error?: boolean
}

export function ImageUpload({
  value = [],
  onChange,
  maxFiles = 10,
  maxSize = 5,
  accept = 'image/*',
  className,
  disabled = false,
  error = false
}: ImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || disabled) return

    const newFiles: ImageFile[] = []
    const currentCount = value.length

    for (let i = 0; i < files.length && currentCount + newFiles.length < maxFiles; i++) {
      const file = files[i]

      // Check file type
      if (!file.type.startsWith('image/')) {
        continue
      }

      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        continue
      }

      // Create simple preview without optimization for now
      const preview = URL.createObjectURL(file)

      const imageFile: ImageFile = {
        file,
        preview,
        id: Math.random().toString(36).substr(2, 9)
      }

      newFiles.push(imageFile)
    }

    if (newFiles.length > 0) {
      onChange?.([...value, ...newFiles])
    }
  }, [value, onChange, maxFiles, maxSize, disabled])

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

  const removeFile = useCallback((id: string) => {
    const newFiles = value.filter(f => f.id !== id)
    // Revoke object URL to prevent memory leaks
    const fileToRemove = value.find(f => f.id === id)
    if (fileToRemove) {
      URL.revokeObjectURL(fileToRemove.preview)
    }
    onChange?.(newFiles)
  }, [value, onChange])

  const moveFile = useCallback((fromIndex: number, toIndex: number) => {
    const newFiles = [...value]
    const [movedFile] = newFiles.splice(fromIndex, 1)
    newFiles.splice(toIndex, 0, movedFile)
    onChange?.(newFiles)
  }, [value, onChange])

  // Cleanup object URLs on unmount
  React.useEffect(() => {
    return () => {
      value.forEach(file => {
        URL.revokeObjectURL(file.preview)
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
            disabled={disabled}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
          
          <div className="flex flex-col items-center justify-center text-center">
            <Upload className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-sm font-medium mb-2">
              Kéo thả hình ảnh vào đây hoặc click để chọn
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

      {/* Preview Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {value.map((imageFile, index) => (
            <div
              key={imageFile.id}
              className="relative group aspect-square rounded-lg overflow-hidden border bg-muted"
            >
              <Image
                src={imageFile.preview}
                alt={`Preview ${index + 1}`}
                className="absolute inset-0 w-full h-full object-cover"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors">
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => removeFile(imageFile.id)}
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

              {/* Move buttons */}
              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                {index > 0 && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => moveFile(index, index - 1)}
                  >
                    ←
                  </Button>
                )}
                {index < value.length - 1 && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => moveFile(index, index + 1)}
                  >
                    →
                  </Button>
                )}
              </div>
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
                disabled={disabled}
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
