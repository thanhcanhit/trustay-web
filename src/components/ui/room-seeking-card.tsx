"use client"

import Image from 'next/image'
import { MapPin, Users } from 'lucide-react'
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

  const avatarUrl = post?.requester?.avatarUrl || '/placeholder-roommate.jpg'

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${className}`}>
      {/* Header with avatar and author */}
      <div className="flex items-center gap-3 p-4 border-b">
        <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gray-100">
          <Image src={avatarUrl} alt={requesterName || 'Người đăng'} fill className="object-cover" />
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
            {post.preferredWardId ? `Phường ${post.preferredWardId}, ` : ''}
            {post.preferredDistrictId ? `Quận ${post.preferredDistrictId}, ` : ''}
            {post.preferredProvinceId ? `Tỉnh/TP ${post.preferredProvinceId}` : 'Khu vực linh hoạt'}
          </span>
        </div>

        <div className="flex items-center gap-2 text-gray-600">
          <Users className="h-4 w-4" />
          <span>{post.occupancy || 1} người</span>
        </div>

        {post.description && (
          <p className="text-gray-600 line-clamp-3">{post.description}</p>
        )}
      </div>
    </div>
  )
}




