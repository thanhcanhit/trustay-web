"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Heart, Share2, MapPin, Calendar, DollarSign, Phone, Users, Loader2, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { getRoommateSeekingPostById, type RoommateSeekingPost } from "@/actions/roommate-seeking-posts.action"
import { useRoommateApplicationsStore } from "@/stores/roommate-applications.store"
import { useUserStore } from "@/stores/userStore"
import { toast } from "sonner"

export default function RoommateDetailPage() {
  const params = useParams()
  const router = useRouter()
  const postId = params.id as string
  const [isSaved, setIsSaved] = useState(false)
  const [post, setPost] = useState<RoommateSeekingPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  
  // Get user info for auto-fill
  const { user } = useUserStore()
  
  // Application form state
  const [formData, setFormData] = useState({
    fullName: '',
    occupation: '',
    phoneNumber: '',
    moveInDate: '',
    intendedStayMonths: 6,
    applicationMessage: '',
    isUrgent: false
  })
  
  const { createApplication, isLoading: isSubmitting, error: applicationError } = useRoommateApplicationsStore()

  // Auto-fill form when dialog opens and user is logged in
  useEffect(() => {
    if (dialogOpen && user) {
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim()
      setFormData(prev => ({
        ...prev,
        fullName: fullName || prev.fullName,
        phoneNumber: user.phone || prev.phoneNumber,
      }))
    }
  }, [dialogOpen, user])

  const handleSubmitApplication = async () => {
    if (!formData.fullName || !formData.phoneNumber || !formData.moveInDate) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc')
      return
    }

    const success = await createApplication({
      roommateSeekingPostId: postId,
      ...formData
    })

    if (success) {
      toast.success('Gửi yêu cầu ở ghép thành công!')
      setDialogOpen(false)
      // Reset form
      setFormData({
        fullName: '',
        occupation: '',
        phoneNumber: '',
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

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Compact & Sticky */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
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
                <Heart className={`h-4 w-4 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              <Button variant="ghost" size="sm">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Status */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-3">
                <h1 className="text-3xl font-bold text-gray-900">
                  {post.title}
                </h1>
                {getStatusBadge(post.status)}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  <span>{getLocationText()}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(post.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Price & Key Info */}
            <div className="border-l-4 border-green-500 bg-green-50 px-4 py-3 rounded">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <div>
                  <span className="text-sm text-green-700">Tiền thuê</span>
                  <p className="text-2xl font-bold text-green-900">{formatPrice(post.monthlyRent)}<span className="text-base font-normal">/tháng</span></p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Tiền cọc</span>
                  <p className="text-xl font-semibold text-gray-900">{formatPrice(post.depositAmount)}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Chuyển vào</span>
                  <p className="text-xl font-semibold text-gray-900">{formatDate(post.availableFromDate)}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">Mô tả</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{post.description}</p>
            </div>

            {/* Additional Requirements */}
            {post.additionalRequirements && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">Yêu cầu thêm</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{post.additionalRequirements}</p>
              </div>
            )}

            {/* Details Grid */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Thông tin chi tiết</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Số người tìm</p>
                    <p className="font-semibold text-gray-900">
                      {post.seekingCount} người ({post.remainingSlots} chỗ trống)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="h-5 w-5 text-pink-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Giới tính ưu tiên</p>
                    <p className="font-semibold text-gray-900">{getGenderText(post.preferredGender)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Home className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Sức chứa tối đa</p>
                    <p className="font-semibold text-gray-900">{post.maxOccupancy} người</p>
                  </div>
                </div>

                {post.utilityCostPerPerson && post.utilityCostPerPerson > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <DollarSign className="h-5 w-5 text-cyan-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Điện nước/người</p>
                      <p className="font-semibold text-gray-900">{formatPrice(post.utilityCostPerPerson)}</p>
                    </div>
                  </div>
                )}

                {post.minimumStayMonths && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-5 w-5 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Ở tối thiểu</p>
                      <p className="font-semibold text-gray-900">{post.minimumStayMonths} tháng</p>
                    </div>
                  </div>
                )}

                {post.maximumStayMonths && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Ở tối đa</p>
                      <p className="font-semibold text-gray-900">{post.maximumStayMonths} tháng</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - 1/3 - Sticky Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-20">
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
                        <Label htmlFor="phoneNumber">Số điện thoại <span className="text-red-500">*</span></Label>
                        <Input
                          id="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                          placeholder="0901234567"
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
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
