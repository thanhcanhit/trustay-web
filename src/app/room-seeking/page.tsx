"use client"

import { Suspense, useEffect, useMemo, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { RoomSeekingCard } from '@/components/ui/room-seeking-card'
import { Button } from '@/components/ui/button'
import { Loader2, SlidersHorizontal } from 'lucide-react'
import { useRoomSeekingStore } from '@/stores/roomSeekingStore'

function RoomSeekingContent() {
  const searchParams = useSearchParams()
  const isRequestInProgress = useRef(false)

  const { publicPosts, publicPostsLoading, publicPostsError, loadPublicPosts } = useRoomSeekingStore()

  const computedParams = useMemo(() => {
    const params: Record<string, string | number> = {}
    const search = searchParams.get('search')
    if (search) params.search = search
    return params
  }, [searchParams])

  useEffect(() => {
    const run = async () => {
      if (isRequestInProgress.current) return
      isRequestInProgress.current = true
      try {
        await loadPublicPosts({ page: 1, ...computedParams })
      } finally {
        isRequestInProgress.current = false
      }
    }
    run()
  }, [computedParams, loadPublicPosts])

  return (
    <div className="container mx-auto px-4 py-8 pt-20">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Người tìm trọ</h1>
            <p className="text-gray-600">Các bài đăng tìm chỗ thuê mới nhất</p>
          </div>
          <div className="lg:hidden">
            <Button variant="outline" size="sm">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Bộ lọc
            </Button>
          </div>
        </div>
      </div>

      {publicPostsLoading && (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-green-600" />
          <p className="text-gray-600 mt-2">Đang tải...</p>
        </div>
      )}

      {publicPostsError && (
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{publicPostsError}</p>
          <Button onClick={() => loadPublicPosts({ page: 1, ...computedParams })} variant="outline">Thử lại</Button>
        </div>
      )}

      {!publicPostsLoading && !publicPostsError && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {publicPosts.map(post => (
            <Link key={post.id} href={`/room-seeking/${post.id}`} className="block">
              <RoomSeekingCard post={post} />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default function PublicRoomSeekingListPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8 pt-20"><div className="text-center py-12">Đang tải...</div></div>}>
      <RoomSeekingContent />
    </Suspense>
  )
}



