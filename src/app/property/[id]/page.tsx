"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { MapPin, Loader2, ChevronDown, ChevronUp, Calendar, Home } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useRoomStore } from "@/stores/roomStore"
import { AmenitySelector } from "@/components/ui/amenity-selector"
import { ImageSwiper } from "@/components/ui/image-swiper"
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

export default function PropertyDetailPage() {
  const params = useParams()
  const roomSlug = params.id as string
  const [hasLoaded, setHasLoaded] = useState(false)
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)

  const {
    currentRoom: roomDetail,
    roomLoading: isLoading,
    roomError: error,
    //savedRooms,
    loadRoomDetail,
    //toggleSaveRoom
  } = useRoomStore()

  //const isSaved = roomDetail ? savedRooms.includes(roomDetail.id) : false

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Mock data for similar posts - replace with actual API call
  const similarPosts = [
    {
      id: '1',
      name: 'Phòng trọ giá rẻ quận 1',
      price: '3500000',
      images: [{ url: '/api/placeholder/300/200', alt: 'Room 1' }],
      address: 'Quận 1, TP.HCM'
    },
    {
      id: '2', 
      name: 'Căn hộ mini đầy đủ tiện nghi',
      price: '4200000',
      images: [{ url: '/api/placeholder/300/200', alt: 'Room 2' }],
      address: 'Quận 3, TP.HCM'
    },
    {
      id: '3',
      name: 'Phòng trọ gần trường đại học',
      price: '2800000', 
      images: [{ url: '/api/placeholder/300/200', alt: 'Room 3' }],
      address: 'Quận Thủ Đức, TP.HCM'
    }
  ]

  // Mock data for owner's other posts - replace with actual API call
  const ownerOtherPosts = [
    {
      id: '4',
      name: 'Phòng trọ cùng chủ nhà',
      price: '3200000',
      images: [{ url: '/api/placeholder/300/200', alt: 'Owner Room 1' }],
      address: 'Cùng địa chỉ'
    },
    {
      id: '5',
      name: 'Căn hộ studio view đẹp',
      price: '4800000',
      images: [{ url: '/api/placeholder/300/200', alt: 'Owner Room 2' }],
      address: 'Quận 7, TP.HCM'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-2">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/" className="flex items-center">
                  <Home className="h-4 w-4" />
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/search">Tìm kiếm</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{roomDetail.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
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
              imageContext="detail"
            />

            {/* Room Basic Info */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{roomDetail.name}</h1>
              
              <div className="flex items-center mb-2">
                <span className="text-2xl font-bold text-red-600 mr-4">
                  {formatPrice(parseInt(roomDetail.pricing.basePriceMonthly))} VNĐ/tháng
                </span>
                <span className="text-gray-600">• Diện tích: {roomDetail.maxOccupancy} người</span>
              </div>
              
              <div className="flex items-center mb-2">
                <MapPin className="h-4 w-4 text-gray-500 mr-1" />
                <span className="text-gray-700 text-sm">
                  {roomDetail.address}, {roomDetail.location.wardName}, {roomDetail.location.districtName}, {roomDetail.location.provinceName}
                </span>
              </div>
              
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Đăng lúc: {formatDate(roomDetail.lastUpdated)}</span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Mô tả</h3>
              <div className={`text-gray-700 whitespace-pre-line ${!isDescriptionExpanded ? 'line-clamp-3' : ''}`}>
                {roomDetail.description}
              </div>
              {roomDetail.description.length > 150 && (
                <button
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  className="mt-2 text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium"
                >
                  {isDescriptionExpanded ? (
                    <>
                      Thu gọn <ChevronUp className="h-4 w-4 ml-1" />
                    </>
                  ) : (
                    <>
                      Xem thêm <ChevronDown className="h-4 w-4 ml-1" />
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Google Maps */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Vị trí</h3>
              <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                <iframe
                  width="100%"
                  height="100%"
                  className="rounded-lg"
                  src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${encodeURIComponent(
                    `${roomDetail.address}, ${roomDetail.location.wardName}, ${roomDetail.location.districtName}, ${roomDetail.location.provinceName}`
                  )}`}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Room Location"
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {roomDetail.address}, {roomDetail.location.wardName}, {roomDetail.location.districtName}, {roomDetail.location.provinceName}
              </p>
            </div>


            {/* Additional Room Info */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
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
                      <div key={cost.id} className="flex gap-3 items-center p-3">
                        <span className="text-gray-700">{cost.name}:</span>
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
                  <div className="grid grid-cols-3">
                    {roomDetail.rules.map(rule => (
                      <div key={rule.id} className="flex items-center p-3">
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
            <div className="bg-white rounded-lg shadow-sm p-6 mb-3 sticky top-6">
              <div className="text-2xl font-bold text-red-600 mb-4">
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

        {/* Similar Posts - Centered Below Main Content */}
        <div className="container mx-auto px-4 py-6">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4 text-center">Tin đăng tương tự</h3>
            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={16}
              slidesPerView={1}
              navigation
              pagination={{ clickable: true }}
              breakpoints={{
                640: {
                  slidesPerView: 2,
                },
                768: {
                  slidesPerView: 3,
                },
                1024: {
                  slidesPerView: 4,
                },
              }}
            >
              {similarPosts.map((post) => (
                <SwiperSlide key={post.id}>
                  <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <Image
                      src={post.images[0]?.url}
                      alt={post.images[0]?.alt}
                      width={300}
                      height={192}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">{post.name}</h4>
                      <p className="text-lg font-bold text-red-600 mb-1">
                        {formatPrice(parseInt(post.price))} VNĐ/tháng
                      </p>
                      <p className="text-sm text-gray-600">{post.address}</p>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>

        {/* Owner's Other Posts - Centered Below Similar Posts */}
        {ownerOtherPosts.length > 0 && (
          <div className="container mx-auto px-4 py-6">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4 text-center">
                Tin đăng khác của {roomDetail.owner.firstName} {roomDetail.owner.lastName}
              </h3>
              <Swiper
                modules={[Navigation, Pagination]}
                spaceBetween={16}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
                breakpoints={{
                  640: {
                    slidesPerView: 2,
                  },
                  768: {
                    slidesPerView: 3,
                  },
                  1024: {
                    slidesPerView: 4,
                  },
                }}
              >
                {ownerOtherPosts.map((post) => (
                  <SwiperSlide key={post.id}>
                    <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      <Image
                        src={post.images[0]?.url}
                        alt={post.images[0]?.alt}
                        width={300}
                        height={192}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">{post.name}</h4>
                        <p className="text-lg font-bold text-red-600 mb-1">
                          {formatPrice(parseInt(post.price))} VNĐ/tháng
                        </p>
                        <p className="text-sm text-gray-600">{post.address}</p>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
