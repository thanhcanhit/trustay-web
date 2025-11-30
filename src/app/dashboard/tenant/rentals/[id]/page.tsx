"use client"

import { Suspense, useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Home,
  Calendar,
  MapPin,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  User,
  FileText,
  Clock,
  CalendarCheck,
  XCircle,
  Wrench,
  ExternalLink,
  ImageIcon,
  Users
} from "lucide-react"
import { useRentalStore } from "@/stores/rentalStore"
import { useRoomStore } from "@/stores/roomStore"
import { useRoomIssueStore } from "@/stores/roomIssueStore"
import { RentalStatus, RoomIssueCategory } from "@/types/types"
import { SizingImage } from "@/components/sizing-image"
import { RenewRentalDialog } from "@/components/rental/RenewRentalDialog"
import { TerminateRentalDialog } from "@/components/rental/TerminateRentalDialog"
import { RenewRentalRequest, TerminateRentalRequest } from "@/types/rental.types"
import { toast } from "sonner"
import { HTMLContent } from "@/components/ui/html-content"
import { getRoomTypeDisplayName } from "@/utils/room-types"
import { translateRoomStatus } from "@/utils"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { X } from "lucide-react"

const RENTAL_STATUS_CONFIG: Record<RentalStatus, { label: string; className: string }> = {
  active: { label: 'Đang thuê', className: 'bg-green-100 text-green-800' },
  pending: { label: 'Chờ xác nhận', className: 'bg-yellow-100 text-yellow-800' },
  expired: { label: 'Hết hạn', className: 'bg-red-100 text-red-800' },
  terminated: { label: 'Đã chấm dứt', className: 'bg-gray-100 text-gray-800' },
}

const resolveDecimal = (v: unknown): number | string | null => {
  if (v == null) return null
  if (typeof v === 'number' || typeof v === 'string') return v
  // Decimal.js (Prisma) objects typically have toNumber / toString
  if (typeof v === 'object') {
    if ('toNumber' in v && typeof v.toNumber === 'function') {
      return v.toNumber()
    }
    if ('toString' in v && typeof v.toString === 'function') {
      return v.toString()
    }
  }
  return String(v)
}

const formatDate = (dateString: string | Date | null | undefined) => {
    if (!dateString) return 'Không xác định'
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return 'Không xác định'
  }
}


const formatCurrency = (amount: string | number | null | undefined | object) => {
  const resolved = resolveDecimal(amount)
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(Number(resolved ?? 0))
}

function RentalDetailContent() {
  const params = useParams()
  const router = useRouter()
  const rentalId = params.id as string

  const {
    current: rental,
    loadingCurrent,
    errorCurrent,
    loadById,
    clearCurrent,
    renew,
    terminate,
    submitting,
  } = useRentalStore()

  const { currentRoom, loadRoomDetail } = useRoomStore()
  const { create: createRoomIssue, submitting: submittingIssue, submitError } = useRoomIssueStore()

  const [showRenewDialog, setShowRenewDialog] = useState(false)
  const [showTerminateDialog, setShowTerminateDialog] = useState(false)
  const [showReportIssueDialog, setShowReportIssueDialog] = useState(false)
  const [issueTitle, setIssueTitle] = useState('')
  const [issueCategory, setIssueCategory] = useState<RoomIssueCategory>('other')

  useEffect(() => {
    if (rentalId) {
      loadById(rentalId)
    }
    return () => {
      clearCurrent()
    }
  }, [rentalId, loadById, clearCurrent])

  // Load room detail when rental is loaded
  useEffect(() => {
    if (rental?.roomInstance?.room?.id) {
      loadRoomDetail(rental.roomInstance.room.id)
    }
  }, [rental, loadRoomDetail])

  if (loadingCurrent) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
          <span className="text-gray-500">Đang tải thông tin...</span>
        </div>
      </div>
    )
  }

  if (errorCurrent || !rental) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <div>
              <h3 className="text-lg font-semibold text-red-800">Không thể tải thông tin</h3>
              <p className="text-red-600">{errorCurrent || 'Không tìm thấy hợp đồng thuê'}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const getDuration = () => {
    if (!rental.contractStartDate || !rental.contractEndDate) return 'Không xác định'
    const start = new Date(rental.contractStartDate)
    const end = new Date(rental.contractEndDate)
    const months = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30))
    return `${months} tháng`
  }

  const getDaysRemaining = () => {
    if (!rental.contractEndDate || rental.status !== 'active') return null
    const end = new Date(rental.contractEndDate)
    const now = new Date()
    const days = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (days < 0) return null
    return days
  }

  const daysRemaining = getDaysRemaining()

  const handleRenewRental = async (rentalId: string, data: RenewRentalRequest) => {
    const success = await renew(rentalId, data)
    if (success) {
      toast.success('Yêu cầu gia hạn đã được gửi đến chủ trọ!')
      setShowRenewDialog(false)
      await loadById(rentalId)
    } else {
      toast.error('Không thể gửi yêu cầu gia hạn')
    }
  }

  const handleTerminateRental = async (rentalId: string, data: TerminateRentalRequest) => {
    const success = await terminate(rentalId, data)
    if (success) {
      toast.success('Yêu cầu chấm dứt hợp đồng đã được gửi!')
      setShowTerminateDialog(false)
      await loadById(rentalId)
    } else {
      toast.error('Không thể gửi yêu cầu chấm dứt hợp đồng')
    }
  }

  const handleViewRoomPost = () => {
    if (rental?.roomInstance?.room?.id) {
      window.open(`/rooms/${rental.roomInstance.room.id}`, '_blank')
    }
  }

  const handleReportIssue = () => {
    setShowReportIssueDialog(true)
  }

  const handleSubmitRoomIssue = async () => {
    if (!issueTitle.trim()) {
      toast.error('Vui lòng nhập tiêu đề sự cố')
      return
    }

    if (!rental?.roomInstance?.id) {
      toast.error('Không tìm thấy thông tin phòng')
      return
    }

    const success = await createRoomIssue({
      roomInstanceId: rental.roomInstance.id,
      title: issueTitle.trim(),
      category: issueCategory,
    })

    if (success) {
      toast.success('Đã gửi báo cáo sự cố thành công')
      setShowReportIssueDialog(false)
      setIssueTitle('')
      setIssueCategory('other')
    } else {
      toast.error(submitError || 'Không thể gửi báo cáo sự cố')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={RENTAL_STATUS_CONFIG[rental.status].className}>
            {RENTAL_STATUS_CONFIG[rental.status].label}
          </Badge>
          {rental.status === 'active' && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowRenewDialog(true)}
              >
                <CalendarCheck className="h-4 w-4 mr-2" />
                Gia hạn
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleReportIssue}
              >
                <Wrench className="h-4 w-4 mr-2" />
                Báo cáo sự cố
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setShowTerminateDialog(true)}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Chấm dứt
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Days Remaining Alert */}
      {daysRemaining !== null && daysRemaining <= 30 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="font-medium text-orange-800">
                  Hợp đồng sắp hết hạn
                </p>
                <p className="text-sm text-orange-700">
                  Còn {daysRemaining} ngày đến ngày kết thúc hợp đồng
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Two Column Layout: Room Detail (Left) and Room Instance (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Room Detail */}
        <div className="lg:col-span-2 space-y-6">
          {/* Room Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  Thông tin phòng trọ
                </CardTitle>
                {rental.roomInstance?.room?.id && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleViewRoomPost}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Xem bài đăng
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
                <div className="p-3 bg-blue-200 rounded-lg">
                  <MapPin className="h-6 w-6 text-blue-700" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">
                    {rental.roomInstance?.room?.name || 'Không xác định'}
                  </h3>
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <Building2 className="h-4 w-4" />
                    <span>{rental.roomInstance?.room?.building?.name || 'Không xác định'}</span>
                  </div>
                  {rental.roomInstance?.room?.description && (
                    <div className="text-sm text-gray-600 mt-2">
                      <HTMLContent content={rental.roomInstance.room.description} />
                    </div>
                  )}
                </div>
              </div>

              {/* Room Details from API */}
              {currentRoom && (
                <>
                  {/* Room Images */}
                  {currentRoom.images && currentRoom.images.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        Hình ảnh phòng
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {currentRoom.images.slice(0, 4).map((img, idx) => (
                          <SizingImage
                            key={idx}
                            src={img.url}
                            alt={`Room ${idx + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Room Amenities */}
                  {currentRoom.amenities && currentRoom.amenities.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Tiện nghi</h4>
                      <div className="flex flex-wrap gap-2">
                        {currentRoom.amenities.map((amenity, idx) => (
                          <Badge key={idx} variant="secondary">
                            {typeof amenity === 'string' ? amenity : amenity.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pricing */}
                  {currentRoom.pricing && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Chi phí</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-green-50 rounded-lg">
                          <p className="text-sm text-gray-600">Giá thuê/tháng</p>
                          <p className="font-semibold text-green-700">
                            {formatCurrency(currentRoom.pricing.basePriceMonthly)}
                          </p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-gray-600">Tiền cọc</p>
                          <p className="font-semibold text-blue-700">
                            {formatCurrency(currentRoom.pricing.depositAmount)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Costs */}
                  {currentRoom.costs && currentRoom.costs.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Chi phí khác</h4>
                      <div className="space-y-2">
                        {currentRoom.costs.map((cost) => (
                          <div key={cost.id} className="flex justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm">{cost.name}</span>
                            <span className="text-sm font-medium">{formatCurrency(cost.value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {rental.roomInstance?.room && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-gray-600">Loại phòng</p>
                    <p className="font-medium">
                      {getRoomTypeDisplayName(rental.roomInstance?.room?.roomType) || 'Không xác định'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Diện tích</p>
                    <p className="font-medium">
                      {String(resolveDecimal(rental.roomInstance?.room?.areaSqm) ?? '0')} m²
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Sức chứa</p>
                    <p className="font-medium">{String(resolveDecimal(rental.roomInstance?.room?.maxOccupancy) ?? '0')} người</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tầng</p>
                    <p className="font-medium">Tầng {String(resolveDecimal(rental.roomInstance?.room?.floorNumber) ?? '0')}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Landlord Information */}
          {rental.owner && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Thông tin chủ nhà
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Họ tên:</span>
                    <span className="font-medium">
                      {rental.owner.lastName} {rental.owner.firstName}
                    </span>
                  </div>
                  {rental.owner.email && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600 flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email:
                      </span>
                      <a
                        href={`mailto:${rental.owner.email}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {rental.owner.email}
                      </a>
                    </div>
                  )}
                  {rental.owner.phone && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600 flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Số điện thoại:
                      </span>
                      <a
                        href={`tel:${rental.owner.phone}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {rental.owner.phone}
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Roommates/Members Information */}
          {rental.members && rental.members.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Người ở cùng ({rental.members.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {rental.members.map((member, index) => (
                    <div key={member.tenantId} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">
                          {member.lastName} {member.firstName}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          Thành viên {index + 1}
                        </Badge>
                      </div>
                      {member.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="h-3 w-3" />
                          <a
                            href={`mailto:${member.email}`}
                            className="text-blue-600 hover:underline"
                          >
                            {member.email}
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Room Instance & Rental Contract */}
        <div className="lg:col-span-1 space-y-6">
          {/* Room Instance Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Phòng của bạn
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {rental.roomInstance && (
                <>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Thông tin phòng</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Số phòng:</span>
                        <span className="font-medium">{rental.roomInstance.roomNumber || 'Không xác định'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Trạng thái:</span>
                        <Badge variant={rental.roomInstance.status === 'occupied' ? 'default' : 'secondary'}>
                          {translateRoomStatus(rental.roomInstance.status)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {rental.roomInstance.notes && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Ghi chú:</p>
                      <p className="text-sm">{rental.roomInstance.notes}</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Rental Contract Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Hợp đồng thuê
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Financial Info */}
              <div className="space-y-3">
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Tiền thuê/tháng</p>
                  <p className="text-lg font-bold text-green-700">
                    {formatCurrency(rental.monthlyRent)}
                  </p>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Tiền cọc đã đặt</p>
                  <p className="text-lg font-bold text-blue-700">
                    {formatCurrency(rental.depositPaid)}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Contract Dates */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-gray-600" />
                  <h4 className="font-medium text-sm">Thời hạn</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-600">Bắt đầu:</span>
                    <span className="font-medium">{formatDate(rental.contractStartDate)}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-600">Kết thúc:</span>
                    <span className="font-medium">{formatDate(rental.contractEndDate)}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-600">Thời hạn:</span>
                    <span className="font-medium">{getDuration()}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Contract Metadata */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between p-2">
                  <span className="text-gray-600">Mã HĐ:</span>
                  <span className="font-medium">#{rental.id.slice(0, 8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between p-2">
                  <span className="text-gray-600">Ngày tạo:</span>
                  <span className="font-medium">{formatDate(rental.createdAt)}</span>
                </div>
              </div>

              {rental.contractDocumentUrl && (
                <>
                  <Separator />
                  <Button variant="outline" className="w-full" asChild>
                    <a href={rental.contractDocumentUrl} target="_blank" rel="noopener noreferrer">
                      <FileText className="h-4 w-4 mr-2" />
                      Xem hợp đồng
                    </a>
                  </Button>
                </>
              )}

              {/* Termination Info */}
              {rental.terminationNoticeDate && (
                <>
                  <Separator />
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="font-medium text-red-800 text-sm mb-2">Thông tin chấm dứt</h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ngày thông báo:</span>
                        <span className="font-medium">{formatDate(rental.terminationNoticeDate)}</span>
                      </div>
                      {rental.terminationReason && (
                        <div>
                          <span className="text-gray-600">Lý do:</span>
                          <p className="mt-1 text-gray-800">{rental.terminationReason}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <RenewRentalDialog
        rental={rental}
        open={showRenewDialog}
        onOpenChange={setShowRenewDialog}
        onSubmit={handleRenewRental}
        isSubmitting={submitting}
      />

      <TerminateRentalDialog
        rental={rental}
        open={showTerminateDialog}
        onOpenChange={setShowTerminateDialog}
        onSubmit={handleTerminateRental}
        isSubmitting={submitting}
      />

      {/* Report Room Issue Modal */}
      {showReportIssueDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={() => {
              setShowReportIssueDialog(false)
              setIssueTitle('')
              setIssueCategory('other')
            }}
          />
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-4 p-6 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold">Báo cáo sự cố phòng</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Mô tả sự cố bạn đang gặp phải để chủ trọ có thể xử lý kịp thời
                </p>
              </div>
              <button
                onClick={() => {
                  setShowReportIssueDialog(false)
                  setIssueTitle('')
                  setIssueCategory('other')
                }}
                className="text-gray-400 hover:text-gray-600"
                disabled={submittingIssue}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="issue-category">Loại sự cố</Label>
                <Select value={issueCategory} onValueChange={(value) => setIssueCategory(value as RoomIssueCategory)}>
                  <SelectTrigger id="issue-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="facility">Cơ sở vật chất</SelectItem>
                    <SelectItem value="utility">Tiện ích</SelectItem>
                    <SelectItem value="neighbor">Hàng xóm</SelectItem>
                    <SelectItem value="noise">Tiếng ồn</SelectItem>
                    <SelectItem value="security">An ninh</SelectItem>
                    <SelectItem value="other">Khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="issue-title">Tiêu đề</Label>
                <Input
                  id="issue-title"
                  placeholder="VD: Rò rỉ nước ở phòng tắm"
                  value={issueTitle}
                  onChange={(e) => setIssueTitle(e.target.value)}
                  maxLength={120}
                />
                <div className="text-xs text-muted-foreground">
                  {issueTitle.length}/120 ký tự
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowReportIssueDialog(false)
                  setIssueTitle('')
                  setIssueCategory('other')
                }}
                disabled={submittingIssue}
              >
                Hủy
              </Button>
              <Button onClick={handleSubmitRoomIssue} disabled={submittingIssue}>
                {submittingIssue ? 'Đang gửi...' : 'Gửi báo cáo'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function RentalDetailPageContent() {
  return (
    <DashboardLayout userType="tenant">
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Chi tiết hợp đồng thuê</h1>
          <p className="text-gray-600">Xem thông tin chi tiết về hợp đồng thuê trọ</p>
        </div>
        <RentalDetailContent />
      </div>
    </DashboardLayout>
  )
}

export default function RentalDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Đang tải...</p>
        </div>
      </div>
    }>
      <RentalDetailPageContent />
    </Suspense>
  )
}
