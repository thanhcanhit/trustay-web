"use client"

import { useState } from "react"
import Image from "next/image"
import { Heart, MapPin, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getHotProperties, getPropertyWithRoom } from "@/data/mock-data"

export function FeaturedProperties() {
  const [savedProperties, setSavedProperties] = useState<string[]>([])
  const hotProperties = getHotProperties()

  const toggleSave = (propertyId: string) => {
    setSavedProperties(prev => 
      prev.includes(propertyId) 
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price / 1000000)
  }

  const handlePropertyClick = (propertyId: string) => {
    // Navigate to property detail page
    window.location.href = `/property/${propertyId}`
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {hotProperties.map((property) => {
            const propertyWithRoom = getPropertyWithRoom(property.id)
            const room = propertyWithRoom?.room
            const isSaved = savedProperties.includes(property.id)

            return (
              <div 
                key={property.id} 
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handlePropertyClick(property.id)}
              >
                {/* Image Container */}
                <div className="relative h-48">
                  <Image
                    src={property.images[0] || "/placeholder-room.jpg"}
                    alt={property.name}
                    fill
                    className="object-cover"
                  />
                  
                  {/* HOT Badge */}
                  <div className="absolute top-2 left-2">
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                      HOT
                    </span>
                  </div>

                  {/* Save Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleSave(property.id)
                    }}
                    className="absolute top-2 right-2 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
                  >
                    <Heart 
                      className={`h-4 w-4 ${isSaved ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
                    />
                  </button>

                  {/* Review Badge */}
                  {property.rating && (
                    <div className="absolute bottom-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
                      <Star className="h-3 w-3 inline mr-1" />
                      Review
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {property.name}
                  </h3>

                  {/* Price */}
                  <div className="text-red-600 font-bold text-lg mb-2">
                    {room ? `${formatPrice(room.price)} triệu/tháng` : 'Liên hệ'}
                  </div>

                  {/* Property Type */}
                  <div className="text-sm text-gray-600 mb-2">
                    {property.description}
                  </div>

                  {/* Area */}
                  {room && (
                    <div className="text-sm text-gray-600 mb-2">
                      {room.area}m²
                    </div>
                  )}

                  {/* Location */}
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{property.district}, {property.city}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

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
