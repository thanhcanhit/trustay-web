"use client"

import { useState, useEffect } from 'react'
import { healthCheck } from '@/actions/health-check'

export function ApiStatus() {
  const [isOnline, setIsOnline] = useState<boolean | null>(null)
  const [apiUrl, setApiUrl] = useState<string>('')

  useEffect(() => {
    const checkHealth = async () => {
      const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
      setApiUrl(url)
      
      const status = await healthCheck()
      setIsOnline(status)
    }

    checkHealth()
    
    // Check every 30 seconds
    const interval = setInterval(checkHealth, 30000)
    
    return () => clearInterval(interval)
  }, [])

  if (isOnline === null) {
    return (
      <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
        Checking API status...
      </div>
    )
  }

  return (
    <div className={`text-xs p-2 rounded ${
      isOnline 
        ? 'text-green-700 bg-green-50 border border-green-200' 
        : 'text-red-700 bg-red-50 border border-red-200'
    }`}>
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
        <span>
          API {isOnline ? 'Online' : 'Offline'}: {apiUrl}
        </span>
      </div>
    </div>
  )
}
