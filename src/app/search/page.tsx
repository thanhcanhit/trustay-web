"use client";

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRoomStore } from '@/stores/roomStore';
import { type RoomSearchParams } from '@/actions/listings.action';
import { RoomCard } from '@/components/ui/room-card';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const {
    searchResults: rooms,
    searchLoading: isLoading,
    searchError: error,
    searchPagination,
    savedRooms,
    searchRooms,
    toggleSaveRoom,
    clearSearchResults
  } = useRoomStore();

  const hasMore = searchPagination?.hasNext || false;

  // Get search parameters from URL
  const getSearchParams = useCallback((): RoomSearchParams => {
    return {
      search: searchParams.get('search') || undefined,
      provinceId: searchParams.get('provinceId') ? parseInt(searchParams.get('provinceId')!) : undefined,
      districtId: searchParams.get('districtId') ? parseInt(searchParams.get('districtId')!) : undefined,
      wardId: searchParams.get('wardId') ? parseInt(searchParams.get('wardId')!) : undefined,
      roomType: searchParams.get('roomType') || undefined,
      minPrice: searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined,
      maxPrice: searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined,
      minArea: searchParams.get('minArea') ? parseInt(searchParams.get('minArea')!) : undefined,
      maxArea: searchParams.get('maxArea') ? parseInt(searchParams.get('maxArea')!) : undefined,
      amenities: searchParams.get('amenities') || undefined,
      maxOccupancy: searchParams.get('maxOccupancy') ? parseInt(searchParams.get('maxOccupancy')!) : undefined,
      isVerified: searchParams.get('isVerified') === 'true' ? true : undefined,
      sortBy: (searchParams.get('sortBy') as 'price' | 'area' | 'createdAt') || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
      limit: 12
    };
  }, [searchParams]);

  // Load initial results
  const loadRooms = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      if (page === 1 && !append) {
        clearSearchResults();
      }

      if (page > 1) {
        setIsLoadingMore(true);
      }

      const params = getSearchParams();

      // Call store action which uses server action
      await searchRooms({ ...params, page }, append);
      setCurrentPage(page);
    } catch (err: unknown) {
      console.error('Failed to load rooms:', err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [getSearchParams, searchRooms, clearSearchResults]);

  // Load more rooms for infinite scroll
  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      loadRooms(currentPage + 1, true);
    }
  }, [currentPage, hasMore, isLoadingMore, loadRooms]);

  // Initial load and reload when search params change
  useEffect(() => {
    setCurrentPage(1);
    loadRooms(1, false);
  }, [searchParams, loadRooms]);

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop
        >= document.documentElement.offsetHeight - 1000
      ) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore]);

  // toggleSave is now handled by store (toggleSaveRoom)

  const handleRoomClick = (slug: string) => {
    window.location.href = `/property/${slug}`;
  };

  return (
    <div className="container mx-auto px-4 py-8 pt-20">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Kết quả tìm kiếm</h1>
        <p className="text-gray-600">
          {!isLoading && rooms.length > 0 && `Tìm thấy ${rooms.length} phòng`}
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-green-600" />
          <p className="text-gray-600 mt-2">Đang tìm kiếm phòng...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">Lỗi: {error}</p>
          <Button
            variant="outline"
            onClick={() => loadRooms(1, false)}
          >
            Thử lại
          </Button>
        </div>
      )}

      {/* No Results */}
      {!isLoading && !error && rooms.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">Không tìm thấy phòng nào phù hợp</p>
        </div>
      )}

      {/* Results Grid */}
      {!isLoading && !error && rooms.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                isSaved={savedRooms.includes(room.id)}
                onSaveToggle={toggleSaveRoom}
                onClick={handleRoomClick}
              />
            ))}
          </div>

          {/* Load More Button / Loading More */}
          {hasMore && (
            <div className="text-center mt-8">
              {isLoadingMore ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-green-600 mr-2" />
                  <span className="text-gray-600">Đang tải thêm...</span>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={loadMore}
                  className="px-8"
                >
                  Tải thêm phòng
                </Button>
              )}
            </div>
          )}

          {/* End of results */}
          {!hasMore && rooms.length > 0 && (
            <div className="text-center mt-8">
              <p className="text-gray-500">Đã hiển thị tất cả kết quả</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-green-600" />
          <p className="text-gray-600 mt-2">Đang tải trang tìm kiếm...</p>
        </div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
