"use client"

import { Suspense, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { RoomSeekingCard } from '@/components/ui/room-seeking-card'
import { Button } from '@/components/ui/button'
import { Loader2, SlidersHorizontal, SearchX } from 'lucide-react'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { useRoomSeekingsQuery } from '@/hooks/useRoomSeekingsQuery'
import { useScrollRestoration } from '@/hooks/useScrollRestoration'
import type { RoomSeekingPublicSearchParams } from '@/types/types'

function RoomSeekingsContent() {
  const searchParams = useSearchParams()

  // Khôi phục scroll position
  useScrollRestoration('room-seekings-list')

  const computedParams = useMemo((): RoomSeekingPublicSearchParams => {
    const params: RoomSeekingPublicSearchParams = {}
    const search = searchParams.get('search')
    if (search) params.search = search
    const provinceId = searchParams.get('provinceId')
    const districtId = searchParams.get('districtId')
    const wardId = searchParams.get('wardId')
    const minBudget = searchParams.get('minBudget')
    const maxBudget = searchParams.get('maxBudget')
    const roomType = searchParams.get('roomType')
    const occupancy = searchParams.get('occupancy')
    const sortBy = searchParams.get('sortBy')
    const sortOrder = searchParams.get('sortOrder')
    if (provinceId) params.provinceId = Number(provinceId)
    if (districtId) params.districtId = Number(districtId)
    if (wardId) params.wardId = Number(wardId)
    if (minBudget) params.minBudget = Number(minBudget)
    if (maxBudget) params.maxBudget = Number(maxBudget)
    if (roomType) params.roomType = roomType
    if (occupancy) params.occupancy = Number(occupancy)
    if (sortBy && ['createdAt', 'updatedAt', 'title', 'maxBudget', 'viewCount', 'contactCount'].includes(sortBy)) {
      params.sortBy = sortBy as 'createdAt' | 'updatedAt' | 'title' | 'maxBudget' | 'viewCount' | 'contactCount'
    }
    if (sortOrder && ['asc', 'desc'].includes(sortOrder)) {
      params.sortOrder = sortOrder as 'asc' | 'desc'
    }
    return params
  }, [searchParams])

  // Sử dụng TanStack Query
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useRoomSeekingsQuery(computedParams)

  // Flatten all pages into single array
  const posts = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) ?? []
  }, [data])

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 1000 &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage()
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Tìm người thuê phòng</h1>
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

      {isLoading && (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-green-600" />
          <p className="text-gray-600 mt-2">Đang tải...</p>
        </div>
      )}

      {isError && (
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error?.message || 'Có lỗi xảy ra'}</p>
          <Button onClick={() => window.location.reload()} variant="outline">Thử lại</Button>
        </div>
      )}

      {!isLoading && !isError && (
        posts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {posts.map(post => (
                <Link key={post.id} href={`/room-seekings/${post.id}`} className="block">
                  <RoomSeekingCard post={post} asLink={false} />
                </Link>
              ))}
            </div>

            {/* Load More Button / Loading More */}
            {hasNextPage && (
              <div className="text-center mt-8">
                {isFetchingNextPage ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-green-600 mr-2" />
                    <span className="text-gray-600">Đang tải thêm...</span>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => fetchNextPage()}
                    className="px-8"
                  >
                    Tải thêm bài đăng
                  </Button>
                )}
              </div>
            )}
          </>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <SearchX />
              </EmptyMedia>
              <EmptyTitle>Không tìm thấy bài đăng</EmptyTitle>
              <EmptyDescription>
                Không có bài đăng tìm phòng nào phù hợp với tiêu chí tìm kiếm của bạn. Hãy thử lại hoặc điều chỉnh bộ lọc.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )
      )}
    </div>
  )
}

export default function RoomSeekingsPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8 pt-20"><div className="text-center py-12">Đang tải...</div></div>}>
      <RoomSeekingsContent />
    </Suspense>
  )
}
