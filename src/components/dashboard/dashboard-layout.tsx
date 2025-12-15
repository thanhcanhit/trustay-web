"use client"

import { useUserStore } from "@/stores/userStore"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Sidebar } from "./sidebar"
import { Menu } from "lucide-react"
import { useRealtime } from "@/hooks/useRealtime"
import { useSidebarBadges } from "@/hooks/useSidebarBadges"

interface DashboardLayoutProps {
  children: React.ReactNode
  userType: 'tenant' | 'landlord'
}

export function DashboardLayout({ children, userType }: DashboardLayoutProps) {
  const { user, isAuthenticated, isLoading, hasHydrated } = useUserStore()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Enable realtime notifications for authenticated users
  useRealtime(user?.id || '')

  // Load badges once at layout level to avoid duplicate API calls
  const badges = useSidebarBadges(userType)

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
        router.push('/dashboard/tenant')
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
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-20 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-gray-200"
      >
        <Menu className="h-5 w-5 text-gray-600" />
      </button>

      {/* Mobile sidebar overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div className={`lg:hidden fixed top-16 left-0 h-[calc(100vh-4rem)] w-72 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 overflow-y-auto ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <Sidebar userType={userType} badges={badges} onNavigate={() => setIsMobileMenuOpen(false)} />
      </div>

      <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="h-full bg-white border-r border-gray-200 shadow-sm overflow-y-auto">
            <Sidebar userType={userType} badges={badges} />
          </div>
        </aside>

        <main className="flex-1 min-w-0 overflow-y-auto">
          <div className="p-3 sm:p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
