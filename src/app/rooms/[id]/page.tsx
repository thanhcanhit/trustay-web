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
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getRoomTypeDisplayName } from "@/utils/room-types"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BreadcrumbNavigation } from "@/components/breadcrumb-navigation"
import { useBookingRequestStore } from "@/stores/bookingRequestStore"
import { useUserStore } from "@/stores/userStore"
import { toast } from "sonner"
import { MESSAGE_TYPES } from "@/constants/chat.constants"
import { useChatStore } from "@/stores/chat.store"
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import { RatingsList } from "@/components/rating"
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { HTMLContent } from '@/components/ui/html-content'

export default function PropertyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.id as string
  const [hasLoaded, setHasLoaded] = useState(false)
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [selectedInstanceId, setSelectedInstanceId] = useState<string>("")
  const [moveInDate, setMoveInDate] = useState<string>("")
  const [moveOutDate, setMoveOutDate] = useState<string>("")
  const [messageToOwner, setMessageToOwner] = useState<string>("")
  const { create, submitting, submitError, clearErrors, mine, loadMine } = useBookingRequestStore()
  const { user, isAuthenticated } = useUserStore()
  const { sendMessage: sendChatMessage, setCurrentUserId } = useChatStore()
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

  // Clear search results when component mounts or room id changes
  useEffect(() => {
    clearSearchResults()
  }, [roomId, clearSearchResults])

  // Load room detail from API using store - only once
  useEffect(() => {
    if (roomId && !hasLoaded) {
      loadRoomDetail(roomId);
      setHasLoaded(true);
    }
  }, [roomId, hasLoaded, loadRoomDetail])

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

  // Set current user ID in chat store when user is authenticated
  useEffect(() => {
    if (user?.id) {
      setCurrentUserId(user.id)
    }
  }, [user?.id, setCurrentUserId])

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

  // Get similar posts from API response or fallback to featured rooms
  const getSimilarPosts = (): RoomListing[] => {
    // First try to use similarRooms from API response
    if (roomDetail?.similarRooms && roomDetail.similarRooms.length > 0) {
      return roomDetail.similarRooms.slice(0, 8)
    }

    // Fallback: Combine featured rooms and search results, excluding current room
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

  const handleRoomClick = (id: string) => {
    // Navigate to room detail page using id
    router.push(`/rooms/${id}`)
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
    if (ok && roomDetail?.owner?.id) {
      try {
        console.log('🚀 Starting to send booking request notification message')
        console.log('📝 Message payload:', {
          recipientId: roomDetail.owner.id,
          content: messageToOwner || 'Tôi quan tâm đến phòng của bạn và muốn gửi yêu cầu thuê.',
          type: MESSAGE_TYPES.REQUEST
        })
        console.log('👤 Current user:', user)
        console.log('🏠 Room owner:', roomDetail.owner)

        // Send notification message to room owner using chat store
        await sendChatMessage({
          recipientId: roomDetail.owner.id,
          content: messageToOwner || 'Tôi quan tâm đến phòng của bạn và muốn gửi yêu cầu thuê.',
          type: MESSAGE_TYPES.REQUEST
        })

        console.log('✅ Message sent successfully via chat store')
      } catch (error) {
        console.error('❌ Failed to send notification message:', error)
        console.error('🔍 Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          roomOwnerId: roomDetail.owner.id,
          messageContent: messageToOwner || 'Tôi quan tâm đến phòng của bạn và muốn gửi yêu cầu thuê.',
          currentUser: user
        })

        // Show error to user so they know what happened
        toast.error('Không thể gửi tin nhắn thông báo, vui lòng thử lại sau')
      }

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

  // Generate breadcrumb items from API response or fallback to generated ones
  const generateBreadcrumbItems = () => {
    // First try to use breadcrumb from API response
    if (roomDetail?.breadcrumb?.items) {
      return roomDetail.breadcrumb.items.map(item => ({
        title: item.title,
        href: item.path === `/rooms/${roomDetail.id}` ? undefined : item.path
      }))
    }

    // Fallback: Generate breadcrumb items based on the room data
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
      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-2 sm:py-4 md:py-6">
        {/* Breadcrumb */}
        <div className="mb-2 sm:mb-4 md:mb-6 overflow-x-auto">
          <BreadcrumbNavigation items={generateBreadcrumbItems()} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-2 sm:space-y-3 md:space-y-4">
            {/* Image Gallery */}
            <div className="relative mb-2 sm:mb-3 md:mb-4">
              <ImageSwiper
                images={roomDetail.images || []}
                title={roomDetail.name}
                className="rounded-lg sm:rounded-xl md:rounded-2xl shadow-md sm:shadow-lg md:shadow-xl"
                isVerified={roomDetail.isVerified}
                imageContext="detail"
              />
              {/* Premium Badge */}
              {roomDetail.isVerified && (
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-2 py-1 sm:px-3 rounded-full text-xs sm:text-sm font-semibold shadow-lg flex items-center gap-1">
                  <Award className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">ĐÃ XÁC MINH</span>
                  <span className="xs:hidden">XÁC MINH</span>
                </div>
              )}
            </div>

            {/* Single Comprehensive Card */}
            <div className="relative">
              <Card className="shadow-md sm:shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-3 sm:p-4 md:p-6">
                  {/* Header Section */}
                  <div className="mb-3 sm:mb-4 md:mb-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-2 sm:mb-3 md:mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 md:gap-2 mb-2">
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-[10px] sm:text-xs md:text-sm px-1.5 sm:px-2 py-0.5">
                            {getRoomTypeDisplayName(roomDetail.roomType)}
                          </Badge>
                          <Badge variant="outline" className="text-green-600 border-green-200 text-[10px] sm:text-xs md:text-sm px-1.5 sm:px-2 py-0.5">
                            {roomDetail.areaSqm}m²
                          </Badge>
                          <Badge variant="outline" className="text-purple-600 border-purple-200 text-[10px] sm:text-xs md:text-sm px-1.5 sm:px-2 py-0.5">
                            {roomDetail.maxOccupancy} người
                          </Badge>
                          <Badge variant="outline" className="text-blue-600 border-purple-200 text-[10px] sm:text-xs md:text-sm px-1.5 sm:px-2 py-0.5">
                            Tầng {roomDetail.floorNumber}
                          </Badge>
                        </div>
                        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 md:mb-3 leading-tight break-words">
                          {roomDetail.name}
                        </h1>
                        <div className="flex flex-col gap-1.5 sm:gap-2 text-[11px] sm:text-xs md:text-sm text-gray-600 mb-2 sm:mb-3 md:mb-4">
                          <div className="flex items-start gap-1">
                            <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-gray-500 flex-shrink-0 mt-0.5" />
                            <span className="line-clamp-2">
                              {roomDetail.address}, {roomDetail.location.wardName}, {roomDetail.location.districtName}, {roomDetail.location.provinceName}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-gray-500 flex-shrink-0" />
                            <span className="text-[11px] sm:text-xs md:text-sm truncate">Đăng lúc: {formatDate(roomDetail.lastUpdated)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2 mt-2 md:mt-0 w-full md:w-auto">
                        <Button variant="outline" size="sm" className="text-gray-600 text-[11px] sm:text-xs md:text-sm flex-1 md:flex-initial h-8 sm:h-9">
                          <Heart className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 sm:mr-1" />
                          <span className="hidden sm:inline">Lưu</span>
                        </Button>
                        <Button variant="outline" size="sm" className="text-gray-600 text-[11px] sm:text-xs md:text-sm flex-1 md:flex-initial h-8 sm:h-9">
                          <Share2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 sm:mr-1" />
                          <span className="hidden sm:inline">Chia sẻ</span>
                        </Button>
                      </div>
                    </div>

                    {/* Price Display */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between p-2.5 sm:p-3 md:p-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-lg sm:rounded-xl border border-red-200 gap-2 sm:gap-3">
                      <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                        <div className="p-1.5 sm:p-2 md:p-3 bg-red-500 rounded-md sm:rounded-lg flex-shrink-0">
                          <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-[10px] sm:text-xs md:text-sm text-red-600 font-medium mb-0.5 sm:mb-1">Giá thuê</p>
                          <div className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-red-600 leading-tight">
                            {roomDetail.pricing?.basePriceMonthly ? formatPrice(parseInt(roomDetail.pricing.basePriceMonthly)) : 'Liên hệ'} VNĐ/tháng
                          </div>
                          {roomDetail.pricing?.utilityIncluded && (
                            <Badge className="mt-1 md:mt-2 bg-green-100 text-green-800 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5">
                              Bao gồm tiện ích
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-left md:text-right text-[11px] sm:text-xs md:text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3 md:h-4 md:w-4" />
                          <span>{roomDetail.viewCount || 0} lượt xem</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-200 my-3 md:my-6"></div>

                  {/* Room Information Section */}
                  <div className="mb-3 sm:mb-4 md:mb-6">
                    <h3 className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 md:mb-4">
                      <Home className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-blue-600" />
                      Thông tin dãy trọ
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                      <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 md:p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg sm:rounded-xl border border-blue-200">
                        <div className="p-1.5 sm:p-2 bg-blue-500 rounded-md sm:rounded-lg flex-shrink-0">
                          <Building className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm text-blue-600 font-medium">Tòa nhà</p>
                          <p className="font-semibold text-sm sm:text-base text-gray-900 truncate">{roomDetail.buildingName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 md:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                        <div className="p-1.5 sm:p-2 bg-gray-500 rounded-md sm:rounded-lg flex-shrink-0">
                          <Home className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm text-gray-600 font-medium">Chi tiết dãy trọ</p>
                          <p className="text-xs sm:text-sm text-gray-900 line-clamp-2 break-words overflow-hidden">
                            {roomDetail.buildingDescription || 'Không có thông tin'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-200 my-3 md:my-6"></div>

                  {/* Amenities Section */}
                  <div className="mb-4 md:mb-6">
                    <h3 className="flex items-center gap-2 text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">
                      <Home className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                      Tiện nghi
                    </h3>
                    <AmenitySelector
                      selectedAmenities={roomDetail.amenities.map((a: typeof roomDetail.amenities[number]) => a.id)}
                      onSelectionChange={() => {}} // Read-only
                      mode="display"
                    />
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-200 my-3 md:my-6"></div>

                  {/* Pricing & Costs Section */}
                  <div className="mb-4 md:mb-6">
                    <h3 className="flex items-center gap-2 text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">
                      <DollarSign className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                      Giá cả & Chi phí
                    </h3>
                    <div className="space-y-3">
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
                          <h4 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Chi phí phát sinh</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
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
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-200 my-6"></div>

                  {/* Rules Section */}
                  {roomDetail.rules && roomDetail.rules.length > 0 && (
                    <>
                      <div className="mb-6">
                        <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                          <AlertCircle className="h-5 w-5 text-red-600" />
                          Quy định
                        </h3>
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
                      </div>

                      {/* Divider */}
                      <div className="border-t border-gray-200 my-3 md:my-6"></div>
                    </>
                  )}

                  {/* Description Section */}
                  <div className="mb-4 md:mb-6">
                    <h3 className="flex items-center gap-2 text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">
                      <MessageCircle className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                      Mô tả chi tiết
                    </h3>
                    <div className={`${!isDescriptionExpanded ? 'line-clamp-3' : ''}`}>
                      <HTMLContent content={roomDetail.description} />
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
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-200 my-3 md:my-6"></div>
                </CardContent>
              </Card>

              {/* Overlay for unauthenticated users */}
              {!isAuthenticated && (
                <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center z-10 p-3 sm:p-4">
                  <div className="text-center p-4 sm:p-6 md:p-8 bg-white rounded-lg sm:rounded-xl shadow-lg border max-w-md w-full">
                    <div className="mb-4 sm:mb-6">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                        <svg className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                      Đăng nhập để xem thông tin chi tiết
                    </h3>
                    <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                      Vui lòng đăng nhập để xem đầy đủ thông tin về phòng trọ bao gồm tiện nghi, giá cả, quy định, mô tả chi tiết và vị trí cụ thể
                    </p>
                    <Button
                      onClick={() => {
                        const currentUrl = window.location.href
                        router.push(`/login?returnUrl=${encodeURIComponent(currentUrl)}`)
                      }}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 sm:py-3 text-sm sm:text-base md:text-lg font-semibold h-10 sm:h-11 md:h-12"
                      size="lg"
                    >
                      Đăng nhập ngay
                    </Button>
                    <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-500">
                      Chưa có tài khoản? <Link href="/register" className="text-green-600 hover:underline">Đăng ký ngay</Link>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-2 sm:space-y-3 md:space-y-4">
            {/* Owner Profile Section */}
            <Card className="shadow-md sm:shadow-lg md:shadow-xl border-0 mb-2 sm:mb-3 md:mb-4 bg-gradient-to-br from-white to-gray-50">
              <CardContent className="p-3 sm:p-4 md:p-6">
                {/* Owner Profile */}
                <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-2 sm:mb-3 md:mb-4">
                  <div className="relative flex-shrink-0">
                    <Avatar className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 lg:h-16 lg:w-16 ring-2 md:ring-3 lg:ring-4 ring-yellow-200">
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
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-base md:text-lg">
                          {(roomDetail.owner?.name?.charAt(0) || 'U').toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 bg-green-500 w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 rounded-full border-2 border-white flex items-center justify-center">
                      <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base md:text-lg mb-0.5 sm:mb-1 truncate">
                      {roomDetail.owner?.name || ''}
                    </h3>
                    <div className="flex items-center gap-1 sm:gap-2 mb-0.5 sm:mb-1 md:mb-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <span className="text-[10px] sm:text-xs md:text-sm text-gray-600">5.0</span>
                    </div>
                    <div className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs md:text-sm text-gray-500">
                      <Flag className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      <span>Việt Nam</span>
                    </div>
                    <div className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs md:text-sm text-green-600 mt-0.5 sm:mt-1">
                      <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full"></div>
                      <span className="truncate">Hoạt động 2 ngày trước</span>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-1.5 sm:space-y-2 mb-2 sm:mb-3 md:mb-4">
                  <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 p-1.5 sm:p-2 md:p-3 bg-gray-50 rounded-md sm:rounded-lg">
                    <Phone className="h-3 w-3 md:h-4 md:w-4 text-gray-600 flex-shrink-0" />
                    <span className="text-[10px] sm:text-xs md:text-sm text-gray-700 truncate flex-1">
                      <span className="hidden sm:inline">Điện thoại: </span>{roomDetail.owner?.phone || 'Chưa cập nhật'}
                    </span>
                    <div className="flex-shrink-0">
                      {roomDetail.owner?.verifiedPhone ? (
                        <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-3 w-3 md:h-4 md:w-4 text-red-500" />
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 p-1.5 sm:p-2 md:p-3 bg-gray-50 rounded-md sm:rounded-lg">
                    <Mail className="h-3 w-3 md:h-4 md:w-4 text-gray-600 flex-shrink-0" />
                    <span className="text-[10px] sm:text-xs md:text-sm text-gray-700 truncate flex-1">
                      <span className="hidden sm:inline">Email: </span>{roomDetail.owner?.email || 'Chưa cập nhật'}
                    </span>
                    <div className="flex-shrink-0">
                      {roomDetail.owner?.verifiedEmail ? (
                        <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-3 w-3 md:h-4 md:w-4 text-red-500" />
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
                <div className="grid grid-cols-2 gap-1.5 sm:gap-2 md:gap-4 mb-2 sm:mb-3 md:mb-4">
                  <div className="text-center p-2 sm:p-2.5 md:p-3 bg-blue-50 rounded-md sm:rounded-lg">
                    <div className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600">{roomDetail.owner?.totalBuildings || 0}</div>
                    <div className="text-[10px] sm:text-xs text-gray-600">Tòa nhà</div>
                  </div>
                  <div className="text-center p-2 sm:p-2.5 md:p-3 bg-green-50 rounded-md sm:rounded-lg">
                    <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">{roomDetail.owner?.totalRoomInstances || 0}</div>
                    <div className="text-[10px] sm:text-xs text-gray-600">Phòng</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-1.5 sm:gap-2 md:gap-3">
                  {/* Check if user is owner first */}
                  {user?.role === "landlord" ? (
                    <Button className="bg-gray-400 hover:bg-gray-500 text-white cursor-not-allowed text-[10px] sm:text-xs md:text-sm h-9 sm:h-10 md:h-11" size="lg">
                      <span className="hidden sm:inline">CT không thể thuê phòng</span>
                      <span className="sm:hidden">Không khả dụng</span>
                    </Button>
                  ) : hasExistingRequest ? (
                    <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white cursor-not-allowed text-[10px] sm:text-xs md:text-sm h-9 sm:h-10 md:h-11" size="lg">
                      <CalendarClock className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                      <span className="hidden sm:inline">
                        {existingRequestStatus === 'pending' && 'Đã gửi yêu cầu'}
                        {existingRequestStatus === 'approved' && 'Yêu cầu đã được chấp nhận'}
                        {existingRequestStatus === 'rejected' && 'Yêu cầu đã bị từ chối'}
                        {existingRequestStatus === 'cancelled' && 'Yêu cầu đã bị hủy'}
                      </span>
                      <span className="sm:hidden">
                        {existingRequestStatus === 'pending' && 'Đã gửi'}
                        {existingRequestStatus === 'approved' && 'Đã chấp nhận'}
                        {existingRequestStatus === 'rejected' && 'Đã từ chối'}
                        {existingRequestStatus === 'cancelled' && 'Đã hủy'}
                      </span>
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
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white cursor-pointer text-[10px] sm:text-xs md:text-sm h-9 sm:h-10 md:h-11"
                        size="lg"
                      >
                        <Send className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                        <span className="hidden xs:inline">Gửi yêu cầu thuê</span>
                        <span className="xs:hidden">Thuê ngay</span>
                      </Button>
                      <DialogContent className="w-[95vw] max-w-md mx-auto p-4 sm:p-6">
                      <DialogHeader>
                        <DialogTitle className="text-base sm:text-lg">Tạo yêu cầu thuê</DialogTitle>
                        <DialogDescription className="text-xs sm:text-sm">Chọn phòng cụ thể và ngày vào ở</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-3 sm:space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                          <div className="space-y-1.5 sm:space-y-2">
                            <Label className="text-xs sm:text-sm">Ngày vào ở</Label>
                            <Input type="date" value={moveInDate} onChange={(event) => setMoveInDate(event.target.value)} className="text-xs sm:text-sm h-9 sm:h-10" />
                          </div>
                          <div className="space-y-1.5 sm:space-y-2">
                            <Label className="text-xs sm:text-sm">Ngày rời đi (tuỳ chọn)</Label>
                            <Input type="date" value={moveOutDate} onChange={(event) => setMoveOutDate(event.target.value)} className="text-xs sm:text-sm h-9 sm:h-10" />
                          </div>
                        </div>
                        <div className="space-y-1.5 sm:space-y-2">
                          <Label className="text-xs sm:text-sm">Lời nhắn cho chủ trọ (tuỳ chọn)</Label>
                          <Textarea placeholder="Ví dụ: Em quan tâm phòng, có thể xem phòng tối nay không?" value={messageToOwner} onChange={(event) => setMessageToOwner(event.target.value)} className="min-h-[60px] sm:min-h-[80px] text-xs sm:text-sm" />
                        </div>
                      </div>
                      <DialogFooter className="gap-2 sm:gap-0">
                        <Button onClick={handleSubmitBooking} disabled={submitting} className="text-xs sm:text-sm h-9 sm:h-10 w-full sm:w-auto">
                          {submitting ? <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-spin" /> : <Send className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />}
                          Gửi yêu cầu
                        </Button>
                      </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}

                  <Button
                    variant="outline"
                    className="border-gray-300 hover:bg-gray-50 cursor-pointer text-[10px] sm:text-xs md:text-sm h-9 sm:h-10 md:h-11"
                    size="lg"
                    onClick={() => toast.info('Tính năng trò chuyện sẽ sớm ra mắt')}
                  >
                    <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                    <span className="hidden xs:inline">Trò chuyện ngay</span>
                    <span className="xs:hidden">Chat</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Reviews Section - Using RatingsList Component */}
            {roomDetail?.id && (
              <div className="sticky top-6">
                <RatingsList
                  targetType="room"
                  targetId={roomDetail.id}
                  showStats={true}
                  initialParams={{
                    limit: 5,
                    sortBy: 'createdAt',
                    sortOrder: 'desc'
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Similar Posts - Centered Below Main Content */}
        <div className="container mx-auto py-2 sm:py-3 md:py-6">
          <Card className="shadow-md sm:shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="p-2.5 sm:p-3 md:p-6">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base md:text-xl">
                  <Home className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-blue-600" />
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
                  className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm h-8 sm:h-9"
                >
                  Xem thêm
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-2 sm:p-3 md:p-6">
            
              {/* Loading state for similar posts */}
              {featuredLoading && (
                <div className="text-center py-8 sm:py-10 md:py-12">
                  <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin mx-auto text-blue-600" />
                  <p className="text-gray-600 mt-2 text-xs sm:text-sm md:text-base">Đang tải tin đăng tương tự...</p>
                </div>
              )}

              {/* Error state for similar posts */}
              {featuredError && (
                <div className="text-center py-8 sm:py-10 md:py-12">
                  <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 text-red-400 mx-auto mb-3 sm:mb-4" />
                  <p className="text-red-600 text-sm sm:text-base md:text-lg">Không thể tải tin đăng tương tự</p>
                </div>
              )}

              {/* Similar posts content */}
              {!featuredLoading && !featuredError && getSimilarPosts().length > 0 && (
                <div className="relative">
                  <Swiper
                    modules={[Navigation, Pagination]}
                    spaceBetween={8}
                    slidesPerView={1.2}
                    slidesPerGroup={1}
                    freeMode={true}
                    grabCursor={true}
                    navigation={{
                      nextEl: '.swiper-button-next-similar',
                      prevEl: '.swiper-button-prev-similar',
                    }}
                    pagination={{
                      clickable: true,
                      dynamicBullets: true
                    }}
                    breakpoints={{
                      480: {
                        slidesPerView: 1.5,
                        spaceBetween: 10,
                        freeMode: true,
                      },
                      640: {
                        slidesPerView: 2,
                        spaceBetween: 12,
                        freeMode: false,
                      },
                      768: {
                        slidesPerView: 3,
                        spaceBetween: 16,
                        freeMode: false,
                      },
                      1024: {
                        slidesPerView: 4,
                        spaceBetween: 20,
                        freeMode: false,
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
                          className="!shadow-md sm:!shadow-lg hover:shadow-xl transition-shadow duration-300 mb-1 sm:mb-2"
                        />
                      </SwiperSlide>
                    ))}
                  </Swiper>

                  {/* Custom Navigation Buttons */}
                  <div className="swiper-button-prev-similar hidden lg:flex absolute -left-4 xl:-left-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 xl:w-12 xl:h-12 bg-white rounded-full shadow-xl border border-gray-200 items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 hover:shadow-2xl">
                    <svg className="w-5 h-5 xl:w-6 xl:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </div>
                  <div className="swiper-button-next-similar hidden lg:flex absolute -right-4 xl:-right-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 xl:w-12 xl:h-12 bg-white rounded-full shadow-xl border border-gray-200 items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 hover:shadow-2xl">
                    <svg className="w-5 h-5 xl:w-6 xl:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              )}

              {/* No similar posts message */}
              {!featuredLoading && !featuredError && getSimilarPosts().length === 0 && (
                <div className="text-center py-8 sm:py-10 md:py-12">
                  <Home className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
                  <p className="text-gray-600 text-sm sm:text-base md:text-lg mb-3 sm:mb-4">Không có tin đăng tương tự</p>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/rooms')}
                    className="hover:bg-blue-50 text-xs sm:text-sm h-9 sm:h-10"
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
