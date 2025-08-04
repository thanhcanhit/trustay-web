"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, Heart, Share2, MapPin, Star, Wifi, Car, Shield, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getPropertyWithRoom, mockReviews } from "@/data/mock-data"

export default function PropertyDetailPage() {
  const params = useParams()
  const propertyId = params.id as string
  const [isSaved, setIsSaved] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const propertyWithRoom = getPropertyWithRoom(propertyId)
  
  if (!propertyWithRoom) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy phòng trọ</h1>
          <Button onClick={() => window.history.back()}>
            Quay lại
          </Button>
        </div>
      </div>
    )
  }

  const { room, ...property } = propertyWithRoom
  const propertyReviews = mockReviews.filter(review => review.propertyId === propertyId)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price)
  }

  const amenityIcons: { [key: string]: React.ComponentType } = {
    'WiFi miễn phí': Wifi,
    'WiFi': Wifi,
    'Gửi xe miễn phí': Car,
    'Bảo vệ 24/7': Shield,
    'Bảo vệ': Shield,
    'Điều hòa': Zap,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => window.history.back()}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsSaved(!isSaved)}
              >
                <Heart className={`h-4 w-4 mr-2 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
                {isSaved ? 'Đã lưu' : 'Lưu'}
              </Button>
              <Button variant="ghost" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Chia sẻ
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
              <div className="relative h-96">
                <Image
                  src={property.images[currentImageIndex] || "/placeholder-room.jpg"}
                  alt={property.name}
                  fill
                  className="object-cover"
                />
                {property.isHot && (
                  <div className="absolute top-4 left-4">
                    <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded">
                      HOT
                    </span>
                  </div>
                )}
              </div>
              
              {/* Image Thumbnails */}
              {property.images.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto">
                  {property.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                        currentImageIndex === index ? 'border-blue-500' : 'border-gray-200'
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${property.name} ${index + 1}`}
                        width={80}
                        height={80}
                        className="object-cover w-full h-full"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Property Info */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {property.name}
              </h1>

              <div className="flex items-center mb-4">
                <MapPin className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-gray-700">
                  {property.address}, {property.district}, {property.city}
                </span>
              </div>

              {property.rating && (
                <div className="flex items-center mb-4">
                  <Star className="h-5 w-5 text-yellow-500 mr-2" />
                  <span className="font-medium">{property.rating}</span>
                  <span className="text-gray-500 ml-2">
                    ({property.reviewCount} đánh giá)
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <span className="text-gray-500">Diện tích:</span>
                  <span className="font-medium ml-2">{room.area}m²</span>
                </div>
                <div>
                  <span className="text-gray-500">Trạng thái:</span>
                  <span className="font-medium ml-2 text-green-600">
                    {room.status === 'available' ? 'Còn trống' : 'Đã thuê'}
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Mô tả</h3>
                <p className="text-gray-700">{property.description}</p>
              </div>

              {/* Amenities */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Tiện nghi</h3>
                <div className="grid grid-cols-2 gap-3">
                  {property.amenities.map((amenity, index) => {
                    const IconComponent = amenityIcons[amenity] || Wifi
                    return (
                      <div key={index} className="flex items-center">
                        <IconComponent />
                        <span className="text-gray-700">{amenity}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Reviews */}
            {propertyReviews.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Đánh giá ({propertyReviews.length})
                </h3>
                <div className="space-y-4">
                  {propertyReviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <div className="flex items-center mb-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-medium ml-2">{review.tenantName}</span>
                        <span className="text-gray-500 ml-2 text-sm">
                          {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <div className="text-3xl font-bold text-red-600 mb-4">
                {formatPrice(room.price)} VNĐ/tháng
              </div>

              <div className="space-y-4 mb-6">
                <Button className="w-full" size="lg">
                  Liên hệ thuê phòng
                </Button>
                <Button variant="outline" className="w-full" size="lg">
                  Xem số điện thoại
                </Button>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-3">Thông tin liên hệ</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>Chủ trọ: Nguyễn Văn A</div>
                  <div>Điện thoại: 0123 456 789</div>
                  <div>Email: contact@example.com</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
