"use client"

import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useRoomSeekingStore } from '@/stores/roomSeekingStore'

export default function RoomSeekingDetailPage() {
  const params = useParams()
  const id = String(params?.id)

  const { currentPost, postLoading, postError, loadPostDetail, clearCurrentPost } = useRoomSeekingStore()

  useEffect(() => {
    if (id) void loadPostDetail(id)
    return () => clearCurrentPost()
  }, [id, loadPostDetail, clearCurrentPost])

  if (postLoading) {
    return (
      <div className="container mx-auto px-4 py-8 pt-20 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-green-600" />
      </div>
    )
  }

  if (postError || !currentPost) {
    return (
      <div className="container mx-auto px-4 py-8 pt-20 text-center text-red-600">
        {postError || 'Không tìm thấy bài đăng'}
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-20">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold">{currentPost.title}</h1>
        </CardHeader>
        <CardContent className="space-y-3 text-gray-700">
          <div>Ngân sách: {currentPost.minBudget?.toLocaleString()}₫ - {currentPost.maxBudget?.toLocaleString()}₫</div>
          <div>Loại phòng ưu tiên: {currentPost.preferredRoomType}</div>
          <div>Số người ở: {currentPost.occupancy}</div>
          <div className="whitespace-pre-line">{currentPost.description}</div>
        </CardContent>
      </Card>
    </div>
  )
}


