"use client"

import { useEffect, useRef } from 'react'
import { useNotifications } from '@/hooks/useNotifications'
import { useUserStore } from '@/stores/userStore'

interface NotificationProviderProps {
  children: React.ReactNode
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { user, isAuthenticated } = useUserStore()
  const { refresh } = useNotifications()
  const hasLoadedRef = useRef(false)

  // Note: useRealtime is called in DashboardLayout to avoid duplicate connections

  // Load notifications when user becomes authenticated - only once
  useEffect(() => {
    if (isAuthenticated && user && !hasLoadedRef.current) {
      refresh()
      hasLoadedRef.current = true
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