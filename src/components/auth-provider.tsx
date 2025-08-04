"use client"

import { useEffect } from 'react'
import { useUserStore } from '@/stores/userStore'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { loadUser, isAuthenticated, user, hasHydrated } = useUserStore()

  useEffect(() => {
    console.log('AuthProvider state:', { hasHydrated, isAuthenticated, user: user ? { id: user.id } : null })

    // Only load user after hydration is complete and if not already authenticated
    if (hasHydrated && !isAuthenticated && !user) {
      console.log('Loading user from AuthProvider')
      loadUser()
    }
  }, [loadUser, isAuthenticated, user, hasHydrated])

  return <>{children}</>
}
