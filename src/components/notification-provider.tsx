"use client"

import { useEffect } from 'react'
import { useNotifications } from '@/hooks/useNotifications'
import { useUserStore } from '@/stores/userStore'

interface NotificationProviderProps {
  children: React.ReactNode
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { user, isAuthenticated } = useUserStore()
  const { refresh } = useNotifications()

  // Note: useRealtime is called in DashboardLayout to avoid duplicate connections

  // Load notifications when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      refresh()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user])

  // Set up periodic refresh for notifications (every 5 minutes)
  useEffect(() => {
    if (!isAuthenticated || !user) return

    const interval = setInterval(() => {
      refresh()
    }, 5 * 60 * 1000) // 5 minutes

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user])

  return <>{children}</>
}