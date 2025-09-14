"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { MapPin, Loader2, ChevronDown, ChevronUp, Calendar, Home, Building, CheckCircle, XCircle, AlertCircle, DollarSign, Zap, Droplets, Send, MessageCircle, CalendarClock, Phone, Mail, Star, Globe, Award, TrendingUp, Heart, Share2, Flag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { SizingImage } from "@/components/sizing-image"
import type { RoomListing } from "@/types/types"
import { useRoomStore } from "@/stores/roomStore"
import { AmenitySelector } from "@/components/ui/amenity-selector"
import { ImageSwiper } from "@/components/ui/image-swiper"
import { RoomCard } from "@/components/ui/room-card"
import { StarRating, StarRatingDisplay } from "@/components/ui/star-rating"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getRoomTypeDisplayName } from "@/utils/room-types"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { BreadcrumbNavigation } from "@/components/breadcrumb-navigation"
import { useBookingRequestStore } from "@/stores/bookingRequestStore"
import { useUserStore } from "@/stores/userStore"
import { toast } from "sonner"
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

export default function PropertyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const roomSlug = params.slug as string
  const [hasLoaded, setHasLoaded] = useState(false)
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  const [userRating, setUserRating] = useState(0)
  const [userReview, setUserReview] = useState("")
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [selectedInstanceId, setSelectedInstanceId] = useState<string>("")
  const [moveInDate, setMoveInDate] = useState<string>("")
  const [moveOutDate, setMoveOutDate] = useState<string>("")
  const [messageToOwner, setMessageToOwner] = useState<string>("")
  const { create, submitting, submitError, clearErrors, mine, loadMine } = useBookingRequestStore()
  const { user, isAuthenticated } = useUserStore()
  const [hasExistingRequest, setHasExistingRequest] = useState<boolean>(false)
  const [existingRequestStatus, setExistingRequestStatus] = useState<string | null>(null)

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

  // Load user's booking requests to check for existing requests
  useEffect(() => {
    loadMine()
  }, [loadMine])

  // Check if user has existing booking request for this room
  useEffect(() => {
    if (roomDetail?.id && mine.length >= 0) {
      const existingRequest = mine.find(request => {
        // Check direct roomId comparison based on API response structure
        const roomMatches = request.roomId === roomDetail.id
        // Check for any status except cancelled
        const statusMatches = request.status !== 'cancelled'
        
        return roomMatches && statusMatches
      })
      
      setHasExistingRequest(!!existingRequest)
      setExistingRequestStatus(existingRequest?.status || null)
    }
  }, [roomDetail?.id, mine])

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
  const getSimilarPosts = (): RoomListing[] => {
    // Combine featured rooms and search results, excluding current room
    const allRooms = [...featuredRooms, ...searchResults]
    
    // Remove duplicates by ID and exclude current room
    const uniqueRooms = allRooms.reduce((acc, room) => {
      if (room.id !== roomDetail?.id && !acc.find((r: RoomListing) => r.id === room.id)) {
        acc.push(room)
      }
      return acc
    }, [] as RoomListing[])
    
    return uniqueRooms.slice(0, 8) // Limit to 8 similar posts
  }

  const handleRoomClick = (slug: string) => {
    // Navigate to room detail page using slug
    router.push(`/rooms/${slug}`)
  }

  const handleRentalRequestClick = () => {
    if (!isAuthenticated) {
      // Store current URL to return after login
      const currentUrl = window.location.href
      // Redirect to login with return URL
      router.push(`/login?returnUrl=${encodeURIComponent(currentUrl)}`)
      return
    }

    // Debug owner validation
    console.log('Current user:', user)
    console.log('Current user ID:', user?.id)
    console.log('Room owner:', roomDetail?.owner)
    console.log('Room owner ID:', roomDetail?.owner?.id)
    console.log('IDs match?', user?.id === roomDetail?.owner?.id)
    console.log('User ID type:', typeof user?.id)
    console.log('Owner ID type:', typeof roomDetail?.owner?.id)

    // Check if user is the owner of the room - compare emails
    if (user && roomDetail?.owner?.email && user.email === roomDetail.owner.email) {
      toast.error('Bạn không thể gửi yêu cầu thuê phòng của chính mình')
      return
    }

    openBookingDialog()
  }

  const openBookingDialog = async () => {
    if (!roomDetail?.id) return
    // API now requires roomId, not roomInstanceId; use the current room's id directly.
    setSelectedInstanceId(roomDetail.id)
    setIsBookingOpen(true)
  }

  const handleSubmitBooking = async () => {
    if (!selectedInstanceId) {
      toast.error('Không xác định được phòng')
      return
    }
    if (!moveInDate) {
      toast.error('Vui lòng chọn ngày vào ở')
      return
    }
    const ok = await create({
      roomId: selectedInstanceId,
      moveInDate,
      moveOutDate: moveOutDate || undefined,
      messageToOwner: messageToOwner || undefined,
    })
    if (ok) {
      toast.success('Đã gửi yêu cầu thuê')
      setIsBookingOpen(false)
      setMessageToOwner("")
      setMoveInDate("")
      setMoveOutDate("")
    } else if (submitError) {
      toast.error(submitError)
    } else {
      toast.error('Gửi yêu cầu thất bại')
    }
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

  // Generate breadcrumb items based on the room data
  const generateBreadcrumbItems = () => {
    const items: Array<{ title: string; href?: string }> = [
      { title: "Tìm kiếm phòng", href: "/rooms" }
    ]

    if (roomDetail) {
      // Add location-based breadcrumbs
      if (roomDetail.location.wardName && roomDetail.location.wardId) {
        items.push({ title: roomDetail.location.wardName, href: `/rooms?wardId=${roomDetail.location.wardId}` })
      }
      if (roomDetail.location.districtName && roomDetail.location.districtId) {
        items.push({ title: roomDetail.location.districtName, href: `/rooms?districtId=${roomDetail.location.districtId}` })
      }
      if (roomDetail.location.provinceName && roomDetail.location.provinceId) {
        items.push({ title: roomDetail.location.provinceName, href: `/rooms?provinceId=${roomDetail.location.provinceId}` })
      }

      // Add room type breadcrumb
      if (roomDetail.roomType) {
        items.push({ title: getRoomTypeDisplayName(roomDetail.roomType), href: `/rooms?roomType=${roomDetail.roomType}` })
      }

      // Add current room name as final breadcrumb (no href = current page)
      items.push({ title: roomDetail.name })
    }

    return items
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="mb-6">
          <BreadcrumbNavigation items={generateBreadcrumbItems()} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-1">
            {/* Image Gallery */}
            <div className="relative">
              <ImageSwiper
                images={roomDetail.images || []}
                title={roomDetail.name}
                className="rounded-2xl shadow-xl"
                isVerified={roomDetail.isVerified}
                imageContext="detail"
              />
              {/* Premium Badge */}
              {roomDetail.isVerified && (
                <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg flex items-center gap-1">
                  <Award className="h-4 w-4" />
                  ĐÃ XÁC MINH
                </div>
              )}
            </div>

            {/* Room Header */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2 leading-tight">
                      {roomDetail.name}
                    </h1>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        {getRoomTypeDisplayName(roomDetail.roomType)}
                      </Badge>
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        {roomDetail.areaSqm}m²
                      </Badge>
                      <Badge variant="outline" className="text-purple-600 border-purple-200">
                        {roomDetail.maxOccupancy} người
                      </Badge>
                      <Badge variant="outline" className="text-blue-600 border-purple-200">
                        Tầng {roomDetail.floorNumber}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="text-gray-600">
                      <Heart className="h-4 w-4 mr-1" />
                      Lưu
                    </Button>
                    <Button variant="outline" size="sm" className="text-gray-600">
                      <Share2 className="h-4 w-4 mr-1" />
                      Chia sẻ
                    </Button>
                  </div>
                </div>
              
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl font-bold text-red-600">
                      {roomDetail.pricing?.basePriceMonthly ? formatPrice(parseInt(roomDetail.pricing.basePriceMonthly)) : 'Liên hệ'} VNĐ/tháng
                    </div>
                    {roomDetail.pricing?.utilityIncluded && (
                      <Badge className="bg-green-100 text-green-800">
                        Bao gồm tiện ích
                      </Badge>
                    )}
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      <span>0 lượt xem</span>
                    </div>
                  </div>
                </div>
              
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>
                      {roomDetail.address}, {roomDetail.location.wardName}, {roomDetail.location.districtName}, {roomDetail.location.provinceName}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>Đăng lúc: {formatDate(roomDetail.lastUpdated)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Room Information */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Home className="h-5 w-5 text-blue-600" />
                  Thông tin dãy trọ
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Basic Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <Building className="h-5 w-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-blue-600 font-medium">Tòa nhà</p>
                      <p className="font-semibold text-gray-900 truncate">{roomDetail.buildingName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <div className="p-2 bg-gray-500 rounded-lg">
                      <Home className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Chi tiết dãy trọ</p>
                      <p className="text-sm text-gray-900">
                        {getRoomTypeDisplayName(roomDetail.buildingDescription)}
                      </p>
                    </div>
                  </div>

                  {/* <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                    <div className="p-2 bg-green-500 rounded-lg">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-green-600 font-medium">Sức chứa</p>
                      <p className="font-semibold text-gray-900">{roomDetail.maxOccupancy} người</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                    <div className="p-2 bg-purple-500 rounded-lg">
                      <Square className="h-5 w-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-purple-600 font-medium">Diện tích</p>
                      <p className="font-semibold text-gray-900">{roomDetail.areaSqm} m²</p>
                    </div>
                  </div> */}

                  {/* <div className={`flex items-center gap-3 p-4 rounded-xl border ${
                    roomDetail.isVerified 
                      ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200' 
                      : 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200'
                  }`}>
                    <div className={`p-2 rounded-lg ${
                      roomDetail.isVerified ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}>
                      {roomDetail.isVerified ? (
                        <CheckCircle className="h-5 w-5 text-white" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-white" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-medium ${
                        roomDetail.isVerified ? 'text-emerald-600' : 'text-amber-600'
                      }`}>Trạng thái</p>
                      <p className={`font-semibold ${
                        roomDetail.isVerified ? 'text-emerald-700' : 'text-amber-700'
                      }`}>
                        {roomDetail.isVerified ? 'Đã xác minh' : 'Chưa xác minh'}
                      </p>
                    </div>
                  </div> */}
                </div>
              </CardContent>
            </Card>

            {/* Amenities - Restricted for unauthenticated users */}
            <div className="relative">
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Home className="h-5 w-5 text-blue-600" />
                    Tiện nghi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AmenitySelector
                    selectedAmenities={roomDetail.amenities.map((a: typeof roomDetail.amenities[number]) => a.id)}
                    onSelectionChange={() => {}} // Read-only
                    mode="display"
                  />
                </CardContent>
              </Card>

              {/* Overlay for unauthenticated users */}
              {!isAuthenticated && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <div className="text-center p-6">
                    <div className="mb-4">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Đăng nhập để xem thông tin chi tiết
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Vui lòng đăng nhập để xem đầy đủ thông tin về phòng trọ này
                    </p>
                    <Button
                      onClick={() => {
                        const currentUrl = window.location.href
                        router.push(`/login?returnUrl=${encodeURIComponent(currentUrl)}`)
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      Đăng nhập ngay
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Pricing & Costs - Restricted for unauthenticated users */}
            <div className="relative">
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    Giá cả & Chi phí
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                {/* Main Pricing */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Giá thuê cơ bản</h4>
                      <div className="text-3xl font-bold text-green-600">
                        {roomDetail.pricing?.basePriceMonthly ? formatPrice(parseInt(roomDetail.pricing.basePriceMonthly)) : 'Liên hệ'} VNĐ/tháng
                      </div>
                      {roomDetail.pricing?.utilityIncluded && (
                        <Badge className="mt-2 bg-green-100 text-green-800">
                          Bao gồm tiện ích
                        </Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600 mb-1">Tiền cọc</div>
                      <div className="text-xl font-semibold text-gray-900">
                        {roomDetail.pricing?.depositAmount ? formatPrice(parseInt(roomDetail.pricing.depositAmount)) : 'Liên hệ'} VNĐ
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Costs */}
                {roomDetail.costs && roomDetail.costs.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Chi phí phát sinh</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {roomDetail.costs.map((cost: typeof roomDetail.costs[number]) => {
                        const isElectricity = cost.name.toLowerCase().includes('điện')
                        const isWater = cost.name.toLowerCase().includes('nước')
                        const isInternet = cost.name.toLowerCase().includes('internet')
                        const isParking = cost.name.toLowerCase().includes('xe') || cost.name.toLowerCase().includes('gửi')
                        
                        return (
                          <div key={cost.id} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <div className={`p-2 rounded-lg ${
                              isElectricity ? 'bg-yellow-500' :
                              isWater ? 'bg-blue-500' :
                              isInternet ? 'bg-purple-500' :
                              isParking ? 'bg-orange-500' :
                              'bg-gray-500'
                            }`}>
                              {isElectricity ? (
                                <Zap className="h-4 w-4 text-white" />
                              ) : isWater ? (
                                <Droplets className="h-4 w-4 text-white" />
                              ) : isInternet ? (
                                <Globe className="h-4 w-4 text-white" />
                              ) : isParking ? (
                                <Building className="h-4 w-4 text-white" />
                              ) : (
                                <DollarSign className="h-4 w-4 text-white" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{cost.name}</p>
                              <p className="text-sm text-gray-600">{cost.category}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-green-600">
                                {new Intl.NumberFormat('vi-VN').format(parseInt(cost.value))}đ
                              </p>
                              <p className="text-xs text-gray-500">/tháng</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
              </Card>

              {/* Overlay for unauthenticated users */}
              {!isAuthenticated && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <div className="text-center p-6">
                    <div className="mb-4">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Đăng nhập để xem thông tin chi tiết
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Vui lòng đăng nhập để xem đầy đủ thông tin về phòng trọ này
                    </p>
                    <Button
                      onClick={() => {
                        const currentUrl = window.location.href
                        router.push(`/login?returnUrl=${encodeURIComponent(currentUrl)}`)
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      Đăng nhập ngay
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Remaining sections - Restricted for unauthenticated users */}
            <div className="relative space-y-1">
              {/* Rules */}
              {roomDetail.rules && roomDetail.rules.length > 0 && (
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      Quy định
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-3">
                      {roomDetail.rules.map((rule: typeof roomDetail.rules[number]) => {
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
                          <div
                            key={rule.id}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border ${getRuleStyle(rule.type)}`}
                          >
                            {rule.type === 'required' && <CheckCircle className="h-4 w-4" />}
                            {rule.type === 'forbidden' && <XCircle className="h-4 w-4" />}
                            {rule.type === 'allowed' && <CheckCircle className="h-4 w-4" />}
                            {rule.type !== 'required' && rule.type !== 'forbidden' && rule.type !== 'allowed' && <AlertCircle className="h-4 w-4" />}
                            {rule.name}
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Description */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <MessageCircle className="h-5 w-5 text-blue-600" />
                    Mô tả chi tiết
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-gray-700 whitespace-pre-line leading-relaxed ${!isDescriptionExpanded ? 'line-clamp-3' : ''}`}>
                    {roomDetail.description}
                  </div>
                  {roomDetail.description.length > 150 && (
                    <button
                      onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                      className="mt-4 text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium transition-colors"
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

              {/* Location */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <MapPin className="h-5 w-5 text-red-600" />
                    Vị trí
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="w-full h-80 bg-gray-200 rounded-xl overflow-hidden shadow-inner">
                    {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
                      <iframe
                        width="100%"
                        height="100%"
                        className="rounded-xl border-0"
                        src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(
                          `${roomDetail.address}, ${roomDetail.location.wardName}, ${roomDetail.location.districtName}, ${roomDetail.location.provinceName}`
                        )}&zoom=16`}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Vị trí phòng trọ"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 rounded-xl">
                        <MapPin className="h-16 w-16 text-gray-400 mb-4" />
                        <p className="text-gray-500 text-center">
                          Bản đồ chưa được cấu hình
                          <br />
                          <span className="text-sm">Vui lòng thêm Google Maps API key</span>
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-xl">
                    <MapPin className="h-5 w-5 text-gray-500" />
                    <span className="text-gray-700 font-medium">
                      {roomDetail.address}, {roomDetail.location.wardName}, {roomDetail.location.districtName}, {roomDetail.location.provinceName}
                    </span>
                  </div>

                  {/* Map Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        const address = `${roomDetail.address}, ${roomDetail.location.wardName}, ${roomDetail.location.districtName}, ${roomDetail.location.provinceName}`
                        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
                        window.open(googleMapsUrl, '_blank')
                      }}
                      className="flex-1"
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      Mở Google Maps
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        const address = `${roomDetail.address}, ${roomDetail.location.wardName}, ${roomDetail.location.districtName}, ${roomDetail.location.provinceName}`
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
                      className="flex-1"
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Apple Maps
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Overlay for unauthenticated users */}
              {!isAuthenticated && (
                <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
                  <div className="text-center p-8 bg-white rounded-xl shadow-lg border max-w-md">
                    <div className="mb-6">
                      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      Đăng nhập để xem thông tin chi tiết
                    </h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      Vui lòng đăng nhập để xem đầy đủ thông tin về phòng trọ bao gồm quy định, mô tả chi tiết và vị trí cụ thể
                    </p>
                    <Button
                      onClick={() => {
                        const currentUrl = window.location.href
                        router.push(`/login?returnUrl=${encodeURIComponent(currentUrl)}`)
                      }}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold"
                      size="lg"
                    >
                      Đăng nhập ngay
                    </Button>
                    <p className="mt-4 text-sm text-gray-500">
                      Chưa có tài khoản? <Link href="/register" className="text-green-600 hover:underline">Đăng ký ngay</Link>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-1">
            {/* Owner Profile Section */}
            <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50">
              <CardContent className="">
                {/* Owner Profile */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    <Avatar className="h-16 w-16 ring-4 ring-yellow-200">
                      {roomDetail.owner?.avatarUrl && roomDetail.owner.avatarUrl.trim() !== '' ? (
                        <div className="w-full h-full relative">
                          <SizingImage 
                            src={roomDetail.owner.avatarUrl} 
                            srcSize="128x128" 
                            alt={`${roomDetail.owner.name || 'Owner'}`}
                            className="object-cover rounded-full"
                            fill
                          />
                        </div>
                      ) : (
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-lg">
                          {(roomDetail.owner?.name?.charAt(0) || 'U').toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg mb-1">
                      {roomDetail.owner?.name || ''}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">5.0</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Flag className="h-3 w-3" />
                      <span>Việt Nam</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Hoạt động 2 ngày trước</span>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Phone className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Điện thoại: {roomDetail.owner?.phone || 'Chưa cập nhật'}</span>
                    <div className="ml-auto">
                      {roomDetail.owner?.verifiedPhone ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Email: {roomDetail.owner?.email || 'Chưa cập nhật'}</span>
                    <div className="ml-auto">
                      {roomDetail.owner?.verifiedEmail ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Verification Details Overlay */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-green-600 text-sm mb-3">Chi tiết xác minh</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-gray-700">Xác minh giấy tờ kinh doanh</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {roomDetail.owner?.verifiedEmail ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-sm text-gray-700">Xác minh email công việc</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {roomDetail.owner?.verifiedPhone ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-sm text-gray-700">Xác minh số điện thoại</span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{roomDetail.owner?.totalBuildings || 0}</div>
                    <div className="text-xs text-gray-600">Tòa nhà</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{roomDetail.owner?.totalRoomInstances || 0}</div>
                    <div className="text-xs text-gray-600">Phòng</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Check if user is owner first */}
                  {user && roomDetail?.owner?.email && user.email === roomDetail.owner.email ? (
                    <Button className="bg-gray-400 hover:bg-gray-500 text-white cursor-not-allowed" size="lg" disabled>
                      <Home className="h-4 w-4 mr-2" />
                      Đây là phòng của bạn
                    </Button>
                  ) : hasExistingRequest ? (
                    <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white" size="lg" disabled>
                      <CalendarClock className="h-4 w-4 mr-2" />
                      {existingRequestStatus === 'pending' && 'Đã gửi yêu cầu'}
                      {existingRequestStatus === 'approved' && 'Yêu cầu đã được chấp nhận'}
                      {existingRequestStatus === 'rejected' && 'Yêu cầu đã bị từ chối'}
                      {existingRequestStatus === 'cancelled' && 'Yêu cầu đã bị hủy'}
                    </Button>
                  ) : (
                    <Dialog open={isBookingOpen} onOpenChange={(open) => {
                      setIsBookingOpen(open)
                      if (!open) {
                        clearErrors()
                      }
                    }}>
                      <Button
                        onClick={handleRentalRequestClick}
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                        size="lg"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Gửi yêu cầu thuê
                      </Button>
                      <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Tạo yêu cầu thuê</DialogTitle>
                        <DialogDescription>Chọn phòng cụ thể và ngày vào ở</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label>Ngày vào ở</Label>
                            <Input type="date" value={moveInDate} onChange={(event) => setMoveInDate(event.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label>Ngày rời đi (tuỳ chọn)</Label>
                            <Input type="date" value={moveOutDate} onChange={(event) => setMoveOutDate(event.target.value)} />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Lời nhắn cho chủ trọ (tuỳ chọn)</Label>
                          <Textarea placeholder="Ví dụ: Em quan tâm phòng, có thể xem phòng tối nay không?" value={messageToOwner} onChange={(event) => setMessageToOwner(event.target.value)} className="min-h-[80px]" />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleSubmitBooking} disabled={submitting}>
                          {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                          Gửi yêu cầu
                        </Button>
                      </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}

                  <Button 
                    variant="outline"
                    className="border-gray-300 hover:bg-gray-50"
                    size="lg"
                    onClick={() => toast.info('Tính năng trò chuyện sẽ sớm ra mắt')}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Trò chuyện ngay
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Reviews Section - Sticky */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Đánh giá ({mockReviews.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Average Rating */}
                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <StarRatingDisplay rating={averageRating} size="lg" />
                    <span className="text-2xl font-bold text-gray-900">
                      {averageRating.toFixed(1)}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Dựa trên {mockReviews.length} đánh giá</div>
                  </div>
                </div>

                {/* Review Form */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Đánh giá của bạn
                    </label>
                    <StarRating
                      rating={userRating}
                      interactive={true}
                      onRatingChange={setUserRating}
                      size="lg"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Nhận xét
                    </label>
                    <Textarea
                      placeholder="Chia sẻ trải nghiệm của bạn về phòng trọ này..."
                      value={userReview}
                      onChange={(event) => setUserReview(event.target.value)}
                      className="min-h-[80px] resize-none"
                    />
                  </div>
                  <Button
                    onClick={handleSubmitReview}
                    disabled={isSubmittingReview || userRating === 0}
                    className="w-full"
                  >
                    {isSubmittingReview ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Đang gửi...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Gửi đánh giá
                      </>
                    )}
                  </Button>
                </div>

                <Separator />

                {/* Reviews List */}
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {mockReviews.map((review) => (
                    <div key={review.id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                      <Avatar className="h-10 w-10 flex-shrink-0">
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
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            {review.userName.charAt(0)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h5 className="font-medium text-gray-900">
                            {review.userName}
                          </h5>
                          {review.isVerified && (
                            <Badge variant="secondary" className="text-xs">
                              ✓ Đã xác minh
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <StarRatingDisplay rating={review.rating} size="sm" />
                          <span className="text-sm text-gray-500">
                            {new Date(review.date).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {review.comment}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Similar Posts - Centered Below Main Content */}
        <div className="container mx-auto py-6">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Home className="h-5 w-5 text-blue-600" />
                  Tin đăng tương tự
                </CardTitle>
                <Button
                  variant="outline"
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
                    
                    router.push(`/rooms?${searchParams.toString()}`)
                  }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Xem thêm
                </Button>
              </div>
            </CardHeader>
            <CardContent>
            
              {/* Loading state for similar posts */}
              {featuredLoading && (
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
                  <p className="text-gray-600 mt-2">Đang tải tin đăng tương tự...</p>
                </div>
              )}

              {/* Error state for similar posts */}
              {featuredError && (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                  <p className="text-red-600 text-lg">Không thể tải tin đăng tương tự</p>
                </div>
              )}

              {/* Similar posts content */}
              {!featuredLoading && !featuredError && getSimilarPosts().length > 0 && (
                <div className="relative">
                  <Swiper
                    modules={[Navigation, Pagination]}
                    spaceBetween={20}
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
                    {getSimilarPosts().map((room: RoomListing, index: number) => (
                      <SwiperSlide key={`${room.id}-${room.slug}-${index}`}>
                        <RoomCard
                          room={room}
                          isSaved={savedRooms.includes(room.id)}
                          onSaveToggle={toggleSaveRoom}
                          onClick={handleRoomClick}
                          className="!shadow-lg hover:shadow-xl transition-shadow duration-300"
                        />
                      </SwiperSlide>
                    ))}
                  </Swiper>

                  {/* Custom Navigation Buttons */}
                  <div className="swiper-button-prev-similar absolute -left-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-xl border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 hover:shadow-2xl">
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </div>
                  <div className="swiper-button-next-similar absolute -right-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-xl border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 hover:shadow-2xl">
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              )}

              {/* No similar posts message */}
              {!featuredLoading && !featuredError && getSimilarPosts().length === 0 && (
                <div className="text-center py-12">
                  <Home className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg mb-4">Không có tin đăng tương tự</p>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/rooms')}
                    className="hover:bg-blue-50"
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
