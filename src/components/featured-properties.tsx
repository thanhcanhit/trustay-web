"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useRoomStore } from "@/stores/roomStore"
import { RoomCard } from "@/components/ui/room-card"

export function FeaturedProperties() {
  const {
    featuredRooms,
    featuredLoading: isLoading,
    featuredError: error,
    savedRooms,
    loadFeaturedRooms,
    toggleSaveRoom
  } = useRoomStore()

  // Load featured rooms on component mount
  useEffect(() => {
    if (featuredRooms.length === 0 && !isLoading) {
      loadFeaturedRooms(4)
    }
  }, [featuredRooms.length, isLoading, loadFeaturedRooms])



  const handleRoomClick = (slug: string) => {
    // Navigate to room detail page using slug
    window.location.href = `/property/${slug}`
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            LỰA CHỌN CHỖ Ở HOT
          </h2>
          <p className="text-gray-600">
            Những phòng trọ được quan tâm nhiều nhất
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Đang tải phòng nổi bật...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-8">
            <p className="text-red-600">Lỗi: {error}</p>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="mt-2"
            >
              Thử lại
            </Button>
          </div>
        )}

        {/* Featured Rooms Grid */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

        {/* View More Button */}
        <div className="text-center mt-8">
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => window.location.href = '/search?type=room'}
          >
            Xem thêm phòng trọ
          </Button>
        </div>
      </div>
    </section>
  )
}
