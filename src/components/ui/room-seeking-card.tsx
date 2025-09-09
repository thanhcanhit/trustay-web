"use client"

import { MapPin, Users, Home } from 'lucide-react'
import { SizingImage } from '@/components/sizing-image'
import { getRoomTypeDisplayName } from '@/utils/room-types'
import type { RoomSeekingPost } from '@/types/room-seeking'

interface RoomSeekingCardProps {
  post: RoomSeekingPost & {
    requester?: { id: string; firstName?: string; lastName?: string; avatarUrl?: string }
  }
  className?: string
}

export function RoomSeekingCard({ post, className = '' }: RoomSeekingCardProps) {
  const requesterName = [post?.requester?.firstName, post?.requester?.lastName]
    .filter(Boolean)
    .join(' ')

  const avatarUrl = post?.requester?.avatarUrl

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${className}`}>
      {/* Header with avatar and author */}
      <div className="flex items-center gap-3 p-4 border-b">
        <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gray-100">
          {avatarUrl && avatarUrl.trim() !== '' ? (
            <SizingImage 
              src={avatarUrl} 
              srcSize="128x128" 
              alt={requesterName || 'Người đăng'} 
              className="object-cover rounded-full" 
              fill 
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-semibold">
              {requesterName ? requesterName.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 line-clamp-1">{post.title}</h3>
          <p className="text-xs text-gray-500 line-clamp-1">{requesterName || 'Người đăng ẩn danh'}</p>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-2 text-sm text-gray-700">
        <div className="font-medium text-green-700">
          Ngân sách: {post.minBudget?.toLocaleString('vi-VN')}đ - {post.maxBudget?.toLocaleString('vi-VN')}đ
        </div>

        <div className="flex items-center gap-2 text-gray-600">
          <MapPin className="h-4 w-4" />
          <span>
            {post.preferredWard?.name ? `${post.preferredWard.name}, ` : ''}
            {post.preferredDistrict?.name ? `${post.preferredDistrict.name}, ` : ''}
            {post.preferredProvince?.name || 'Khu vực linh hoạt'}
          </span>
        </div>

        <div className="flex items-center gap-2 text-gray-600">
          <Users className="h-4 w-4" />
          <span>{post.occupancy || 1} người</span>
        </div>

        <div className="flex items-center gap-2 text-gray-600">
          <Home className="h-4 w-4" />
          <span>{getRoomTypeDisplayName(post.preferredRoomType)}</span>
        </div>

        {post.description && (
          <p className="text-gray-600 line-clamp-3">{post.description}</p>
        )}
      </div>
    </div>
  )
}




