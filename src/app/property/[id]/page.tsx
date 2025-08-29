"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { MapPin, Loader2, ChevronDown, ChevronUp, Calendar, Home, PhoneCall, Building, Users, CheckCircle, XCircle, AlertCircle, DollarSign, Zap, Droplets, Square, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { SizingImage } from "@/components/sizing-image"
import { useRoomStore } from "@/stores/roomStore"
import { AmenitySelector } from "@/components/ui/amenity-selector"
import { ImageSwiper } from "@/components/ui/image-swiper"
import { RoomCard } from "@/components/ui/room-card"
import { StarRating, StarRatingDisplay } from "@/components/ui/star-rating"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getRoomTypeDisplayName } from "@/utils/room-types"
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

export default function PropertyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const roomSlug = params.id as string
  const [hasLoaded, setHasLoaded] = useState(false)
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  const [userRating, setUserRating] = useState(0)
  const [userReview, setUserReview] = useState("")
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)

  const {
    currentRoom: roomDetail,
    roomLoading: isLoading,
    roomError: error,
    featuredRooms,
    featuredLoading,
    featuredError,
    searchResults,
    savedRooms,
    loadRoomDetail,
    loadFeaturedRooms,
    toggleSaveRoom,
    clearSearchResults
  } = useRoomStore()

  //const isSaved = roomDetail ? savedRooms.includes(roomDetail.id) : false

  // Clear search results when component mounts or room slug changes
  useEffect(() => {
    clearSearchResults()
  }, [roomSlug, clearSearchResults])

  // Load room detail from API using store - only once
  useEffect(() => {
    if (roomSlug && !hasLoaded) {
      loadRoomDetail(roomSlug);
      setHasLoaded(true);
    }
  }, [roomSlug, hasLoaded, loadRoomDetail])

  // Load featured rooms for similar posts if not already loaded
  useEffect(() => {
    if (featuredRooms.length === 0 && !featuredLoading) {
      loadFeaturedRooms(8) // Load more rooms for similar posts
    }
  }, [featuredRooms.length, featuredLoading, loadFeaturedRooms])

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

  // Debug owner data
  console.log('Room detail:', roomDetail)
  console.log('Owner data:', roomDetail.owner)
  console.log('Owner avatarUrl:', roomDetail.owner?.avatarUrl)

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

  // Get similar posts from available room listings
  const getSimilarPosts = () => {
    // Combine featured rooms and search results, excluding current room
    const allRooms = [...featuredRooms, ...searchResults]
    
    // Remove duplicates by ID and exclude current room
    const uniqueRooms = allRooms.reduce((acc, room) => {
      if (room.id !== roomDetail?.id && !acc.find(r => r.id === room.id)) {
        acc.push(room)
      }
      return acc
    }, [] as typeof allRooms)
    
    return uniqueRooms.slice(0, 8) // Limit to 8 similar posts
  }

  const handleRoomClick = (slug: string) => {
    // Navigate to room detail page using slug
    router.push(`/property/${slug}`)
  }

  const handleContactOwner = () => {
    // Create Zalo contact link using phone number
    const phoneNumber = roomDetail.owner.phone.replace(/\D/g, '') // Remove non-digits
    const zaloUrl = `https://zalo.me/${phoneNumber}`
    
    // Open Zalo in new tab
    window.open(zaloUrl, '_blank')
  }

  // Mock reviews data
  const mockReviews = [
    {
      id: 1,
      userName: "Nguyễn Văn A",
      avatar: "/placeholder-avatar.png",
      rating: 5,
      comment: "Phòng trọ rất sạch sẽ, thoáng mát. Chủ trọ thân thiện, giá cả hợp lý. Tôi rất hài lòng!",
      date: "2024-01-15",
      isVerified: true
    },
    {
      id: 2,
      userName: "Trần Thị B",
      avatar: "/placeholder-avatar.png", 
      rating: 4,
      comment: "Vị trí thuận tiện, gần trường học. Tiện nghi đầy đủ nhưng có thể cải thiện thêm về wifi.",
      date: "2024-01-10",
      isVerified: false
    },
    {
      id: 3,
      userName: "Lê Minh C",
      avatar: "/placeholder-avatar.png",
      rating: 5,
      comment: "Tuyệt vời! Phòng đúng như hình ảnh, chủ trọ hỗ trợ nhiệt tình. Sẽ giới thiệu cho bạn bè.",
      date: "2024-01-08",
      isVerified: true
    }
  ]

  const averageRating = mockReviews.reduce((sum, review) => sum + review.rating, 0) / mockReviews.length

  const handleSubmitReview = async () => {
    if (userRating === 0 || !userReview.trim()) {
      alert("Vui lòng đánh giá sao và nhập nhận xét!")
      return
    }

    setIsSubmittingReview(true)
    
    // Simulate API call
    setTimeout(() => {
      // Reset form
      setUserRating(0)
      setUserReview("")
      setIsSubmittingReview(false)
      alert("Cảm ơn bạn đã đánh giá!")
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Header */}
      {/*<div className="bg-white shadow-sm">
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
      */}

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <ImageSwiper
              images={roomDetail.images || []}
              title={roomDetail.name}
              className="mb-8"
              isVerified={roomDetail.isVerified}
              imageContext="detail"
            />

            {/* Room Basic Info */}
            <Card className="mb-8">
              <CardContent className="p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{roomDetail.name}</h1>
              
              <div className="flex items-center mb-2">
                <span className="text-2xl font-bold text-red-600 mr-4">
                  {roomDetail.pricing?.basePriceMonthly ? formatPrice(parseInt(roomDetail.pricing.basePriceMonthly)) : 'Liên hệ'} VNĐ/tháng
                </span>
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
              </CardContent>
            </Card>

            {/* Additional Room Info - Compact Version */}
            <Card className="mb-8">
              <CardContent className="p-6">
              {/* Basic Info - Horizontal Layout */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <Building className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-gray-600">Tòa nhà</p>
                    <p className="font-medium text-gray-900 truncate">{roomDetail.buildingName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-100">
                  <Users className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-gray-600">Sức chứa</p>
                    <p className="font-medium text-gray-900">{roomDetail.maxOccupancy} người</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg border border-purple-100">
                  <Home className="h-4 w-4 text-purple-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-gray-600">Loại phòng</p>
                    <p className="font-medium text-gray-900 truncate">
                      {getRoomTypeDisplayName(roomDetail.roomType)}
                    </p>
                  </div>
                </div>

                <div className={`flex items-center gap-2 p-3 rounded-lg border ${
                  roomDetail.isVerified 
                    ? 'bg-emerald-50 border-emerald-100' 
                    : 'bg-amber-50 border-amber-100'
                }`}>
                  {roomDetail.isVerified ? (
                    <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm text-gray-600">Trạng thái</p>
                    <p className={`font-medium ${
                      roomDetail.isVerified ? 'text-emerald-600' : 'text-amber-600'
                    }`}>
                      {roomDetail.isVerified ? 'Đã xác minh' : 'Chưa xác minh'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="bg-orange-100 rounded-lg">
                  <Square className="h-4 w-4 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900">
                  Diện tích phòng
                </h3>
              </div>
                <p className="text-gray-600">{roomDetail.areaSqm} m²</p>
              </div>

              {/* Amenities - Compact */}
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Home className="h-4 w-4 text-blue-600" />
                  Tiện nghi
                </h3>
                  <AmenitySelector
                  selectedAmenities={roomDetail.amenities.map(a => a.id)}
                  onSelectionChange={() => {}} // Read-only
                  mode="display"
                />
              </div>

              {/* Cost Types - Compact */}
              {roomDetail.costs && roomDetail.costs.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-orange-600" />
                    Chi phí phát sinh
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {roomDetail.costs.map(cost => {
                      const isElectricity = cost.name.toLowerCase().includes('điện')
                      const isWater = cost.name.toLowerCase().includes('nước')
                      
                      return (
                        <div key={cost.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                          {isElectricity ? (
                            <Zap className="h-3 w-3 text-yellow-600 flex-shrink-0" />
                          ) : isWater ? (
                            <Droplets className="h-3 w-3 text-blue-600 flex-shrink-0" />
                          ) : (
                            <DollarSign className="h-3 w-3 text-gray-600 flex-shrink-0" />
                          )}
                          <span className="text-gray-700 min-w-0 flex-1">{cost.name}:</span>
                          <span className="font-semibold text-green-600 flex-shrink-0">
                            {new Intl.NumberFormat('vi-VN').format(parseInt(cost.value))}đ
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Rules - Compact */}
              {roomDetail.rules && roomDetail.rules.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    Quy định
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {roomDetail.rules.map(rule => {
                      const getRuleStyle = (type: string) => {
                        switch (type) {
                          case 'required':
                            return 'bg-green-100 text-green-800 border-green-200'
                          case 'forbidden':
                            return 'bg-red-100 text-red-800 border-red-200'
                          case 'allowed':
                            return 'bg-blue-100 text-blue-800 border-blue-200'
                          default:
                            return 'bg-yellow-100 text-yellow-800 border-yellow-200'
                        }
                      }

                      return (
                        <span 
                          key={rule.id} 
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${getRuleStyle(rule.type)}`}
                        >
                          {rule.type === 'required' && <CheckCircle className="h-3 w-3" />}
                          {rule.type === 'forbidden' && <XCircle className="h-3 w-3" />}
                          {rule.type === 'allowed' && <CheckCircle className="h-3 w-3" />}
                          {rule.type !== 'required' && rule.type !== 'forbidden' && rule.type !== 'allowed' && <AlertCircle className="h-3 w-3" />}
                          {rule.name}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}
              </CardContent>
            </Card>

            {/* Description */}
            <Card className="mb-8">
              <CardContent className="p-6">
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
              </CardContent>
            </Card>           

            {/* Google Maps */}
            <Card className="mb-8">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Vị trí</h3>
              <div className="w-full h-64 bg-gray-200 rounded-lg overflow-hidden">
                {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
                  <iframe
                    width="100%"
                    height="100%"
                    className="rounded-lg border-0"
                    src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(
                      `${roomDetail.address}, ${roomDetail.location.wardName}, ${roomDetail.location.districtName}, ${roomDetail.location.provinceName}`
                    )}&zoom=16`}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Vị trí phòng trọ"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 rounded-lg">
                    <MapPin className="h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-gray-500 text-sm text-center">
                      Bản đồ chưa được cấu hình
                      <br />
                      <span className="text-xs">Vui lòng thêm Google Maps API key</span>
                    </p>
                  </div>
                )}
              </div>
              <div className="flex items-center mt-3 text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                <span>
                  {roomDetail.address}, {roomDetail.location.wardName}, {roomDetail.location.districtName}, {roomDetail.location.provinceName}
                </span>
              </div>
              
              {/* Open in Maps buttons */}
              <div className="flex gap-2 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const address = `${roomDetail.address}, ${roomDetail.location.wardName}, ${roomDetail.location.districtName}, ${roomDetail.location.provinceName}`
                    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
                    window.open(googleMapsUrl, '_blank')
                  }}
                  className="text-xs"
                >
                  📍 Mở Google Maps
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const address = `${roomDetail.address}, ${roomDetail.location.wardName}, ${roomDetail.location.districtName}, ${roomDetail.location.provinceName}`
                    // For mobile, try to open native maps app
                    const mapsUrl = `maps://maps.apple.com/?q=${encodeURIComponent(address)}`
                    const fallbackUrl = `https://maps.apple.com/?q=${encodeURIComponent(address)}`
                    
                    if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
                      window.location.href = mapsUrl
                      setTimeout(() => {
                        window.open(fallbackUrl, '_blank')
                      }, 1000)
                    } else {
                      window.open(fallbackUrl, '_blank')
                    }
                  }}
                  className="text-xs"
                >
                  🍎 Apple Maps
                </Button>
              </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="mb-3 sticky top-6">
              {/* Owner Profile Section */}
              <div className="p-4 border-b">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-12 w-12">
                    {roomDetail.owner?.avatarUrl && roomDetail.owner.avatarUrl.trim() !== '' ? (
                      <div className="w-full h-full relative">
                        <SizingImage 
                          src={roomDetail.owner.avatarUrl} 
                          srcSize="128x128" 
                          alt={`${roomDetail.owner.firstName || 'Owner'} ${roomDetail.owner.lastName || 'Name'}`} 
                          className="object-cover rounded-full"
                          fill
                        />
                      </div>
                    ) : (
                      <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                        {(roomDetail.owner?.firstName?.charAt(0) || 'U').toUpperCase()}{(roomDetail.owner?.lastName?.charAt(0) || 'S').toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 text-sm">
                        {roomDetail.owner.firstName} {roomDetail.owner.lastName}
                      </h3>
                      {roomDetail.owner.isVerifiedIdentity && (
                        <span className="text-green-600 text-xs">✓ Cá nhân</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Đang hoạt động</span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                {/* <div className="flex items-center gap-4 text-xs text-gray-600 mb-3">
                  <div className="flex items-center gap-1">
                    <span className="font-medium">📋 2 tin đăng</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">🏆 7 năm trên Nhà Tốt</span>
                  </div>
                </div> */}

                {/* Action Button */}
                <Button 
                  className="w-full bg-blue-400 hover:bg-blue-500 text-white"
                  size="lg"
                  onClick={handleContactOwner}
                >
                  <PhoneCall className="h-4 w-4 mr-2" />
                  Liên hệ qua Zalo
                </Button>
              </div>

              {/* Reviews Section */}
              <div className="px-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900 text-sm">Đánh giá ({mockReviews.length})</h4>
                  <div className="flex items-center gap-1">
                    <StarRatingDisplay rating={averageRating} size="sm" />
                    <span className="text-xs text-gray-600 ml-1">
                      {averageRating.toFixed(1)}
                    </span>
                  </div>
                </div>

                {/* Review Form */}
                <Card className="mb-4">
                  <CardContent className="p-3">
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">
                          Đánh giá của bạn
                        </label>
                        <StarRating
                          rating={userRating}
                          interactive={true}
                          onRatingChange={setUserRating}
                          size="md"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">
                          Nhận xét
                        </label>
                        <Textarea
                          placeholder="Chia sẻ trải nghiệm của bạn về phòng trọ này..."
                          value={userReview}
                          onChange={(e) => setUserReview(e.target.value)}
                          className="min-h-[60px] text-sm resize-none"
                        />
                      </div>
                      <Button
                        onClick={handleSubmitReview}
                        disabled={isSubmittingReview || userRating === 0}
                        size="sm"
                        className="w-full"
                      >
                        {isSubmittingReview ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            Đang gửi...
                          </>
                        ) : (
                          <>
                            <Send className="h-3 w-3 mr-1" />
                            Gửi đánh giá
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Reviews List */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {mockReviews.map((review) => (
                    <Card key={review.id} className="border-gray-100">
                      <CardContent className="p-3">
                        <div className="flex items-start gap-2">
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            {review.avatar ? (
                              <div className="w-full h-full relative">
                                <SizingImage 
                                  src={review.avatar} 
                                  srcSize="128x128" 
                                  alt={review.userName} 
                                  className="object-cover rounded-full"
                                  fill
                                />
                              </div>
                            ) : (
                              <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                                {review.userName.charAt(0)}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="text-xs font-medium text-gray-900 truncate">
                                {review.userName}
                              </h5>
                              {review.isVerified && (
                                <Badge variant="secondary" className="text-xs px-1 py-0">
                                  ✓
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <StarRatingDisplay rating={review.rating} size="sm" />
                              <span className="text-xs text-gray-500">
                                {new Date(review.date).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                            <p className="text-xs text-gray-700 leading-relaxed">
                              {review.comment}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Similar Posts - Centered Below Main Content */}
        <div className="container mx-auto py-6">
          <Card className="mb-6 ">
            <CardContent>
            {/* Header with title and "Xem thêm" button */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Tin đăng tương tự</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Navigate to search page with similar criteria
                  const searchParams = new URLSearchParams()
                  if (roomDetail.location.districtId) {
                    searchParams.set('districtId', roomDetail.location.districtId.toString())
                  }
                  if (roomDetail.location.provinceName) {
                    searchParams.set('provinceName', roomDetail.location.provinceName)
                  }
                  if (roomDetail.roomType) {
                    searchParams.set('roomType', roomDetail.roomType)
                  }
                  // Add price range based on current room
                  const currentPrice = roomDetail.pricing?.basePriceMonthly ? parseInt(roomDetail.pricing.basePriceMonthly) : 0
                  const minPrice = Math.max(0, currentPrice - 2000000) // -2M VND
                  const maxPrice = currentPrice + 2000000 // +2M VND
                  searchParams.set('minPrice', minPrice.toString())
                  searchParams.set('maxPrice', maxPrice.toString())
                  
                  router.push(`/search?${searchParams.toString()}`)
                }}
                className="text-blue-600 hover:text-blue-800"
              >
                Xem thêm
              </Button>
            </div>
            
            {/* Loading state for similar posts */}
            {featuredLoading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Đang tải tin đăng tương tự...</p>
              </div>
            )}

            {/* Error state for similar posts */}
            {featuredError && (
              <div className="text-center py-8">
                <p className="text-red-600">Không thể tải tin đăng tương tự</p>
              </div>
            )}

            {/* Similar posts content */}
            {!featuredLoading && !featuredError && getSimilarPosts().length > 0 && (
              <div className="relative">
                <Swiper
                  modules={[Navigation, Pagination]}
                  spaceBetween={16}
                  slidesPerView={1}
                  navigation={{
                    nextEl: '.swiper-button-next-similar',
                    prevEl: '.swiper-button-prev-similar',
                  }}
                  pagination={{ 
                    clickable: true,
                    dynamicBullets: true 
                  }}
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
                  className="similar-posts-swiper"
                >
                  {getSimilarPosts().map((room, index) => (
                    <SwiperSlide key={`${room.id}-${room.slug}-${index}`}>
                      <RoomCard
                        room={room}
                        isSaved={savedRooms.includes(room.id)}
                        onSaveToggle={toggleSaveRoom}
                        onClick={handleRoomClick}
                        className="!shadow-none"
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>

                {/* Custom Navigation Buttons */}
                <div className="swiper-button-prev-similar absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 hover:shadow-xl">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </div>
                <div className="swiper-button-next-similar absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 hover:shadow-xl">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            )}

            {/* No similar posts message */}
            {!featuredLoading && !featuredError && getSimilarPosts().length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-600">Không có tin đăng tương tự</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/search')}
                  className="mt-3"
                >
                  Tìm kiếm phòng trọ khác
                </Button>
              </div>
            )}
            </CardContent>
          </Card>
        </div>

        {/* Owner's Other Posts - TODO: Implement when API is available */}
        {/* 
        <div className="container mx-auto px-4 py-6">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4 text-center">
              Tin đăng khác của {roomDetail.owner.firstName} {roomDetail.owner.lastName}
            </h3>
            <div className="text-center py-8">
              <p className="text-gray-600">Tính năng đang được phát triển</p>
            </div>
          </div>
        </div>
        */}
      </div>
    </div>
  )
}
