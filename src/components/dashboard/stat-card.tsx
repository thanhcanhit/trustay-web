import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
  compact?: boolean
}

export function StatCard({ title, value, icon: Icon, trend, className, compact = false }: StatCardProps) {
  return (
    <div className={cn(
      "bg-white rounded-lg border border-gray-200",
      compact ? "p-3" : "p-3 md:p-6",
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className={cn(
            "font-medium text-gray-600 truncate",
            compact ? "text-xs" : "text-xs md:text-sm"
          )}>{title}</p>
          <p className={cn(
            "font-bold text-gray-900 mt-1 truncate",
            compact ? "text-xl" : "text-lg md:text-2xl"
          )}>{value}</p>
          {trend && (
            <p className={cn(
              "text-xs md:text-sm mt-1",
              trend.isPositive ? "text-green-600" : "text-red-600"
            )}>
              {trend.isPositive ? "+" : ""}{trend.value}%
            </p>
          )}
        </div>
        <div className={cn(
          "bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0",
          compact ? "h-8 w-8 ml-2" : "h-10 w-10 md:h-12 md:w-12 ml-2 md:ml-4"
        )}>
          <Icon className={cn(
            "text-green-600",
            compact ? "h-4 w-4" : "h-5 w-5 md:h-6 md:w-6"
          )} />
        </div>
      </div>
    </div>
  )
}
