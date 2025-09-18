"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Loader2, Calendar, MapPin, Users, DollarSign, Info, ChevronDown, ChevronUp, CheckCircle, XCircle, Home, Star, Globe, TrendingUp, Heart, Share2, Flag, Mail, MessageCircle, Phone, Send } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { SizingImage } from '@/components/sizing-image'
import { Badge } from '@/components/ui/badge'
import { BreadcrumbNavigation } from '@/components/breadcrumb-navigation'
import { useRoomSeekingStore } from '@/stores/roomSeekingStore'
import { useInvitationStore } from '@/stores/invitationStore'
import { useUserStore } from '@/stores/userStore'
import { useBuildingStore } from '@/stores/buildingStore'
import { STATUS_LABELS, type RoomSeekingPost } from '@/types/room-seeking'
import { AmenitySelector } from '@/components/ui/amenity-selector'
import { RoomSeekingCard } from '@/components/ui/room-seeking-card'
import { getRoomTypeDisplayName } from '@/utils/room-types'
import { toast } from 'sonner'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function RoomSeekingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = String(params?.id)
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [isInvitationOpen, setIsInvitationOpen] = useState(false)
  const [availableFrom, setAvailableFrom] = useState('')
  const [availableUntil, setAvailableUntil] = useState('')
  const [invitationMessage, setInvitationMessage] = useState('')
  const [proposedRent, setProposedRent] = useState('')
  const [selectedBuildingId, setSelectedBuildingId] = useState('')
  const [selectedRoomId, setSelectedRoomId] = useState('')

  const { 
    currentPost, 
    postLoading, 
    postError, 
    loadPostDetail, 
    clearCurrentPost,
    publicPosts,
    loadPublicPosts
  } = useRoomSeekingStore()
  
  const {
    create: createInvitation,
    submitting: invitationSubmitting,
    submitError: invitationError,
    clearErrors: clearInvitationErrors
  } = useInvitationStore()
  
  const { user } = useUserStore()
  const { 
    buildings, 
    buildingRooms, 
    fetchAllBuildings,
    isLoading: buildingsLoading 
  } = useBuildingStore()

  // Load room seeking detail from API using store - only once
  useEffect(() => {
    if (id && !hasLoaded) {
      loadPostDetail(id)
      setHasLoaded(true)
    }
    return () => clearCurrentPost()
  }, [id, hasLoaded, loadPostDetail, clearCurrentPost])

  // Load similar room seeking posts
  useEffect(() => {
    if (currentPost && publicPosts.length === 0) {
      // Load similar posts based on location and room type
      const searchParams = {
        preferredProvinceId: currentPost.preferredProvinceId,
        preferredDistrictId: currentPost.preferredDistrictId,
        preferredRoomType: currentPost.preferredRoomType,
        limit: 8
      }
      loadPublicPosts(searchParams)
    }
  }, [currentPost, publicPosts.length, loadPublicPosts])

  const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN').format(value)
  
  const handleCreateInvitation = async () => {
    // Get the requester (tenant) from the current post
    if (!currentPost) {
      toast.error('Không tìm thấy thông tin bài đăng')
      return
    }
    
    const requester = (currentPost as unknown as { requester?: { id?: string } }).requester
    if (!requester?.id || !selectedRoomId) {
      toast.error('Vui lòng chọn phòng để gửi lời mời')
      return
    }
    
    const invitationData = {
      roomId: selectedRoomId,
      tenantId: requester.id,
      availableFrom: availableFrom || undefined,
      availableUntil: availableUntil || undefined,
      invitationMessage: invitationMessage || undefined,
      proposedRent: proposedRent || undefined
    }
    
    const success = await createInvitation(invitationData)
    if (success) {
      toast.success('Gửi lời mời thành công!')
      setIsInvitationOpen(false)
      // Reset form
      setAvailableFrom('')
      setAvailableUntil('')
      setInvitationMessage('')
      setProposedRent('')
      setSelectedRoomId('')
    } else {
      toast.error(invitationError || 'Không thể gửi lời mời')
    }
  }
  
  const openInvitationDialog = async () => {
    clearInvitationErrors()
    // Load buildings if not already loaded
    if (buildings.length === 0 && user?.role === 'landlord') {
      await fetchAllBuildings()
    }
    
    // Set default values
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    setAvailableFrom(tomorrow.toISOString().split('T')[0])
    
    const nextMonth = new Date()
    nextMonth.setMonth(nextMonth.getMonth() + 6)
    setAvailableUntil(nextMonth.toISOString().split('T')[0])
    
    setInvitationMessage('Tôi nghĩ phòng này phù hợp với bạn. Bạn có quan tâm không?')
    setProposedRent(currentPost?.maxBudget?.toString() || '')
    setSelectedBuildingId('')
    setSelectedRoomId('')
  }
  
  // Get rooms for selected building
  const selectedBuildingRooms = selectedBuildingId ? (buildingRooms.get(selectedBuildingId) || []) : []
  
  // Check if user is landlord and not the author of this post
  const requester = currentPost ? (currentPost as unknown as { requester?: { id?: string } }).requester : null
  const isLandlord = user?.role === 'landlord'
  const isOwnPost = user?.id === requester?.id
  const canSendInvitation = isLandlord && !isOwnPost && currentPost
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
  const formatAddress = () => {
    const ward = (currentPost as unknown as { preferredWard?: { name?: string } }).preferredWard?.name
    const district = (currentPost as unknown as { preferredDistrict?: { name?: string } }).preferredDistrict?.name
    const province = (currentPost as unknown as { preferredProvince?: { name?: string } }).preferredProvince?.name
    return [ward, district, province].filter(Boolean).join(', ')
  }

  // Get similar posts from available room seeking listings
  const getSimilarPosts = () => {
    // Filter out current post and limit to 8
    return publicPosts.filter((post: RoomSeekingPost) => post.id !== currentPost?.id).slice(0, 8)
  }

  // Generate breadcrumb items based on the post data
  const generateBreadcrumbItems = () => {
    const items: Array<{ title: string; href?: string }> = [
      { title: "Tìm người thuê", href: "/room-seekings" }
    ]

    if (currentPost) {
      const ward = (currentPost as unknown as { preferredWard?: { name?: string, id?: number } }).preferredWard
      const district = (currentPost as unknown as { preferredDistrict?: { name?: string, id?: number } }).preferredDistrict
      const province = (currentPost as unknown as { preferredProvince?: { name?: string, id?: number } }).preferredProvince

      // Add location-based breadcrumbs
      if (ward?.name && ward?.id) {
        items.push({ title: ward.name, href: `/room-seekings?wardId=${ward.id}` })
      }
      if (district?.name && district?.id) {
        items.push({ title: district.name, href: `/room-seekings?districtId=${district.id}` })
      }
      if (province?.name && province?.id) {
        items.push({ title: province.name, href: `/room-seekings?provinceId=${province.id}` })
      }

      // Add room type breadcrumb
      if (currentPost.preferredRoomType) {
        items.push({ title: getRoomTypeDisplayName(currentPost.preferredRoomType), href: `/room-seekings?roomType=${currentPost.preferredRoomType}` })
      }

      // Add current post title as final breadcrumb (no href = current page)
      items.push({ title: currentPost.title })
    }

    return items
  }

  // Loading state
  if (postLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-green-600" />
          <p className="text-gray-600 mt-2">Đang tải thông tin bài đăng...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (postError || !currentPost) {
    return (
      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {postError || 'Không tìm thấy bài đăng'}
          </h1>
          <Button onClick={() => window.history.back()}>
            Quay lại
          </Button>
        </div>
      </div>
    )
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
            {/* Header Image - Placeholder for now */}
            <div className="relative">
              <div className="w-full h-80 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl shadow-xl flex items-center justify-center">
                <div className="text-center">
                  <Home className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-gray-700">Tìm phòng trọ</h2>
                  <p className="text-gray-500">Hình ảnh sẽ được thêm sau</p>
                </div>
              </div>
              {/* Status Badge */}
              <div className="absolute top-4 right-4 bg-gradient-to-r from-green-400 to-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                {STATUS_LABELS[currentPost.status]}
              </div>
            </div>

            {/* Post Header */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2 leading-tight">
                      {currentPost.title}
                    </h1>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        {getRoomTypeDisplayName(currentPost.preferredRoomType)}
                      </Badge>
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        {currentPost.occupancy} người
                      </Badge>
                      <Badge variant="outline" className="text-purple-600 border-purple-200">
                        {formatDate(currentPost.moveInDate)}
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
                      {formatCurrency(Number(currentPost.minBudget))} - {formatCurrency(Number(currentPost.maxBudget))} VNĐ/tháng
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      Ngân sách linh hoạt
                    </Badge>
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
                    <span>{formatAddress()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>Đăng lúc: {formatDate(currentPost.createdAt)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Post Information */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Info className="h-5 w-5 text-blue-600" />
                  Thông tin chi tiết
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Basic Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <Home className="h-5 w-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-blue-600 font-medium">Loại phòng mong muốn</p>
                      <p className="font-semibold text-gray-900 truncate">{getRoomTypeDisplayName(currentPost.preferredRoomType)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                    <div className="p-2 bg-green-500 rounded-lg">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-green-600 font-medium">Số người ở</p>
                      <p className="font-semibold text-gray-900">{currentPost.occupancy} người</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                    <div className="p-2 bg-purple-500 rounded-lg">
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-purple-600 font-medium">Ngày dự định vào ở</p>
                      <p className="font-semibold text-gray-900">{formatDate(currentPost.moveInDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
                    <div className="p-2 bg-orange-500 rounded-lg">
                      <MessageCircle className="h-5 w-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-orange-600 font-medium">Lượt liên hệ</p>
                      <p className="font-semibold text-gray-900">{currentPost.contactCount}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Amenities */}
            {currentPost.amenityIds && currentPost.amenityIds.length > 0 && (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Home className="h-5 w-5 text-blue-600" />
                    Tiện nghi mong muốn
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AmenitySelector
                    selectedAmenities={currentPost.amenityIds}
                    onSelectionChange={() => {}} // Read-only
                    mode="display"
                  />
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
                  {currentPost.description}
                </div>
                {currentPost.description && currentPost.description.length > 150 && (
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
                  Vị trí mong muốn
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="w-full h-80 bg-gray-200 rounded-xl overflow-hidden shadow-inner">
                  {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
                    <iframe
                      width="100%"
                      height="100%"
                      className="rounded-xl border-0"
                      src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(formatAddress())}&zoom=16`}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Vị trí mong muốn"
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
                    {formatAddress()}
                  </span>
                </div>
                
                {/* Map Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formatAddress())}`
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
                      const mapsUrl = `maps://maps.apple.com/?q=${encodeURIComponent(formatAddress())}`
                      const fallbackUrl = `https://maps.apple.com/?q=${encodeURIComponent(formatAddress())}`
                      
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
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-1">
            {/* Requester Profile Section */}
            <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50">
              <CardContent className="">
                {/* Requester Profile */}
                {(() => {
                  interface Requester { 
                    firstName?: string; 
                    lastName?: string; 
                    phone?: string; 
                    avatarUrl?: string | null; 
                    isVerifiedIdentity?: boolean;
                    email?: string;
                    isVerifiedEmail?: boolean;
                    isVerifiedPhone?: boolean;
                  }
                  const requester = (currentPost as unknown as { requester?: Requester }).requester ?? ({} as Requester)

                  return (
                    <div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="relative">
                          <Avatar className="h-16 w-16 ring-4 ring-yellow-200">
                            {requester.avatarUrl && requester.avatarUrl.trim() !== '' ? (
                              <div className="w-full h-full relative">
                                <SizingImage 
                                  src={requester.avatarUrl} 
                                  srcSize="128x128" 
                                  alt={`${requester.firstName || 'User'} ${requester.lastName || ''}`}
                                  className="object-cover rounded-full"
                                  fill
                                />
                              </div>
                            ) : (
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-lg">
                                {(requester.firstName?.charAt(0) || 'U').toUpperCase()}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div className="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-lg mb-1">
                            {requester.firstName || 'Người'} {requester.lastName || 'dùng'}
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
                          <span className="text-sm text-gray-700">Điện thoại: {requester.phone || 'Chưa cập nhật'}</span>
                          <div className="ml-auto">
                            {requester.isVerifiedPhone ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Mail className="h-4 w-4 text-gray-600" />
                          <span className="text-sm text-gray-700">Email: {requester.email || 'Chưa cập nhật'}</span>
                          <div className="ml-auto">
                            {requester.isVerifiedEmail ? (
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
                            <span className="text-sm text-gray-700">Xác minh giấy tờ tùy thân</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {requester.isVerifiedEmail ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            <span className="text-sm text-gray-700">Xác minh email</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {requester.isVerifiedPhone ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            <span className="text-sm text-gray-700">Xác minh số điện thoại</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                {currentPost && (
                <div className="grid grid-cols-2 gap-3">
                  {canSendInvitation ? (
                    <Dialog open={isInvitationOpen} onOpenChange={(open) => {
                      setIsInvitationOpen(open)
                      if (open) {
                        openInvitationDialog()
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white" size="lg">
                          <Send className="h-4 w-4 mr-2" />
                          Gửi lời mời thuê
                        </Button>
                      </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Gửi lời mời thuê phòng</DialogTitle>
                        <DialogDescription>Gửi lời mời cho người tìm phòng về một căn phòng phù hợp</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="buildingId">Chọn tòa nhà *</Label>
                            <Select 
                              value={selectedBuildingId} 
                              onValueChange={(value) => {
                                setSelectedBuildingId(value)
                                setSelectedRoomId('') // Reset room selection when building changes
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={buildingsLoading ? "Đang tải..." : "Chọn tòa nhà"} />
                              </SelectTrigger>
                              <SelectContent>
                                {buildings.map((building) => (
                                  <SelectItem key={building.id} value={building.id}>
                                    <div className="flex flex-col">
                                      <span>{building.name}</span>
                                      <span className="text-xs text-gray-500">
                                        {building.addressLine1}
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))}
                                {buildings.length === 0 && !buildingsLoading && (
                                  <SelectItem value="no-buildings" disabled>
                                    Không có tòa nhà nào
                                  </SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="roomId">Chọn phòng *</Label>
                            <Select 
                              value={selectedRoomId} 
                              onValueChange={setSelectedRoomId}
                              disabled={!selectedBuildingId}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={
                                  !selectedBuildingId 
                                    ? "Vui lòng chọn tòa nhà trước" 
                                    : selectedBuildingRooms.length === 0 
                                    ? "Không có phòng nào" 
                                    : "Chọn phòng"
                                } />
                              </SelectTrigger>
                              <SelectContent>
                                {selectedBuildingRooms.map((room) => (
                                  <SelectItem key={room.id} value={room.id}>
                                    <div className="flex flex-col">
                                      <span>{room.name}</span>
                                      <span className="text-xs text-gray-500">
                                        {room.pricing?.basePriceMonthly && 
                                          `${formatCurrency(Number(room.pricing.basePriceMonthly))} VNĐ/tháng`
                                        }
                                        {room.totalRooms && ` • ${room.totalRooms} phòng`}
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label htmlFor="availableFrom">Có thể vào ở từ</Label>
                            <Input 
                              id="availableFrom"
                              type="date" 
                              value={availableFrom} 
                              onChange={(e) => setAvailableFrom(e.target.value)} 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="availableUntil">Có thể ở đến</Label>
                            <Input 
                              id="availableUntil"
                              type="date" 
                              value={availableUntil} 
                              onChange={(e) => setAvailableUntil(e.target.value)} 
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="proposedRent">Mức giá đề xuất (VND/tháng)</Label>
                          <Input 
                            id="proposedRent"
                            type="number" 
                            placeholder="Ví dụ: 3200000" 
                            value={proposedRent} 
                            onChange={(e) => setProposedRent(e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="invitationMessage">Lời nhắn</Label>
                          <Textarea 
                            id="invitationMessage"
                            placeholder="Ví dụ: Tôi nghĩ phòng này phù hợp với bạn. Bạn có quan tâm không?" 
                            value={invitationMessage} 
                            onChange={(e) => setInvitationMessage(e.target.value)} 
                            className="min-h-[80px]" 
                          />
                        </div>
                        
                        {invitationError && (
                          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                            {invitationError}
                          </div>
                        )}
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsInvitationOpen(false)}>
                          Hủy
                        </Button>
                        <Button onClick={handleCreateInvitation} disabled={invitationSubmitting || !selectedRoomId || !selectedBuildingId}>
                          {invitationSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                          Gửi lời mời
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  ) : (
                    <div className="text-center py-4 text-sm text-gray-500 col-span-2">
                      {!isLandlord 
                        ? 'Chỉ chủ trọ mới có thể gửi lời mời thuê'
                        : isOwnPost 
                        ? 'Bạn không thể gửi lời mời cho bài đăng của chính mình'
                        : 'Không thể gửi lời mời'
                      }
                    </div>
                  )}

                  {canSendInvitation ? (
                    <Button 
                      variant="outline"
                      className="border-gray-300 hover:bg-gray-50"
                      size="lg"
                      onClick={() => toast.info('Tính năng trò chuyện sẽ sớm ra mắt')}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Trò chuyện ngay
                    </Button>
                  ) : (
                    <Button 
                      className={`${canSendInvitation ? '' : 'col-span-2'} bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white`}
                      size="lg"
                      onClick={() => toast.info('Tính năng trò chuyện sẽ sớm ra mắt')}
                      disabled={isOwnPost && !canSendInvitation}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      {isOwnPost ? 'Đây là bài đăng của bạn' : 'Trò chuyện ngay'}
                    </Button>
                  )}
                </div>
                )}
                    </div>
                  )
                })()}
              </CardContent>
            </Card>

            {/* Budget Section - Sticky */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Ngân sách mong muốn
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Budget Display */}
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="text-3xl font-bold text-green-600">
                      {formatCurrency(Number(currentPost.minBudget))} - {formatCurrency(Number(currentPost.maxBudget))}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">VNĐ/tháng</div>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {formatAddress()}
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
                    if (currentPost.preferredDistrictId) {
                      searchParams.set('districtId', currentPost.preferredDistrictId.toString())
                    }
                    if (currentPost.preferredProvinceId) {
                      searchParams.set('provinceId', currentPost.preferredProvinceId.toString())
                    }
                    if (currentPost.preferredRoomType) {
                      searchParams.set('roomType', currentPost.preferredRoomType)
                    }
                    
                    router.push(`/room-seekings?${searchParams.toString()}`)
                  }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Xem thêm
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Similar posts content */}
              {getSimilarPosts().length > 0 && (
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
                    {getSimilarPosts().map((post: RoomSeekingPost, index: number) => (
                      <SwiperSlide key={`${post.id}-${index}`}>
                        <div onClick={() => router.push(`/room-seekings/${post.id}`)}>
                          <RoomSeekingCard
                            post={post}
                            asLink={false}
                            className="!shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                          />
                        </div>
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
              {getSimilarPosts().length === 0 && (
                <div className="text-center py-12">
                  <Home className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg mb-4">Không có tin đăng tương tự</p>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/room-seekings')}
                    className="hover:bg-blue-50"
                  >
                    Tìm kiếm tin đăng khác
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
