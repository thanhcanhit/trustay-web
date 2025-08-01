"use client"

import React, { useState } from 'react'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import { cn } from '@/lib/utils'

// Import CKEditor CSS
import 'ckeditor5/ckeditor5.css'

interface RichTextEditorProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  error?: boolean
}

export function RichTextEditor({
  value = '',
  onChange,
  placeholder = 'Nhập mô tả...',
  className,
  disabled = false,
  error = false
}: RichTextEditorProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [ClassicEditor, setClassicEditor] = useState<any>(null)
  const [hasError, setHasError] = useState(false)

  React.useEffect(() => {
    const loadEditor = async () => {
      try {
        const {
          ClassicEditor: ClassicEditorBuild,
          Bold,
          Italic,
          Essentials,
          Paragraph,
          Heading,
          List,
          BlockQuote,
          Undo
        } = await import('ckeditor5')

        // Configure the editor
        ClassicEditorBuild.builtinPlugins = [
          Essentials,
          Bold,
          Italic,
          Paragraph,
          Heading,
          List,
          BlockQuote,
          Undo
        ]

        ClassicEditorBuild.defaultConfig = {
          licenseKey: 'GPL',
          toolbar: {
            items: [
              'heading',
              '|',
              'bold',
              'italic',
              '|',
              'bulletedList',
              'numberedList',
              '|',
              'blockQuote',
              '|',
              'undo',
              'redo'
            ]
          },
          heading: {
            options: [
              { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
              { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
              { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
              { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' }
            ]
          },
          placeholder
        }

        setClassicEditor(() => ClassicEditorBuild)
        setIsLoading(false)
      } catch (error) {
        console.error('Error loading CKEditor:', error)
        setHasError(true)
        setIsLoading(false)
      }
    }

    loadEditor()
  }, [placeholder])

  // Fallback to textarea if CKEditor fails to load
  if (isLoading || !ClassicEditor || hasError) {
    if (isLoading) {
      return (
        <div className={cn(
          "min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
          "flex items-center justify-center text-muted-foreground",
          error && "border-destructive",
          className
        )}>
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span>Đang tải editor...</span>
          </div>
        </div>
      )
    }

    // Fallback to simple textarea
    return (
      <div className={cn("space-y-2", className)}>
        <textarea
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
            "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive",
          )}
          rows={8}
        />
        {hasError && (
          <p className="text-xs text-muted-foreground">
            Rich text editor không khả dụng, sử dụng text editor đơn giản
          </p>
        )}
      </div>
    )
  }

  return (
    <div className={cn(
      "rich-text-editor",
      error && "border-destructive",
      className
    )}>
      <CKEditor
        editor={ClassicEditor}
        data={value}
        config={{
          licenseKey: 'GPL',
          placeholder,
          toolbar: [
            'heading',
            '|',
            'bold',
            'italic',
            '|',
            'bulletedList',
            'numberedList',
            '|',
            'blockQuote',
            '|',
            'undo',
            'redo'
          ],
          heading: {
            options: [
              { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
              { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
              { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
              { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' }
            ]
          }
        }}
        onChange={(event: any, editor: any) => {
          const data = editor.getData()
          onChange?.(data)
        }}
        disabled={disabled}
      />
      <style jsx global>{`
        .rich-text-editor .ck-editor {
          border: 1px solid hsl(var(--border));
          border-bottom: 1px solid hsl(var(--border));
          overflow: hidden;
        }

        .rich-text-editor .ck-toolbar {
          border: 1px solid hsl(var(--border));
          border-bottom: 1px solid hsl(var(--border));
          background: hsl(var(--muted) / 0.5);
          border-radius: 0;
        }

        .rich-text-editor .ck-editor__editable {
          min-height: 200px;
          border: 1px solid;
          border-bottom: 1px solid;
          padding-left: 30px;
        }

        /* Heading styles */
        .rich-text-editor .ck-editor__editable h1 {
          font-size: 1.875rem;
          font-weight: 700;
          line-height: 2.25rem;
          margin: 1rem 0 0.5rem 0;
        }

        .rich-text-editor .ck-editor__editable h2 {
          font-size: 1.5rem;
          font-weight: 600;
          line-height: 2rem;
          margin: 0.75rem 0 0.5rem 0;
        }

        .rich-text-editor .ck-editor__editable h3 {
          font-size: 1.25rem;
          font-weight: 600;
          line-height: 1.75rem;
          margin: 0.5rem 0 0.25rem 0;
        }

        ${error ? `
          .rich-text-editor .ck-editor {
            border-color: hsl(var(--destructive));
          }
        ` : ''}
      `}</style>
    </div>
  )
}
