"use client"

import { useSearchParams, useRouter } from 'next/navigation'
import { X } from 'lucide-react'

interface FilterTagsProps {
  basePath?: string
}

export function FilterTags({ basePath = '/rooms' }: FilterTagsProps) {
  const searchParams = useSearchParams()
  const router = useRouter()

  const activeTags: { key: string; label: string; value: string }[] = []

  // Check for active filters
  const roomType = searchParams.get('roomType')
  const minPrice = searchParams.get('minPrice')
  const maxPrice = searchParams.get('maxPrice')
  const minArea = searchParams.get('minArea')
  const maxArea = searchParams.get('maxArea')
  const provinceId = searchParams.get('provinceId')
  const amenities = searchParams.get('amenities')

  if (roomType) {
    const roomTypeLabels: Record<string, string> = {
      'phong-tro': 'Phòng trọ',
      'nha-nguyen-can': 'Nhà nguyên căn',
      'can-ho': 'Căn hộ',
      'o-ghep': 'Ở ghép'
    }
    activeTags.push({ key: 'roomType', label: roomTypeLabels[roomType] || roomType, value: roomType })
  }

  if (minPrice || maxPrice) {
    const formatPrice = (price: string) => {
      const num = parseInt(price)
      if (num >= 1000000) return `${num / 1000000}tr`
      return `${num}đ`
    }
    const priceLabel = minPrice && maxPrice
      ? `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`
      : minPrice
      ? `Từ ${formatPrice(minPrice)}`
      : `Đến ${formatPrice(maxPrice!)}`
    activeTags.push({ key: 'price', label: priceLabel, value: 'price' })
  }

  if (minArea || maxArea) {
    const areaLabel = minArea && maxArea
      ? `${minArea}m² - ${maxArea}m²`
      : minArea
      ? `Từ ${minArea}m²`
      : `Đến ${maxArea}m²`
    activeTags.push({ key: 'area', label: areaLabel, value: 'area' })
  }

  if (amenities) {
    const amenityList = amenities.split(',')
    amenityList.forEach(amenity => {
      activeTags.push({ key: `amenity-${amenity}`, label: amenity, value: amenity })
    })
  }

  const removeFilter = (key: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()))

    if (key === 'roomType') {
      current.delete('roomType')
    } else if (key === 'price') {
      current.delete('minPrice')
      current.delete('maxPrice')
    } else if (key === 'area') {
      current.delete('minArea')
      current.delete('maxArea')
    } else if (key.startsWith('amenity-')) {
      const amenityValue = key.replace('amenity-', '')
      const currentAmenities = current.get('amenities')?.split(',') || []
      const newAmenities = currentAmenities.filter(a => a !== amenityValue)
      if (newAmenities.length > 0) {
        current.set('amenities', newAmenities.join(','))
      } else {
        current.delete('amenities')
      }
    }

    const search = current.toString()
    const query = search ? `?${search}` : ''
    router.push(`${basePath}${query}`)
  }

  const clearAllFilters = () => {
    const current = new URLSearchParams(Array.from(searchParams.entries()))
    const searchQuery = current.get('search')
    const page = current.get('page')

    const newParams = new URLSearchParams()
    if (searchQuery) newParams.set('search', searchQuery)
    if (page) newParams.set('page', page)

    const query = newParams.toString() ? `?${newParams.toString()}` : ''
    router.push(`${basePath}${query}`)
  }

  if (activeTags.length === 0) return null

  return (
    <div className="lg:hidden bg-white border-b px-3 py-2 flex items-center gap-2 overflow-x-auto scrollbar-hide">
      {activeTags.map(tag => (
        <button
          key={tag.key}
          onClick={() => removeFilter(tag.key)}
          className="flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 text-xs rounded-full border border-green-200 whitespace-nowrap hover:bg-green-100 transition-colors flex-shrink-0"
        >
          <span>{tag.label}</span>
          <X className="h-3 w-3" />
        </button>
      ))}

      {activeTags.length > 1 && (
        <button
          onClick={clearAllFilters}
          className="px-2.5 py-1 text-xs text-gray-600 whitespace-nowrap hover:text-gray-900 flex-shrink-0"
        >
          Xóa tất cả
        </button>
      )}
    </div>
  )
}
