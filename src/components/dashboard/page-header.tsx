import { Button } from "@/components/ui/button"
import { ArrowLeft, Plus, Edit, Trash2, Eye, LucideIcon } from "lucide-react"
import Link from "next/link"
import { ReactNode } from "react"

interface PageHeaderProps {
  title: string
  subtitle?: string | ReactNode
  backUrl?: string
  backLabel?: string
  actions?: ReactNode
  className?: string
}

export function PageHeader({
  title,
  subtitle,
  backUrl,
  backLabel = "Quay lại",
  actions,
  className = ""
}: PageHeaderProps) {
  return (
    <div className={`flex items-center justify-between mb-6 ${className}`}>
      <div className="flex items-center space-x-4">
        {backUrl && (
          <Link href={backUrl}>
            <Button variant="outline" size="sm" className="cursor-pointer">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {backLabel}
            </Button>
          </Link>
        )}
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          {subtitle && (
            <div className="text-sm text-gray-600 mt-1">{subtitle}</div>
          )}
        </div>
      </div>
      
      {actions && (
        <div className="flex items-center space-x-2">
          {actions}
        </div>
      )}
    </div>
  )
}

// Predefined action buttons for common use cases
export const PageHeaderActions = {
  Add: ({ href, label = "Thêm mới", icon: Icon = Plus }: { href: string; label?: string; icon?: LucideIcon }) => (
    <Link href={href}>
      <Button className="cursor-pointer">
        <Icon className="h-4 w-4 mr-2" />
        {label}
      </Button>
    </Link>
  ),
  
  Edit: ({ href, label = "Chỉnh sửa" }: { href: string; label?: string }) => (
    <Link href={href}>
      <Button className="cursor-pointer">
        <Edit className="h-4 w-4 mr-2" />
        {label}
      </Button>
    </Link>
  ),
  
  Delete: ({ onClick, label = "Xóa" }: { onClick: () => void; label?: string }) => (
    <Button variant="destructive" onClick={onClick} className="cursor-pointer">
      <Trash2 className="h-4 w-4 mr-2" />
      {label}
    </Button>
  ),
  
  View: ({ href, label = "Xem" }: { href: string; label?: string }) => (
    <Link href={href}>
      <Button variant="outline" className="cursor-pointer">
        <Eye className="h-4 w-4 mr-2" />
        {label}
      </Button>
    </Link>
  ),
  
  Custom: ({ children }: { children: ReactNode }) => <>{children}</>
}
