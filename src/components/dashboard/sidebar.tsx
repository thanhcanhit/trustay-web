"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  Home,
  User,
  Bell,
  BarChart3,
  Building,
  Users,
  Search,
  Heart,
  LogOut,
  ChevronDown,
  ChevronRight,
  Receipt,
  Send,
  Building2,
  FileText,
  TrendingUp,
  Wrench,
  AlertTriangle,
  Star,
} from "lucide-react"
import { useUserStore } from "@/stores/userStore"

interface SidebarSubItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  disabled?: boolean
}

interface SidebarItem {
  title: string
  href?: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  subItems?: SidebarSubItem[]
  disabled?: boolean
}

interface SidebarProps {
  userType: 'tenant' | 'landlord'
  onNavigate?: () => void
}

const tenantItems: SidebarItem[] = [
  {
    title: "Quản lý thuê trọ",
    icon: Home,
    subItems: [
      {
        title: "Trọ của tôi",
        href: "/dashboard/tenant/rentals",
        icon: Home,
        disabled: false
      },
      {
        title: "Hợp đồng",
        href: "/dashboard/tenant/contracts",
        icon: FileText,
        disabled: false
      },
      {
        title: "Hóa đơn",
        href: "/dashboard/tenant/invoices",
        icon: Receipt,
        disabled: false
      }
    ]
  },
  {
    title: "Quản lý bài đăng",
    href: "/dashboard/tenant/posts",
    icon: FileText,
    disabled: false
  },
  {
    title: "Yêu cầu thuê",
    href: "/dashboard/tenant/requests",
    icon: Send,
    disabled: false
  },
  {
    title: "Yêu cầu ở ghép",
    href: "/dashboard/tenant/roommate-applications",
    icon: Users,
    disabled: false
  }
]

const landlordItems: SidebarItem[] = [
  {
    title: "Tổng quan",
    href: "/dashboard/landlord",
    icon: BarChart3
  },
  {
    title: "Quản lý Trọ",
    icon: Building,
    subItems: [
      {
        title: "Dãy trọ/Tòa nhà",
        href: "/dashboard/landlord/properties",
        icon: Building2
      },
      {
        title: "Yêu cầu thuê",
        href: "/dashboard/landlord/requests",
        icon: Send,
        disabled: false
      },
      {
        title: "Yêu cầu ở ghép",
        href: "/dashboard/landlord/roommate-applications",
        icon: Users,
        disabled: false
      },
      {
        title: "Khách thuê",
        href: "/dashboard/landlord/tenants",
        icon: Users,
        disabled: false
      },
      {
        title: "Hợp đồng",
        href: "/dashboard/landlord/contracts",
        icon: FileText,
        disabled: false
      },
      {
        title: "Hóa đơn",
        href: "/dashboard/landlord/invoices",
        icon: Receipt,
        disabled: false
      },
      {
        title: "Thu chi",
        href: "/dashboard/landlord/revenue",
        icon: TrendingUp,
        disabled: true
      },
      {
        title: "Dịch vụ",
        href: "/dashboard/landlord/services",
        icon: Wrench,
        disabled: true
      },
      {
        title: "Báo cáo",
        href: "/dashboard/landlord/reports",
        icon: BarChart3,
        disabled: true
      },
      {
        title: "Phản ánh, sự cố",
        href: "/dashboard/landlord/feedback",
        icon: AlertTriangle,
        disabled: true
      },
      {
        title: "Khách hàng đánh giá",
        href: "/dashboard/landlord/reviews",
        icon: Star,
        disabled: false
      }
    ]
  },
  {
    title: "Quảng cáo Trọ",
    href: "/dashboard/landlord/advertising",
    icon: Search,
    disabled: true
  },
  {
    title: "Quản lý cho thuê",
    href: "/dashboard/landlord/rentals",
    icon: Heart,
    disabled: false
  },
  {
    title: "Thông báo",
    href: "/dashboard/landlord/notifications",
    icon: Bell,
    disabled: false
  }
]

export function Sidebar({ userType, onNavigate }: SidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useUserStore()
  const [expandedItems, setExpandedItems] = useState<string[]>(
    userType === 'tenant' ? ['Quản lý thuê trọ'] : ['Quản lý Trọ']
  )

  const items = userType === 'tenant' ? tenantItems : landlordItems

  const toggleExpanded = (itemTitle: string) => {
    setExpandedItems(prev =>
      prev.includes(itemTitle)
        ? prev.filter(title => title !== itemTitle)
        : [...prev, itemTitle]
    )
  }

  const isActiveRoute = (href: string) => {
    // Chỉ highlight mục "Dãy trọ/Tòa nhà" khi đang ở trang properties chính
    if (href === '/dashboard/landlord/properties') {
      return pathname === '/dashboard/landlord/properties'
    }
    // Các mục khác highlight chính xác theo pathname
    return pathname === href
  }

  return (
    <div className="flex h-full w-full flex-col bg-white overflow-hidden">
      {/* User Info */}
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <User className="h-5 w-5 text-green-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-gray-500">
              {userType === 'tenant' ? 'Người thuê trọ' : 'Chủ nhà trọ'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {items.map((item) => {
          const Icon = item.icon
          const isExpanded = expandedItems.includes(item.title)
          const hasSubItems = item.subItems && item.subItems.length > 0

          return (
            <div key={item.title}>
              {/* Main Item */}
              {hasSubItems ? (
                <button
                  onClick={() => toggleExpanded(item.title)}
                  className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
              ) : (
                item.disabled ? (
                  <div
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-not-allowed opacity-50"
                    )}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className="truncate">{item.title}</span>
                    {item.badge && (
                      <span className="ml-auto bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full flex-shrink-0">
                        {item.badge}
                      </span>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href!}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      pathname === item.href
                        ? "bg-green-50 text-green-700 border-r-2 border-green-500"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className="truncate">{item.title}</span>
                    {item.badge && (
                      <span className="ml-auto bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full flex-shrink-0">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              )}

              {/* Sub Items */}
              {hasSubItems && isExpanded && (
                <div className="ml-6 mt-1 space-y-1">
                  {item.subItems!.map((subItem) => {
                    const SubIcon = subItem.icon
                    const isSubActive = isActiveRoute(subItem.href)

                    return subItem.disabled ? (
                      <div
                        key={subItem.href}
                        className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors relative cursor-not-allowed opacity-50"
                      >
                        <SubIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{subItem.title}</span>
                      </div>
                    ) : (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        onClick={onNavigate}
                        className={cn(
                          "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors relative",
                          isSubActive
                            ? "text-gray-900 bg-blue-50"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        )}
                      >
                        {/* Active indicator */}
                        {isSubActive && (
                          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full" />
                        )}

                        <SubIcon
                          className={cn(
                            "h-5 w-5 flex-shrink-0",
                            isSubActive ? "text-blue-600" : "text-gray-500"
                          )}
                        />
                        <span className="truncate">{subItem.title}</span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={logout}
          className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 w-full transition-colors cursor-pointer"
        >
          <LogOut className="h-5 w-5" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  )
}
