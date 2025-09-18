"use client"

import { useEffect } from 'react'
import { useNotifications } from '@/hooks/useNotifications'
import { useRealtime } from '@/hooks/useRealtime'
import { useUserStore } from '@/stores/userStore'

interface NotificationProviderProps {
  children: React.ReactNode
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { user, isAuthenticated } = useUserStore()
  const { refresh } = useNotifications()

  // Set up realtime connection for notifications
  useRealtime(user?.id || '')

  // Load notifications when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      refresh()
    }
  }, [isAuthenticated, user, refresh])

  // Set up periodic refresh for notifications (every 5 minutes)
  useEffect(() => {
    if (!isAuthenticated || !user) return

    const interval = setInterval(() => {
      refresh()
    }, 5 * 60 * 1000) // 5 minutes

    return () => clearInterval(interval)
  }, [isAuthenticated, user, refresh])

  return <>{children}</>
}