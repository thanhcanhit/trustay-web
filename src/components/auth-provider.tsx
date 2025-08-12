"use client"

import { useEffect } from 'react'
import { useUserStore } from '@/stores/userStore'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, hasHydrated } = useUserStore()

  useEffect(() => {
    console.log('AuthProvider state:', { hasHydrated, isAuthenticated, user: user ? { id: user.id } : null })

    // After hydration, if we have user data in persisted state, we're good to go
    // No need to call loadUser() which would try to read httpOnly cookies from client-side
    if (hasHydrated) {
      if (user && isAuthenticated) {
        console.log('User found in persisted state, authentication restored')
      } else {
        console.log('No user in persisted state, user needs to login')
      }
    }
  }, [isAuthenticated, user, hasHydrated])

  return <>{children}</>
}
