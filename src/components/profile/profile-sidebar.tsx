"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  User,
  Bell,
  Heart,
  LogOut,
  ChevronDown,
  ChevronRight,
  Shield,
  CreditCard,
} from "lucide-react"
import { useUserStore } from "@/stores/userStore"

interface ProfileSidebarSubItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  disabled?: boolean
}

interface ProfileSidebarItem {
  title: string
  href?: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  subItems?: ProfileSidebarSubItem[]
  disabled?: boolean
}

interface ProfileSidebarProps {
  userRole: 'tenant' | 'landlord'
}

const profileItems: ProfileSidebarItem[] = [
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
        title: "Sở thích & Ưu tiên",
        href: "/profile/preferences",
        icon: Heart
      },
      {
        title: "Bảo mật",
        href: "/profile/security",
        icon: Shield
      }
    ]
  },
  {
    title: "Trọ đã lưu",
    href: "/profile/saved",
    icon: Heart,
    disabled: true
  },
  {
    title: "Thanh toán",
    href: "/profile/payment",
    icon: CreditCard,
    disabled: false
  },
  {
    title: "Thông báo",
    href: "/profile/notifications",
    icon: Bell,
    disabled: false
  }
]

export function ProfileSidebar({ userRole }: ProfileSidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useUserStore()
  const [expandedItems, setExpandedItems] = useState<string[]>(['Quản lý cá nhân'])

  const toggleExpanded = (itemTitle: string) => {
    setExpandedItems(prev =>
      prev.includes(itemTitle)
        ? prev.filter(title => title !== itemTitle)
        : [...prev, itemTitle]
    )
  }

  const isActiveRoute = (href: string) => {
    return pathname === href
  }

  return (
    <div className="flex h-[calc(100vh-3rem)] w-64 flex-col bg-white border-r border-gray-200 sticky top-12">
      {/* User Info */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
            <User className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-gray-500">
              {userRole === 'tenant' ? 'Người thuê trọ' : 'Chủ nhà trọ'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {profileItems.map((item) => {
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
                            ? "text-gray-900 bg-green-50"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        )}
                      >
                        {/* Active indicator */}
                        {isSubActive && (
                          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-green-600 rounded-r-full" />
                        )}
                        
                        <SubIcon 
                          className={cn(
                            "h-5 w-5",
                            isSubActive ? "text-green-600" : "text-gray-500"
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
