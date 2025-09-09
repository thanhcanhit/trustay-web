'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { SlidersHorizontal, X, Search } from 'lucide-react';
import { useSearchFilters } from '@/hooks/use-search-filters';
import { type RoomSearchParams } from '@/types/types';
import { getRoomTypeOptions } from '@/utils/room-types';

interface SearchFiltersProps {
  className?: string;
}

const ROOM_TYPES = getRoomTypeOptions();

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Mới nhất' },
  { value: 'price', label: 'Giá' },
  { value: 'area', label: 'Diện tích' },
];

export function SearchFilters({ className }: SearchFiltersProps) {
  const { filters, updateFilters, clearFilters, clearFilter } = useSearchFilters();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: keyof RoomSearchParams, value: unknown) => {
    updateFilters({ [key]: value });
  };

  const handlePriceRangeChange = (type: 'min' | 'max', value: string) => {
    const numValue = value ? parseInt(value) : undefined;
    if (type === 'min') {
      updateFilters({ minPrice: numValue });
    } else {
      updateFilters({ maxPrice: numValue });
    }
  };

  const handleAreaRangeChange = (type: 'min' | 'max', value: string) => {
    const numValue = value ? parseInt(value) : undefined;
    if (type === 'min') {
      updateFilters({ minArea: numValue });
    } else {
      updateFilters({ maxArea: numValue });
    }
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'search' || key === 'page' || key === 'limit') return false;
    return value !== undefined && value !== null && value !== '';
  });

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <SlidersHorizontal className="h-4 w-4" />
            <CardTitle className="text-lg">Bộ lọc tìm kiếm</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-3 w-3 mr-1" />
                Xóa tất cả
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Thu gọn' : 'Mở rộng'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Basic Filters - Always visible */}
        <div className="space-y-3">
          {/* Search */}
          <div>
            <Label htmlFor="search">Từ khóa tìm kiếm</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Nhập từ khóa tìm kiếm..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Room Type */}
          <div>
            <Label htmlFor="roomType">Loại phòng</Label>
            <Select
              value={filters.roomType || ''}
              onValueChange={(value) => handleFilterChange('roomType', value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tất cả loại phòng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tất cả loại phòng</SelectItem>
                {ROOM_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort */}
          <div>
            <Label htmlFor="sortBy">Sắp xếp theo</Label>
            <Select
              value={filters.sortBy}
              onValueChange={(value) => handleFilterChange('sortBy', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort Order */}
          <div>
            <Label htmlFor="sortOrder">Thứ tự</Label>
            <Select
              value={filters.sortOrder}
              onValueChange={(value) => handleFilterChange('sortOrder', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Giảm dần</SelectItem>
                <SelectItem value="asc">Tăng dần</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Expanded Filters */}
        {isExpanded && (
          <>
            <Separator />
            <div className="space-y-4">
              {/* Price Range */}
              <div>
                <Label>Khoảng giá (VNĐ/tháng)</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <Input
                    placeholder="Từ"
                    type="number"
                    value={filters.minPrice || ''}
                    onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                  />
                  <Input
                    placeholder="Đến"
                    type="number"
                    value={filters.maxPrice || ''}
                    onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                  />
                </div>
              </div>

              {/* Area Range */}
              <div>
                <Label>Diện tích (m²)</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <Input
                    placeholder="Từ"
                    type="number"
                    value={filters.minArea || ''}
                    onChange={(e) => handleAreaRangeChange('min', e.target.value)}
                  />
                  <Input
                    placeholder="Đến"
                    type="number"
                    value={filters.maxArea || ''}
                    onChange={(e) => handleAreaRangeChange('max', e.target.value)}
                  />
                </div>
              </div>

              {/* Max Occupancy */}
              <div>
                <Label htmlFor="maxOccupancy">Sức chứa tối đa</Label>
                <Select
                  value={filters.maxOccupancy?.toString() || ''}
                  onValueChange={(value) => handleFilterChange('maxOccupancy', value ? parseInt(value) : undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tất cả" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tất cả</SelectItem>
                    <SelectItem value="1">1 người</SelectItem>
                    <SelectItem value="2">2 người</SelectItem>
                    <SelectItem value="3">3 người</SelectItem>
                    <SelectItem value="4">4 người</SelectItem>
                    <SelectItem value="5">5+ người</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Verified Only */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isVerified"
                  checked={filters.isVerified || false}
                  onCheckedChange={(checked) => handleFilterChange('isVerified', checked || undefined)}
                />
                <Label htmlFor="isVerified">Chỉ hiển thị phòng đã xác thực</Label>
              </div>
            </div>
          </>
        )}

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <>
            <Separator />
            <div>
              <Label className="text-sm font-medium">Bộ lọc đang áp dụng:</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {filters.roomType && (
                  <div className="flex items-center space-x-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                    <span>Loại: {ROOM_TYPES.find(t => t.value === filters.roomType)?.label}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 text-blue-800 hover:text-blue-900"
                      onClick={() => clearFilter('roomType')}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                {filters.minPrice && (
                  <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                    <span>Giá từ: {filters.minPrice.toLocaleString()} VNĐ</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 text-green-800 hover:text-green-900"
                      onClick={() => clearFilter('minPrice')}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                {filters.maxPrice && (
                  <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                    <span>Giá đến: {filters.maxPrice.toLocaleString()} VNĐ</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 text-green-800 hover:text-green-900"
                      onClick={() => clearFilter('maxPrice')}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                {filters.isVerified && (
                  <div className="flex items-center space-x-1 bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
                    <span>Đã xác thực</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 text-purple-800 hover:text-purple-900"
                      onClick={() => clearFilter('isVerified')}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
