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
  Key,
  Receipt,
  Send,
  Building2,
  FileText,
  TrendingUp,
  Wrench,
  AlertTriangle,
  Star,
  UserPlus,
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
}

const tenantItems: SidebarItem[] = [
  {
    title: "Quản lý cá nhân",
    icon: User,
    subItems: [
      {
        title: "Thông tin cơ bản",
        href: "/profile/personal",
        icon: User
      },
      {
        title: "Bảo mật",
        href: "/profile/security",
        icon: Key
      }
    ]
  },
  {
    title: "Quản lý lưu trú",
    icon: Home,
    subItems: [
      {
        title: "Trọ của tôi",
        href: "/profile/accommodation",
        icon: Home
      },
      {
        title: "Hợp đồng",
        href: "/profile/contracts",
        icon: FileText
      },
      {
        title: "Hóa đơn",
        href: "/profile/bills",
        icon: Receipt
      }
    ]
  },
  {
    title: "Tìm bạn cùng phòng",
    href: "/profile/roommate",
    icon: Users
  },
  {
    title: "Yêu cầu thuê",
    href: "/profile/requests",
    icon: Send
  },
  {
    title: "Lời mời thuê",
    href: "/profile/booking-requests",
    icon: UserPlus
  },
  {
    title: "Ứng tuyển nhận được",
    href: "/profile/roommate-applications/received",
    icon: Users
  },
  {
    title: "Ứng tuyển đã gửi",
    href: "/profile/roommate-applications/sent",
    icon: Send
  },
  {
    title: "Trọ đã lưu",
    href: "/profile/saved",
    icon: Heart
  },
  {
    title: "Thông báo",
    href: "/profile/notifications",
    icon: Bell
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
        title: "Quản lý phòng",
        href: "/dashboard/landlord/properties/rooms",
        icon: Home
      },
      {
        title: "Yêu cầu thuê trọ",
        href: "/dashboard/landlord/rental-requests",
        icon: Send,
        disabled: false
      },
      {
        title: "Lời mời thuê",
        href: "/dashboard/landlord/booking-requests",
        icon: UserPlus,
        disabled: false
      },
      {
        title: "Ứng tuyển nhận được",
        href: "/dashboard/landlord/roommate-applications/received",
        icon: Users,
        disabled: false
      },
      {
        title: "Ứng tuyển đã gửi",
        href: "/dashboard/landlord/roommate-applications/sent",
        icon: Send,
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
        disabled: true
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
        disabled: true
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

export function Sidebar({ userType }: SidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useUserStore()
  const [expandedItems, setExpandedItems] = useState<string[]>(['Quản lý Trọ'])

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
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200 overflow-hidden">
      {/* User Info */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
            <User className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
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
                    <Icon className="h-5 w-5" />
                    <span>{item.title}</span>
                    {item.badge && (
                      <span className="ml-auto bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href!}
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      pathname === item.href
                        ? "bg-green-50 text-green-700 border-r-2 border-green-500"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.title}</span>
                    {item.badge && (
                      <span className="ml-auto bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
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
                        <SubIcon className="h-5 w-5 text-gray-400" />
                        <span>{subItem.title}</span>
                      </div>
                    ) : (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
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
                            "h-5 w-5",
                            isSubActive ? "text-blue-600" : "text-gray-500"
                          )} 
                        />
                        <span>{subItem.title}</span>
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
