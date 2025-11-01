import parse from 'html-react-parser'
import { cn } from '@/lib/utils'

interface HTMLContentProps {
  content: string
  className?: string
}

/**
 * Component để hiển thị HTML content từ rich text editor
 * Sử dụng html-react-parser để render HTML an toàn
 */
export function HTMLContent({ content, className }: HTMLContentProps) {
  if (!content) return null

  return (
    <div
      className={cn(
        "prose prose-sm max-w-none",
        "prose-headings:font-semibold prose-headings:text-gray-900",
        "prose-h1:text-3xl prose-h1:mb-4 prose-h1:mt-6",
        "prose-h2:text-2xl prose-h2:mb-3 prose-h2:mt-5",
        "prose-h3:text-xl prose-h3:mb-2 prose-h3:mt-4",
        "prose-p:text-base prose-p:leading-7 prose-p:my-2 prose-p:text-gray-700",
        "prose-ul:list-disc prose-ul:pl-6 prose-ul:my-2",
        "prose-ol:list-decimal prose-ol:pl-6 prose-ol:my-2",
        "prose-li:my-1 prose-li:text-gray-700",
        "prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:my-4 prose-blockquote:text-gray-600",
        "prose-strong:font-semibold prose-strong:text-gray-900",
        "prose-em:italic",
        className
      )}
    >
      {parse(content)}
    </div>
  )
}
