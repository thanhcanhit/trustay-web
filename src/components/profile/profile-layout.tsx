"use client"

import { useUserStore } from "@/stores/userStore"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { ProfileSidebar } from "./profile-sidebar"
import { useRealtime } from "@/hooks/useRealtime"

interface ProfileLayoutProps {
  children: React.ReactNode
}

export function ProfileLayout({ children }: ProfileLayoutProps) {
  const { user, isAuthenticated, isLoading, hasHydrated } = useUserStore()
  const router = useRouter()

  // Enable realtime notifications for authenticated users
  useRealtime(user?.id || '')

  useEffect(() => {
    // Don't redirect while loading or before hydration
    if (isLoading || !hasHydrated) return

    if (!isAuthenticated || !user) {
      console.log('Redirecting to login: not authenticated or no user')
      router.push('/login')
      return
    }
  }, [isAuthenticated, user, router, isLoading, hasHydrated])

  // Show loading while authenticating or hydrating
  if (!hasHydrated || isLoading || !isAuthenticated || !user) {
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
      <ProfileSidebar userRole={user.role} />
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
