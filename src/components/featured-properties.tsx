"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { useRoomStore } from "@/stores/roomStore"
import { RoomCard } from "@/components/ui/room-card"
import { Home } from "lucide-react"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty"

export function FeaturedProperties() {
  const {
    featuredRooms,
    featuredLoading: isLoading,
    featuredError: error,
    savedRooms,
    loadFeaturedRooms,
    toggleSaveRoom
  } = useRoomStore()

  const hasLoadedRef = useRef(false)

  // Load featured rooms on component mount - only once
  useEffect(() => {
    if (!hasLoadedRef.current && featuredRooms.length === 0 && !isLoading) {
      hasLoadedRef.current = true
      loadFeaturedRooms(4)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])



  const handleRoomClick = (id: string) => {
    // Navigate to room detail page using id
    window.location.href = `/rooms/${id}`
  }

  return (
    <section className="py-8 sm:py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            LỰA CHỌN CHỖ Ở HOT
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Những phòng trọ được quan tâm nhiều nhất
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-6 sm:py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-sm sm:text-base text-gray-600 mt-2">Đang tải phòng nổi bật...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-6 sm:py-8">
            <p className="text-sm sm:text-base text-red-600">Lỗi: {error}</p>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="mt-2 text-xs sm:text-sm"
            >
              Thử lại
            </Button>
          </div>
        )}

        {/* Featured Rooms Grid */}
        {!isLoading && !error && featuredRooms.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {featuredRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                isSaved={savedRooms.includes(room.id)}
                onSaveToggle={toggleSaveRoom}
                onClick={handleRoomClick}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && featuredRooms.length === 0 && (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Home />
              </EmptyMedia>
              <EmptyTitle>Chưa có phòng trọ nổi bật</EmptyTitle>
              <EmptyDescription>
                Hiện tại chưa có phòng trọ nổi bật nào. Hãy quay lại sau để xem các phòng trọ được quan tâm nhiều nhất.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button
                variant="outline"
                onClick={() => window.location.href = '/rooms'}
              >
                Xem tất cả phòng trọ
              </Button>
            </EmptyContent>
          </Empty>
        )}

        {/* View More Button */}
        <div className="text-center mt-6 sm:mt-8">
          <Button
            variant="outline"
            size="lg"
            onClick={() => window.location.href = '/rooms'}
            className="text-sm sm:text-base px-4 sm:px-6"
          >
            Xem thêm phòng trọ
          </Button>
        </div>
      </div>
    </section>
  )
}
