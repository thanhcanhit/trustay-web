"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
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
  LogOut
} from "lucide-react"
import { useUserStore } from "@/stores/userStore"

interface SidebarItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}

interface SidebarProps {
  userType: 'tenant' | 'landlord'
}

const tenantItems: SidebarItem[] = [
  {
    title: "Thông tin cá nhân",
    href: "/dashboard/tenant/profile",
    icon: User
  },
  {
    title: "Thông tin lưu trú",
    href: "/dashboard/tenant/accommodation",
    icon: Home
  },
  {
    title: "Lưu trú",
    href: "/dashboard/tenant/saved",
    icon: Heart
  },
  {
    title: "Thông báo",
    href: "/dashboard/tenant/notifications",
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
    href: "/dashboard/landlord/properties",
    icon: Building
  },
  {
    title: "Tìm bạn cùng phòng",
    href: "/dashboard/landlord/roommate",
    icon: Users
  },
  {
    title: "Quảng cáo Trọ",
    href: "/dashboard/landlord/advertising",
    icon: Search
  },
  {
    title: "Quản lý cho thuê",
    href: "/dashboard/landlord/rentals",
    icon: Heart
  },
  {
    title: "Thông báo",
    href: "/dashboard/landlord/notifications",
    icon: Bell
  }
]

export function Sidebar({ userType }: SidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useUserStore()
  
  const items = userType === 'tenant' ? tenantItems : landlordItems

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200">
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
      <nav className="flex-1 p-4 space-y-1">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
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
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={logout}
          className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 w-full transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  )
}
