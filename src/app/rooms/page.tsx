"use client";

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, SlidersHorizontal, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { useRoomStore } from '@/stores/roomStore';
import { type RoomSearchParams } from '@/types/types';
import { RoomCard } from '@/components/ui/room-card';
import { parseSearchParams } from '@/utils/search-params';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { useRoomsQuery } from '@/hooks/useRoomsQuery';
import { useScrollRestoration } from '@/hooks/useScrollRestoration';
import Link from 'next/link';

function RoomsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);

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

  // Handle sorting changes
  const handleSortChange = (sortBy: string, sortOrder: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set('sortBy', sortBy);
    current.set('sortOrder', sortOrder);
    
    const search = current.toString();
    const query = search ? `?${search}` : '';
    router.push(`/rooms${query}`);
  };

  // Sorting Sidebar Component
  const SortingSidebar = () => {
    const currentSortBy = searchParams.get('sortBy') || 'createdAt';
    const currentSortOrder = searchParams.get('sortOrder') || 'desc';

    return (
      <Card className="h-fit sticky top-24">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <SlidersHorizontal className="h-4 w-4" />
            <h3 className="font-medium">Sắp xếp</h3>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Sort by Price */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Theo giá</label>
            <div className="space-y-1">
              <Button
                variant={currentSortBy === 'price' && currentSortOrder === 'asc' ? 'default' : 'outline'}
                size="sm"
                className="w-full justify-start"
                onClick={() => handleSortChange('price', 'asc')}
              >
                Giá thấp đến cao
              </Button>
              <Button
                variant={currentSortBy === 'price' && currentSortOrder === 'desc' ? 'default' : 'outline'}
                size="sm"
                className="w-full justify-start"
                onClick={() => handleSortChange('price', 'desc')}
              >
                Giá cao đến thấp
              </Button>
            </div>
          </div>

          {/* Sort by Area */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Theo diện tích</label>
            <div className="space-y-1">
              <Button
                variant={currentSortBy === 'area' && currentSortOrder === 'asc' ? 'default' : 'outline'}
                size="sm"
                className="w-full justify-start"
                onClick={() => handleSortChange('area', 'asc')}
              >
                Diện tích nhỏ đến lớn
              </Button>
              <Button
                variant={currentSortBy === 'area' && currentSortOrder === 'desc' ? 'default' : 'outline'}
                size="sm"
                className="w-full justify-start"
                onClick={() => handleSortChange('area', 'desc')}
              >
                Diện tích lớn đến nhỏ
              </Button>
            </div>
          </div>

          {/* Sort by Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Theo thời gian</label>
            <div className="space-y-1">
              <Button
                variant={currentSortBy === 'createdAt' && currentSortOrder === 'desc' ? 'default' : 'outline'}
                size="sm"
                className="w-full justify-start"
                onClick={() => handleSortChange('createdAt', 'desc')}
              >
                Mới nhất
              </Button>
              <Button
                variant={currentSortBy === 'createdAt' && currentSortOrder === 'asc' ? 'default' : 'outline'}
                size="sm"
                className="w-full justify-start"
                onClick={() => handleSortChange('createdAt', 'asc')}
              >
                Cũ nhất
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
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
          
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Sắp xếp
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Filter Panel - Outside grid */}
      <div className={`lg:hidden ${showFilters ? 'block' : 'hidden'} mb-6`}>
        <SortingSidebar />
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Desktop Filters Only */}
        <div className="hidden lg:block lg:col-span-1">
          <SortingSidebar />
        </div>

        {/* Right Content Area */}
        <div className="col-span-1 lg:col-span-3">
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
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {rooms.map((room) => (
                  <Link key={room.id} href={`/rooms/${room.slug}`}>
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
    </div>
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
