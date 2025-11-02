"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Heart, Share2, MapPin, Calendar, DollarSign, Phone, Users, Loader2, Home, ChevronDown, ChevronUp, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { getRoommateSeekingPostById, type RoommateSeekingPost } from "@/actions/roommate-seeking-posts.action"
import { useRoommateApplicationsStore } from "@/stores/roommate-applications.store"
import { useUserStore } from "@/stores/userStore"
import { useChatStore } from "@/stores/chat.store"
import { MESSAGE_TYPES } from "@/constants/chat.constants"
import { encodeStructuredMessage } from "@/lib/chat-message-encoder"
import { toast } from "sonner"
import { HTMLContent } from "@/components/ui/html-content"
import { BreadcrumbNavigation } from "@/components/breadcrumb-navigation"

export default function RoommateDetailPage() {
  const params = useParams()
  const router = useRouter()
  const postId = params.id as string
  const [isSaved, setIsSaved] = useState(false)
  const [post, setPost] = useState<RoommateSeekingPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  
  // Get user info for auto-fill
  const { user } = useUserStore()
  
  // Application form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    occupation: '',
    phoneNumber: '',
    monthlyIncome: 0,
    moveInDate: '',
    intendedStayMonths: 6,
    applicationMessage: '',
    isUrgent: false
  })
  
  const { createApplication, isLoading: isSubmitting, error: applicationError } = useRoommateApplicationsStore()
  const { sendMessage: sendChatMessage, setCurrentUserId } = useChatStore()

  // Set current user ID for chat
  useEffect(() => {
    if (user?.id) {
      setCurrentUserId(user.id)
    }
  }, [user?.id, setCurrentUserId])

  // Auto-fill form when dialog opens and user is logged in
  useEffect(() => {
    if (dialogOpen && user) {
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim()
      setFormData(prev => ({
        ...prev,
        fullName: fullName || prev.fullName,
        email: user.email || prev.email,
        phoneNumber: user.phone || prev.phoneNumber,
      }))
    }
  }, [dialogOpen, user])

  const handleSubmitApplication = async () => {
    if (!formData.fullName || !formData.email || !formData.phoneNumber || !formData.moveInDate) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc')
      return
    }

    const success = await createApplication({
      roommateSeekingPostId: postId,
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phoneNumber,
      occupation: formData.occupation,
      monthlyIncome: formData.monthlyIncome,
      moveInDate: formData.moveInDate,
      intendedStayMonths: formData.intendedStayMonths,
      applicationMessage: formData.applicationMessage,
      isUrgent: formData.isUrgent,
    })

    if (success) {
      // Send notification message to post owner
      if (post?.tenant?.id) {
        try {
          console.log('🚀 Sending roommate application notification message')
          
          // Encode structured message with post metadata
          const location = post.externalProvince && post.externalDistrict
            ? `${post.externalDistrict.name}, ${post.externalProvince.name}`
            : post.roomInstance?.room?.building?.address || ''
          
          const budgetText = post.monthlyRent 
            ? `${post.monthlyRent.toLocaleString('vi-VN')}đ/tháng` 
            : undefined
          
          const encodedContent = encodeStructuredMessage({
            type: 'roommate_application',
            roommateSeeking: {
              roommateSeekingPostId: post.id,
              roommateSeekingPostTitle: post.title,
              roommateSeekingPostBudget: budgetText,
              roommateSeekingPostLocation: location
            },
            message: formData.applicationMessage || 'Tôi muốn ứng tuyển làm bạn cùng phòng của bạn.'
          })
          
          await sendChatMessage({
            recipientId: post.tenant.id,
            content: encodedContent,
            type: MESSAGE_TYPES.REQUEST
          })
          console.log('✅ Notification message sent successfully')
        } catch (error) {
          console.error('❌ Failed to send notification message:', error)
          // Don't fail the whole operation if message sending fails
        }
      }

      toast.success('Gửi yêu cầu ở ghép thành công!')
      setDialogOpen(false)
      // Reset form
      setFormData({
        fullName: '',
        email: '',
        occupation: '',
        phoneNumber: '',
        monthlyIncome: 0,
        moveInDate: '',
        intendedStayMonths: 6,
        applicationMessage: '',
        isUrgent: false
      })
    } else {
      // Display specific error message from store or default message
      toast.error(applicationError || 'Không thể gửi yêu cầu. Vui lòng thử lại.')
    }
  }

  useEffect(() => {
    const loadPost = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const result = await getRoommateSeekingPostById(postId)
        
        if (result.success && result.data) {
          setPost(result.data)
        } else {
          setError('error' in result ? result.error : 'Không thể tải bài đăng')
        }
      } catch (err) {
        console.error('Error loading post:', err)
        setError('Đã có lỗi xảy ra')
      } finally {
        setLoading(false)
      }
    }
    
    if (postId) {
      loadPost()
    }
  }, [postId])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-green-600 mb-4" />
          <p className="text-gray-600">Đang tải thông tin bài đăng...</p>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Không tìm thấy bài đăng'}
          </h1>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
        </div>
      </div>
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  const getGenderText = (gender: string) => {
    switch (gender) {
      case 'male': return 'Nam'
      case 'female': return 'Nữ'
      case 'other': return 'Không yêu cầu'
      default: return 'Không yêu cầu'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Đang hoạt động</Badge>
      case 'paused':
        return <Badge variant="secondary">Tạm dừng</Badge>
      case 'closed':
        return <Badge variant="outline">Đã đóng</Badge>
      case 'expired':
        return <Badge variant="destructive">Hết hạn</Badge>
      case 'draft':
        return <Badge variant="secondary">Bản nháp</Badge>
      default:
        return null
    }
  }

  // Get location text
  const getLocationText = () => {
    if (post.roomInstance?.room?.building) {
      return `${post.roomInstance.room.building.name} - Phòng ${post.roomInstance.roomNumber}`
    }
    if (post.externalAddress) {
      const parts = [post.externalAddress]
      if (post.externalWard) parts.push(post.externalWard.name)
      if (post.externalDistrict) parts.push(post.externalDistrict.name)
      if (post.externalProvince) parts.push(post.externalProvince.name)
      return parts.join(', ')
    }
    return 'Chưa xác định'
  }

  // Get tenant name
  const tenantName = post.tenant 
    ? `${post.tenant.firstName || ''} ${post.tenant.lastName || ''}`.trim() || 'Ẩn danh'
    : 'Ẩn danh'

  // Generate breadcrumb items
  const generateBreadcrumbItems = () => {
    const items: Array<{ title: string; href?: string }> = [
      { title: "Tìm người ở ghép", href: "/roommate" }
    ]

    if (post) {
      // Add location-based breadcrumbs
      if (post.externalWard?.name) {
        items.push({ title: post.externalWard.name })
      }
      if (post.externalDistrict?.name) {
        items.push({ title: post.externalDistrict.name })
      }
      if (post.externalProvince?.name) {
        items.push({ title: post.externalProvince.name })
      }

      // Add current post title as final breadcrumb
      items.push({ title: post.title })
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
          {/* Main Content - 2/3 */}
          <div className="lg:col-span-2 space-y-1">
            {/* Single Comprehensive Card */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                {/* Header Section */}
                <div className="mb-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusBadge(post.status)}
                        <Badge variant="outline" className="text-purple-600 border-purple-200">
                          <Users className="h-3 w-3 mr-1" />
                          {post.remainingSlots} chỗ trống
                        </Badge>
                      </div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-3 leading-tight break-words">
                        {post.title}
                      </h1>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span>{getLocationText()}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>Đăng lúc: {formatDate(post.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setIsSaved(!isSaved)} className="text-gray-600">
                        <Heart className={`h-4 w-4 mr-1 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
                        Lưu
                      </Button>
                      <Button variant="outline" size="sm" className="text-gray-600">
                        <Share2 className="h-4 w-4 mr-1" />
                        Chia sẻ
                      </Button>
                    </div>
                  </div>

                  {/* Price Display */}
                  <div className="flex items-center justify-between p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-green-500 rounded-lg">
                        <DollarSign className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-green-600 font-medium mb-1">Tiền thuê hàng tháng</p>
                        <div className="text-2xl font-bold text-green-600">
                          {formatPrice(post.monthlyRent)}<span className="text-base font-normal">/tháng</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600 mb-1">Tiền cọc</div>
                      <div className="text-xl font-semibold text-gray-900">{formatPrice(post.depositAmount)}</div>
                      <div className="text-sm text-gray-600 mt-2">Chuyển vào: {formatDate(post.availableFromDate)}</div>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 my-6"></div>

                {/* Details Grid */}
                <div className="mb-6">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                    <Home className="h-5 w-5 text-blue-600" />
                    Thông tin chi tiết
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                      <div className="p-2 bg-purple-500 rounded-lg">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-purple-600 font-medium">Số người tìm</p>
                        <p className="font-semibold text-gray-900">
                          {post.seekingCount} người ({post.remainingSlots} chỗ trống)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl border border-pink-200">
                      <div className="p-2 bg-pink-500 rounded-lg">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-pink-600 font-medium">Giới tính ưu tiên</p>
                        <p className="font-semibold text-gray-900">{getGenderText(post.preferredGender)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl border border-indigo-200">
                      <div className="p-2 bg-indigo-500 rounded-lg">
                        <Home className="h-5 w-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-indigo-600 font-medium">Sức chứa tối đa</p>
                        <p className="font-semibold text-gray-900">{post.maxOccupancy} người</p>
                      </div>
                    </div>

                    {post.utilityCostPerPerson && post.utilityCostPerPerson > 0 && (
                      <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl border border-cyan-200">
                        <div className="p-2 bg-cyan-500 rounded-lg">
                          <DollarSign className="h-5 w-5 text-white" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm text-cyan-600 font-medium">Điện nước/người</p>
                          <p className="font-semibold text-gray-900">{formatPrice(post.utilityCostPerPerson)}</p>
                        </div>
                      </div>
                    )}

                    {post.minimumStayMonths && (
                      <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl border border-teal-200">
                        <div className="p-2 bg-teal-500 rounded-lg">
                          <Calendar className="h-5 w-5 text-white" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm text-teal-600 font-medium">Ở tối thiểu</p>
                          <p className="font-semibold text-gray-900">{post.minimumStayMonths} tháng</p>
                        </div>
                      </div>
                    )}

                    {post.maximumStayMonths && (
                      <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border border-amber-200">
                        <div className="p-2 bg-amber-500 rounded-lg">
                          <Calendar className="h-5 w-5 text-white" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm text-amber-600 font-medium">Ở tối đa</p>
                          <p className="font-semibold text-gray-900">{post.maximumStayMonths} tháng</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 my-6"></div>

                {/* Description */}
                <div className="mb-6">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                    <Home className="h-5 w-5 text-blue-600" />
                    Mô tả
                  </h3>
                  <div className={`${!isDescriptionExpanded ? 'line-clamp-3' : ''}`}>
                    <HTMLContent content={post.description} />
                  </div>
                  {post.description && post.description.length > 150 && (
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

                {/* Additional Requirements */}
                {post.additionalRequirements && (
                  <>
                    <div className="border-t border-gray-200 my-6"></div>
                    <div>
                      <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                        <Home className="h-5 w-5 text-blue-600" />
                        Yêu cầu thêm
                      </h3>
                      <HTMLContent content={post.additionalRequirements} />
                    </div>
                  </>
                )}

                {/* Embedded Room Post - If roomInstanceId exists */}
                {post.roomInstance && (
                  <>
                    <div className="border-t border-gray-200 my-6"></div>
                    <div>
                      <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
                        <Home className="h-5 w-5 text-blue-600" />
                        Phòng đang ở
                      </h3>
                      <div 
                        className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 hover:border-blue-300 transition-all cursor-pointer group"
                        onClick={() => {
                          // Navigate to room detail page directly
                          if (post.roomInstance?.room?.id) {
                            router.push(`/rooms/${post.roomInstance.room.id}`)
                          } else {
                            toast.info('Không thể xem chi tiết phòng này')
                          }
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Home className="h-5 w-5 text-blue-600" />
                              <h4 className="font-semibold text-gray-900">
                                {post.roomInstance.room?.name || `Phòng ${post.roomInstance.roomNumber}`}
                              </h4>
                              <ExternalLink className="h-4 w-4 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            {post.roomInstance.room?.building && (
                              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                <MapPin className="h-4 w-4" />
                                <span>{post.roomInstance.room.building.name}</span>
                              </div>
                            )}
                            {post.roomInstance.room?.building?.address && (
                              <p className="text-sm text-gray-500">
                                {post.roomInstance.room.building.address}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-blue-200">
                          <p className="text-sm text-blue-600 font-medium">
                            Nhấn để xem chi tiết phòng này →
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - 1/3 - Sticky Card */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm sticky top-20">
              <CardContent className="p-6">
              {/* Avatar & Name */}
              <div className="text-center mb-6 pb-6 border-b">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {tenantName.charAt(0).toUpperCase()}
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">{tenantName}</h3>
                <p className="text-sm text-gray-500">Người đăng</p>
              </div>

              {/* Application Button with Dialog - Only show for active posts */}
              {post.status === 'active' ? (
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full mb-6 bg-green-600 hover:bg-green-700 shadow-lg" size="lg">
                      <Phone className="h-5 w-5 mr-2" />
                      Gửi yêu cầu ở ghép
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Gửi yêu cầu ở ghép</DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fullName">Họ và tên <span className="text-red-500">*</span></Label>
                        <Input
                          id="fullName"
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          placeholder="Nguyễn Văn A"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="email@example.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phoneNumber">Số điện thoại <span className="text-red-500">*</span></Label>
                        <Input
                          id="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                          placeholder="0901234567"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="monthlyIncome">Thu nhập/tháng (VNĐ) <span className="text-red-500">*</span></Label>
                        <Input
                          id="monthlyIncome"
                          type="number"
                          min="0"
                          value={formData.monthlyIncome}
                          onChange={(e) => setFormData({ ...formData, monthlyIncome: Number(e.target.value) })}
                          placeholder="5000000"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="occupation">Nghề nghiệp</Label>
                        <Input
                          id="occupation"
                          value={formData.occupation}
                          onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                          placeholder="Sinh viên, Nhân viên văn phòng..."
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="moveInDate">Ngày chuyển vào <span className="text-red-500">*</span></Label>
                        <Input
                          id="moveInDate"
                          type="date"
                          value={formData.moveInDate}
                          onChange={(e) => setFormData({ ...formData, moveInDate: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="intendedStayMonths">Dự định ở (tháng)</Label>
                      <Input
                        id="intendedStayMonths"
                        type="number"
                        min="1"
                        value={formData.intendedStayMonths}
                        onChange={(e) => setFormData({ ...formData, intendedStayMonths: Number(e.target.value) })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="applicationMessage">Lời nhắn</Label>
                      <Textarea
                        id="applicationMessage"
                        value={formData.applicationMessage}
                        onChange={(e) => setFormData({ ...formData, applicationMessage: e.target.value })}
                        placeholder="Giới thiệu bản thân, lý do muốn ở ghép..."
                        rows={4}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isUrgent"
                        checked={formData.isUrgent}
                        onCheckedChange={(checked) => setFormData({ ...formData, isUrgent: checked as boolean })}
                      />
                      <Label htmlFor="isUrgent" className="text-sm font-normal cursor-pointer">
                        Yêu cầu khẩn cấp (cần tìm nhanh)
                      </Label>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setDialogOpen(false)}
                        className="flex-1"
                        disabled={isSubmitting}
                      >
                        Hủy
                      </Button>
                      <Button
                        onClick={handleSubmitApplication}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Đang gửi...
                          </>
                        ) : (
                          'Gửi yêu cầu'
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              ) : (
                <div className="w-full mb-6 p-4 bg-gray-100 rounded-lg text-center">
                  <p className="text-sm text-gray-600">
                    {post.status === 'draft' && 'Bài đăng này đang ở trạng thái bản nháp'}
                    {post.status === 'paused' && 'Bài đăng này đang tạm dừng'}
                    {post.status === 'closed' && 'Bài đăng này đã đóng'}
                    {post.status === 'expired' && 'Bài đăng này đã hết hạn'}
                  </p>
                </div>
              )}

              {/* Stats */}
              <div className="space-y-3 mb-6 pb-6 border-b">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Lượt xem</span>
                  <span className="font-bold text-gray-900 text-lg">{post.viewCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Lượt liên hệ</span>
                  <span className="font-bold text-gray-900 text-lg">{post.contactCount}</span>
                </div>
              </div>

              {/* Contact Info */}
              {post.tenant?.phoneNumber && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700 font-medium">{post.tenant.phoneNumber}</span>
                  </div>
                </div>
              )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
