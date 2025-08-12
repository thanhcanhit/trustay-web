"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { ArrowLeft, Heart, Share2, MapPin, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRoomStore } from "@/stores/roomStore"
import { AmenitySelector } from "@/components/ui/amenity-selector"
import { ImageSwiper } from "@/components/ui/image-swiper"

export default function PropertyDetailPage() {
  const params = useParams()
  const roomSlug = params.id as string
  const [hasLoaded, setHasLoaded] = useState(false)

  const {
    currentRoom: roomDetail,
    roomLoading: isLoading,
    roomError: error,
    savedRooms,
    loadRoomDetail,
    toggleSaveRoom
  } = useRoomStore()

  const isSaved = roomDetail ? savedRooms.includes(roomDetail.id) : false

  // Load room detail from API using store - only once
  useEffect(() => {
    if (roomSlug && !hasLoaded) {
      loadRoomDetail(roomSlug);
      setHasLoaded(true);
    }
  }, [roomSlug, hasLoaded, loadRoomDetail])

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-green-600" />
          <p className="text-gray-600 mt-2">Đang tải thông tin phòng...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !roomDetail) {
    return (
      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Không tìm thấy phòng trọ'}
          </h1>
          <Button onClick={() => window.history.back()}>
            Quay lại
          </Button>
        </div>
      </div>
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price)
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
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
                onClick={() => roomDetail && toggleSaveRoom(roomDetail.id)}
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
            <ImageSwiper
              images={roomDetail.images || []}
              title={roomDetail.name}
              className="mb-6"
              isVerified={roomDetail.isVerified}
            />

            {/* Room Info */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {roomDetail.name}
              </h1>

              <div className="flex items-center mb-4">
                <MapPin className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-gray-700">
                  {roomDetail.address}, {roomDetail.location.wardName}, {roomDetail.location.districtName}, {roomDetail.location.provinceName}
                </span>
              </div>



              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <span className="text-gray-500">Tòa nhà:</span>
                  <span className="font-medium ml-2">{roomDetail.buildingName}</span>
                </div>
                <div>
                  <span className="text-gray-500">Sức chứa:</span>
                  <span className="font-medium ml-2">{roomDetail.maxOccupancy} người</span>
                </div>
                <div>
                  <span className="text-gray-500">Loại phòng:</span>
                  <span className="font-medium ml-2">
                    {roomDetail.roomType === 'boarding_house' ? 'Nhà trọ' : roomDetail.roomType}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Trạng thái:</span>
                  <span className="font-medium ml-2 text-green-600">
                    {roomDetail.isVerified ? 'Đã xác minh' : 'Chưa xác minh'}
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Mô tả</h3>
                <div className="text-gray-700 whitespace-pre-line">{roomDetail.description}</div>
              </div>

              {/* Amenities */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Tiện nghi</h3>
                <AmenitySelector
                  selectedAmenities={roomDetail.amenities.map(a => a.id)}
                  onSelectionChange={() => {}} // Read-only
                  mode="display"
                />
              </div>

              {/* Cost Types */}
              {roomDetail.costs && roomDetail.costs.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Chi phí phát sinh</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {roomDetail.costs.map(cost => (
                      <div key={cost.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-700">{cost.name}</span>
                        <span className="font-medium">{new Intl.NumberFormat('vi-VN').format(parseInt(cost.value))}đ</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rules */}
              {roomDetail.rules && roomDetail.rules.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Quy định</h3>
                  <div className="space-y-2">
                    {roomDetail.rules.map(rule => (
                      <div key={rule.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <span className={`inline-block w-2 h-2 rounded-full mr-3 ${
                          rule.type === 'required' ? 'bg-green-500' :
                          rule.type === 'forbidden' ? 'bg-red-500' :
                          rule.type === 'allowed' ? 'bg-blue-500' : 'bg-yellow-500'
                        }`}></span>
                        <span className="text-gray-700">{rule.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>


          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <div className="text-3xl font-bold text-red-600 mb-4">
                {formatPrice(parseInt(roomDetail.pricing.basePriceMonthly))} VNĐ/tháng
              </div>

              <div className="mb-4">
                <div className="text-sm text-gray-600">
                  Tiền cọc: {formatPrice(parseInt(roomDetail.pricing.depositAmount))} VNĐ
                </div>
                <div className="text-sm text-gray-600">
                  {roomDetail.pricing.utilityIncluded ? 'Đã bao gồm tiện ích' : 'Chưa bao gồm tiện ích'}
                </div>
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
                <h4 className="font-semibold text-gray-900 mb-3">Thông tin chủ trọ</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {roomDetail.owner.firstName} {roomDetail.owner.lastName}
                    </span>
                    {roomDetail.owner.isVerifiedIdentity && (
                      <span className="text-green-600 text-xs">✓ Đã xác minh</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Điện thoại: {roomDetail.owner.phone}</span>
                    {roomDetail.owner.isVerifiedPhone && (
                      <span className="text-green-600 text-xs">✓ Đã xác minh</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Email: </span>
                    {roomDetail.owner.isVerifiedEmail && (
                      <span className="text-green-600 text-xs">✓ Đã xác minh</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
