"use client"

import { useUserStore } from "@/stores/user-store"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Sidebar } from "./sidebar"

interface DashboardLayoutProps {
  children: React.ReactNode
  userType: 'tenant' | 'landlord'
}

export function DashboardLayout({ children, userType }: DashboardLayoutProps) {
  const { user, isAuthenticated } = useUserStore()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/login')
      return
    }

    // Kiểm tra userType có khớp không
    if (user.userType !== userType) {
      if (user.userType === 'tenant') {
        router.push('/dashboard/tenant')
      } else {
        router.push('/dashboard/landlord')
      }
    }
  }, [isAuthenticated, user, userType, router])

  if (!isAuthenticated || !user || user.userType !== userType) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar userType={userType} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
