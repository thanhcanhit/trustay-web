"use client"

import { useUserStore } from "@/stores/userStore"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Sidebar } from "./sidebar"

interface DashboardLayoutProps {
  children: React.ReactNode
  userType: 'tenant' | 'landlord'
}

export function DashboardLayout({ children, userType }: DashboardLayoutProps) {
  const { user, isAuthenticated, isLoading, hasHydrated } = useUserStore()
  const router = useRouter()

  useEffect(() => {
    console.log('DashboardLayout state:', {
      hasHydrated,
      isLoading,
      isAuthenticated,
      user: user ? { id: user.id, role: user.role } : null,
      userType
    })

    // Don't redirect while loading or before hydration
    if (isLoading || !hasHydrated) return

    if (!isAuthenticated || !user) {
      console.log('Redirecting to login: not authenticated or no user')
      router.push('/login')
      return
    }

    // Kiểm tra role có khớp không
    if (user.role !== userType) {
      console.log('Role mismatch, redirecting:', { userRole: user.role, expectedType: userType })
      if (user.role === 'tenant') {
        router.push('/profile')
      } else {
        router.push('/dashboard/landlord')
      }
    }
  }, [isAuthenticated, user, userType, router, isLoading, hasHydrated])

  // Show loading while authenticating, hydrating, or if user data doesn't match
  if (!hasHydrated || isLoading || !isAuthenticated || !user || user.role !== userType) {
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
    <div className="min-h-screen bg-gray-50 flex pt-16">
      <Sidebar userType={userType} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
