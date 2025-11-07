"use client";

import { useEffect, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRoomStore } from '@/stores/roomStore';
import { type RoomSearchParams } from '@/types/types';
import { RoomCard } from '@/components/ui/room-card';
import { parseSearchParams } from '@/utils/search-params';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { useRoomsQuery } from '@/hooks/useRoomsQuery';
import { useScrollRestoration } from '@/hooks/useScrollRestoration';
import Link from 'next/link';
import { SortingTabs } from '@/components/ui/sorting-tabs';
import { FilterTags } from '@/components/ui/filter-tags';

function RoomsPageContent() {
  const searchParams = useSearchParams();

  const { savedRooms, toggleSaveRoom } = useRoomStore();

  // Khôi phục scroll position
  useScrollRestoration('rooms-list');

  // Get search parameters from URL
  const currentSearchParams = useMemo((): RoomSearchParams => {
    return parseSearchParams(searchParams);
  }, [searchParams]);

  // Sử dụng TanStack Query
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useRoomsQuery(currentSearchParams);

  // Flatten all pages into single array
  const rooms = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) ?? [];
  }, [data]);

  const totalCount = data?.pages[0]?.meta.total ?? 0;

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 1000 &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);


  return (
    <>
      {/* Mobile Sorting Tabs */}
      <SortingTabs basePath="/rooms" />

      {/* Mobile Filter Tags */}
      <FilterTags basePath="/rooms" />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">Tìm kiếm phòng trọ</h1>
              <p className="text-gray-600">
                {!isLoading && totalCount > 0 && `Tìm thấy ${totalCount} phòng`}
              </p>
            </div>
          </div>
        </div>

      {/* Main Content */}
      <div>
          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-green-600" />
              <p className="text-gray-600 mt-2">Đang tìm kiếm phòng...</p>
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">Lỗi: {error?.message || 'Có lỗi xảy ra'}</p>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Thử lại
              </Button>
            </div>
          )}

          {/* No Results */}
          {!isLoading && !isError && rooms.length === 0 && (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Home />
                </EmptyMedia>
                <EmptyTitle>Không tìm thấy phòng nào</EmptyTitle>
                <EmptyDescription>
                  Không có phòng trọ phù hợp với tiêu chí tìm kiếm của bạn. Hãy thử điều chỉnh bộ lọc hoặc tìm kiếm lại.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}

          {/* Results Grid */}
          {!isLoading && !isError && rooms.length > 0 && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-6">
                {rooms.map((room) => (
                  <Link key={room.id} href={`/rooms/${room.id}`}>
                    <RoomCard
                      room={room}
                      isSaved={savedRooms.includes(room.id)}
                      onSaveToggle={toggleSaveRoom}
                    />
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
                      Tải thêm phòng
                    </Button>
                  )}
                </div>
              )}

              {/* End of results */}
              {!hasNextPage && totalCount > 0 && (
                <div className="text-center mt-8">
                  <p className="text-gray-500">Đã hiển thị tất cả {totalCount} kết quả</p>
                </div>
              )}
            </>
          )}
      </div>
      </div>
    </>
  );
}

export default function RoomsPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-green-600" />
          <p className="text-gray-600 mt-2">Đang tải trang tìm kiếm...</p>
        </div>
      </div>
    }>
      <RoomsPageContent />
    </Suspense>
  );
}
