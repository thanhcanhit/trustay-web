"use client"

import { useSearchParams, useRouter } from 'next/navigation'
import { ArrowUpDown, TrendingUp, Clock } from 'lucide-react'
import { Button } from './button'

interface SortingTabsProps {
  basePath?: string
}

export function SortingTabs({ basePath = '/rooms' }: SortingTabsProps) {
  const searchParams = useSearchParams()
  const router = useRouter()

  const currentSortBy = searchParams.get('sortBy') || 'relevance'
  const currentSortOrder = searchParams.get('sortOrder') || 'desc'

  const handleSortChange = (sortBy: string, sortOrder: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()))
    current.set('sortBy', sortBy)
    current.set('sortOrder', sortOrder)

    const search = current.toString()
    const query = search ? `?${search}` : ''
    router.push(`${basePath}${query}`)
  }

  const isActive = (sortBy: string, sortOrder?: string) => {
    if (sortOrder) {
      return currentSortBy === sortBy && currentSortOrder === sortOrder
    }
    return currentSortBy === sortBy
  }

  return (
    <div className="bg-white border-b sticky top-[56px] lg:top-[64px] z-[9997] shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center overflow-x-auto scrollbar-hide no-print">
        {/* Liên quan / Mặc định */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleSortChange('relevance', 'desc')}
          className={`flex-shrink-0 h-10 px-4 rounded-none border-b-2 transition-colors ${
            isActive('relevance', 'desc')
              ? 'border-green-600 text-green-600 font-medium'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Liên quan
        </Button>

        {/* Mới nhất */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleSortChange('createdAt', 'desc')}
          className={`flex-shrink-0 h-10 px-4 rounded-none border-b-2 transition-colors ${
            isActive('createdAt', 'desc')
              ? 'border-green-600 text-green-600 font-medium'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Clock className="h-3.5 w-3.5 mr-1.5" />
          Mới nhất
        </Button>

        {/* Bán chạy / Phổ biến */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleSortChange('viewCount', 'desc')}
          className={`flex-shrink-0 h-10 px-4 rounded-none border-b-2 transition-colors ${
            isActive('viewCount', 'desc')
              ? 'border-green-600 text-green-600 font-medium'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
          Phổ biến
        </Button>

        {/* Giá */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            // Toggle between asc and desc when clicking price
            if (isActive('price')) {
              const newOrder = currentSortOrder === 'asc' ? 'desc' : 'asc'
              handleSortChange('price', newOrder)
            } else {
              handleSortChange('price', 'asc')
            }
          }}
          className={`flex-shrink-0 h-10 px-4 rounded-none border-b-2 transition-colors ${
            isActive('price')
              ? 'border-green-600 text-green-600 font-medium'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Giá
          <ArrowUpDown className={`h-3.5 w-3.5 ml-1.5 transition-transform ${
            isActive('price', 'desc') ? 'rotate-180' : ''
          }`} />
        </Button>
        </div>
      </div>
    </div>
  )
}
