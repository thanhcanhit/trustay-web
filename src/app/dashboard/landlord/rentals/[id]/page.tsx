"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Building2,
  Calendar,
  CreditCard,
  FileText,
  Home,
  Loader2,
  Mail,
  Phone,
  User,
  AlertCircle,
} from "lucide-react"
import { useRentalStore } from "@/stores/rentalStore"
import { Alert, AlertDescription } from "@/components/ui/alert"

const STATUS_COLORS = {
  active: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  expired: 'bg-red-100 text-red-800',
  terminated: 'bg-gray-100 text-gray-800',
}

const STATUS_LABELS = {
  active: 'Đang hoạt động',
  pending: 'Chờ xác nhận',
  expired: 'Hết hạn',
  terminated: 'Đã chấm dứt',
}

export default function RentalDetailPage() {
  const params = useParams()
  const router = useRouter()
  const rentalId = params?.id as string

  const {
    current: rental,
    loadingCurrent: loading,
    errorCurrent: error,
    loadById,
  } = useRentalStore()

  useEffect(() => {
    if (rentalId) {
      loadById(rentalId)
    }
  }, [rentalId, loadById])

  if (loading) {
    return (
      <DashboardLayout userType="landlord">
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
            <span className="text-gray-500">Đang tải thông tin...</span>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !rental) {
    return (
      <DashboardLayout userType="landlord">
        <div className="px-6 py-12">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || 'Không tìm thấy thông tin cho thuê'}
            </AlertDescription>
          </Alert>
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/landlord/rentals')}
            className="mt-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  // Parse monetary values
  const monthlyRent = rental.monthlyRent ? parseFloat(rental.monthlyRent) : 0
  const depositPaid = rental.depositPaid ? parseFloat(rental.depositPaid) : 0

  // Get dates
  const startDate = rental.contractStartDate || rental.startDate
  const endDate = rental.contractEndDate || rental.endDate

  return (
    <DashboardLayout userType="landlord">
      <div className="px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard/landlord/rentals')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại danh sách
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Chi tiết hợp đồng cho thuê
              </h1>
              <p className="text-gray-600">Mã: {rental.id?.slice(-8)}</p>
            </div>
            <Badge className={STATUS_COLORS[rental.status as keyof typeof STATUS_COLORS] || 'bg-gray-100 text-gray-800'}>
              {STATUS_LABELS[rental.status as keyof typeof STATUS_LABELS] || rental.status}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tenant Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Thông tin người thuê
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-gray-500">Họ và tên</label>
                <p className="font-medium">
                  {rental.tenant?.firstName} {rental.tenant?.lastName}
                </p>
              </div>
              {rental.tenant?.email && (
                <div>
                  <label className="text-sm text-gray-500 flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    Email
                  </label>
                  <p className="font-medium">{rental.tenant.email}</p>
                </div>
              )}
              {rental.tenant?.phone && (
                <div>
                  <label className="text-sm text-gray-500 flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    Số điện thoại
                  </label>
                  <p className="font-medium">{rental.tenant.phone}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Owner Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Thông tin chủ trọ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-gray-500">Họ và tên</label>
                <p className="font-medium">
                  {rental.owner?.firstName} {rental.owner?.lastName}
                </p>
              </div>
              {rental.owner?.email && (
                <div>
                  <label className="text-sm text-gray-500 flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    Email
                  </label>
                  <p className="font-medium">{rental.owner.email}</p>
                </div>
              )}
              {rental.owner?.phone && (
                <div>
                  <label className="text-sm text-gray-500 flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    Số điện thoại
                  </label>
                  <p className="font-medium">{rental.owner.phone}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Room Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Thông tin phòng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-gray-500">Tên phòng</label>
                <p className="font-medium">{rental.roomInstance?.room?.name || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Số phòng</label>
                <p className="font-medium">
                  <Badge variant="outline">{rental.roomInstance?.roomNumber || 'N/A'}</Badge>
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500 flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  Tòa nhà
                </label>
                <p className="font-medium">{rental.roomInstance?.room?.building?.name || 'N/A'}</p>
              </div>
              {rental.roomInstance?.room?.floorNumber && (
                <div>
                  <label className="text-sm text-gray-500">Tầng</label>
                  <p className="font-medium">Tầng {rental.roomInstance.room.floorNumber}</p>
                </div>
              )}
              {rental.roomInstance?.room?.areaSqm && (
                <div>
                  <label className="text-sm text-gray-500">Diện tích</label>
                  <p className="font-medium">{rental.roomInstance.room.areaSqm} m²</p>
                </div>
              )}
              {rental.roomInstance?.room?.maxOccupancy && (
                <div>
                  <label className="text-sm text-gray-500">Sức chứa tối đa</label>
                  <p className="font-medium">{rental.roomInstance.room.maxOccupancy} người</p>
                </div>
              )}
              <div>
                <label className="text-sm text-gray-500">Trạng thái phòng</label>
                <p className="font-medium">
                  <Badge variant="outline" className={
                    rental.roomInstance?.status === 'occupied' ? 'bg-yellow-50 text-yellow-700' :
                    rental.roomInstance?.status === 'available' ? 'bg-green-50 text-green-700' :
                    'bg-gray-50 text-gray-700'
                  }>
                    {rental.roomInstance?.status === 'occupied' ? 'Đang cho thuê' :
                     rental.roomInstance?.status === 'available' ? 'Còn trống' :
                     rental.roomInstance?.status || 'N/A'}
                  </Badge>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Financial Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Thông tin tài chính
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-gray-500">Tiền thuê hàng tháng</label>
                <p className="text-2xl font-bold text-green-600">
                  {monthlyRent.toLocaleString('vi-VN')} đ
                </p>
              </div>
              <Separator />
              <div>
                <label className="text-sm text-gray-500">Tiền cọc đã đặt</label>
                <p className="text-2xl font-bold text-blue-600">
                  {depositPaid.toLocaleString('vi-VN')} đ
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contract Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Thông tin thời gian
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-gray-500">Ngày bắt đầu</label>
                <p className="font-medium">
                  {startDate
                    ? new Date(startDate).toLocaleDateString('vi-VN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'N/A'}
                </p>
              </div>
              <Separator />
              <div>
                <label className="text-sm text-gray-500">Ngày kết thúc</label>
                <p className="font-medium">
                  {endDate
                    ? new Date(endDate).toLocaleDateString('vi-VN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'Không xác định'}
                </p>
              </div>
              {rental.createdAt && (
                <>
                  <Separator />
                  <div>
                    <label className="text-sm text-gray-500">Ngày tạo</label>
                    <p className="font-medium">
                      {new Date(rental.createdAt).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Booking Request Information */}
          {rental.bookingRequest && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Yêu cầu đặt phòng
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500">Mã yêu cầu</label>
                  <p className="font-medium font-mono text-sm">
                    {rental.bookingRequest.id?.slice(-8)}
                  </p>
                </div>
                {rental.bookingRequest.moveInDate && (
                  <div>
                    <label className="text-sm text-gray-500">Ngày dự kiến chuyển vào</label>
                    <p className="font-medium">
                      {new Date(rental.bookingRequest.moveInDate).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                )}
                {rental.bookingRequest.moveOutDate && (
                  <div>
                    <label className="text-sm text-gray-500">Ngày dự kiến chuyển ra</label>
                    <p className="font-medium">
                      {new Date(rental.bookingRequest.moveOutDate).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Additional Information */}
          {(rental.contractDocumentUrl || rental.terminationReason) && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Thông tin bổ sung
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {rental.contractDocumentUrl && (
                  <div>
                    <label className="text-sm text-gray-500">Tài liệu hợp đồng</label>
                    <p>
                      <a
                        href={rental.contractDocumentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Xem tài liệu
                      </a>
                    </p>
                  </div>
                )}
                {rental.terminationReason && (
                  <div>
                    <label className="text-sm text-gray-500">Lý do chấm dứt</label>
                    <p className="font-medium">{rental.terminationReason}</p>
                  </div>
                )}
                {rental.terminationNoticeDate && (
                  <div>
                    <label className="text-sm text-gray-500">Ngày thông báo chấm dứt</label>
                    <p className="font-medium">
                      {new Date(rental.terminationNoticeDate).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
