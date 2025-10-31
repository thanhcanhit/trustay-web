"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { useRoomSeekingStore } from "@/stores/roomSeekingStore"
import { RoomSeekingCard } from "@/components/ui/room-seeking-card"
import { Search } from "lucide-react"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty"

export function FeaturedRoomSeekings() {
  const {
    publicPosts,
    publicPostsLoading: isLoading,
    publicPostsError: error,
    loadPublicPosts
  } = useRoomSeekingStore()

  const hasLoadedRef = useRef(false)

  // Load featured room-seeking posts on component mount - only once
  useEffect(() => {
    if (!hasLoadedRef.current && publicPosts.length === 0 && !isLoading) {
      hasLoadedRef.current = true
      loadPublicPosts({ page: 1, limit: 4 })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            NGƯỜI TÌM TRỌ NỔI BẬT
          </h2>
          <p className="text-gray-600">
            Những bài đăng tìm chỗ thuê được quan tâm nhiều nhất
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Đang tải bài đăng nổi bật...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">Lỗi: {error}</p>
            <Button 
              variant="outline" 
              onClick={() => loadPublicPosts({ page: 1, limit: 4 })}
            >
              Thử lại
            </Button>
          </div>
        )}

        {/* Featured Posts Grid */}
        {!isLoading && !error && publicPosts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {publicPosts.slice(0, 4).map((post) => (
              <RoomSeekingCard
                key={post.id}
                post={post}
                className="hover:shadow-xl transition-shadow duration-300"
              />
            ))}
          </div>
        )}

        {/* No Posts State */}
        {!isLoading && !error && publicPosts.length === 0 && (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Search />
              </EmptyMedia>
              <EmptyTitle>Chưa có bài đăng tìm trọ</EmptyTitle>
              <EmptyDescription>
                Hiện tại chưa có bài đăng tìm chỗ thuê nào. Hãy quay lại sau để xem các bài đăng mới nhất.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button
                variant="outline"
                onClick={() => loadPublicPosts({ page: 1, limit: 4 })}
              >
                Tải lại
              </Button>
            </EmptyContent>
          </Empty>
        )}

        {/* View More Button */}
        <div className="text-center mt-8">
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => window.location.href = '/room-seekings'}
          >
            Xem thêm bài đăng
          </Button>
        </div>
      </div>
    </section>
  )
}
