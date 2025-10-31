"use client"

import { Suspense, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Home,
  Calendar,
  DollarSign,
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
  Info
} from "lucide-react"
import { useRentalStore } from "@/stores/rentalStore"
//import { Rental} from "@/types/rental.types"
import { RentalStatus } from "@/types/types"

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
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return 'N/A'
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
  } = useRentalStore()

  useEffect(() => {
    if (rentalId) {
      loadById(rentalId)
    }
    return () => {
      clearCurrent()
    }
  }, [rentalId, loadById, clearCurrent])

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
        <Badge className={RENTAL_STATUS_CONFIG[rental.status].className}>
          {RENTAL_STATUS_CONFIG[rental.status].label}
        </Badge>
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

      {/* Room Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Thông tin phòng trọ
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
            <div className="p-3 bg-blue-200 rounded-lg">
              <MapPin className="h-6 w-6 text-blue-700" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">
                {rental.roomInstance?.room?.name || 'N/A'}
              </h3>
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Building2 className="h-4 w-4" />
                <span>{rental.roomInstance?.room?.building?.name || 'N/A'}</span>
              </div>
              {rental.roomInstance?.roomNumber && (
                <p className="text-sm text-gray-600">
                  Phòng số: <span className="font-medium">{rental.roomInstance.roomNumber}</span>
                </p>
              )}
              {rental.roomInstance?.room?.description && (
                <p className="text-sm text-gray-600 mt-2">
                  {rental.roomInstance.room.description}
                </p>
              )}
            </div>
          </div>

          {rental.roomInstance?.room && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm text-gray-600">Loại phòng</p>
                <p className="font-medium capitalize">{rental.roomInstance.room.roomType || 'N/A'}</p>
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

      {/* Rental Contract Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Thông tin hợp đồng
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Financial Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
              <div className="p-3 bg-green-200 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-700" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tiền thuê hàng tháng</p>
                <p className="text-xl font-bold text-green-700">
                  {formatCurrency(rental.monthlyRent)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <div className="p-3 bg-blue-200 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-700" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tiền cọc đã đặt</p>
                <p className="text-xl font-bold text-blue-700">
                  {formatCurrency(rental.depositPaid)}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Contract Dates */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Thời hạn hợp đồng
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Ngày bắt đầu</p>
                <p className="font-semibold">{formatDate(rental.contractStartDate)}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Ngày kết thúc</p>
                <p className="font-semibold">{formatDate(rental.contractEndDate)}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Thời hạn</p>
                <p className="font-semibold">{getDuration()}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Contract Metadata */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Info className="h-4 w-4" />
              Thông tin khác
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between p-2">
                <span className="text-gray-600">Mã hợp đồng:</span>
                <span className="font-medium">#{rental.id.slice(0, 8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between p-2">
                <span className="text-gray-600">Ngày tạo:</span>
                <span className="font-medium">{formatDate(rental.createdAt)}</span>
              </div>
              {rental.contractDocumentUrl && (
                <div className="col-span-2 p-2">
                  <Button variant="outline" className="w-full" asChild>
                    <a href={rental.contractDocumentUrl} target="_blank" rel="noopener noreferrer">
                      <FileText className="h-4 w-4 mr-2" />
                      Xem tài liệu hợp đồng
                    </a>
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Termination Info */}
          {rental.terminationNoticeDate && (
            <>
              <Separator />
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-medium text-red-800 mb-2">Thông tin chấm dứt hợp đồng</h4>
                <div className="space-y-2 text-sm">
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

      {/* Tenant Information */}
      {rental.tenant && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Thông tin người thuê
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Họ tên:</span>
                <span className="font-medium">
                  {rental.tenant.lastName} {rental.tenant.firstName}
                </span>
              </div>
              {rental.tenant.email && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email:
                  </span>
                  <span className="font-medium">{rental.tenant.email}</span>
                </div>
              )}
              {rental.tenant.phone && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Số điện thoại:
                  </span>
                  <span className="font-medium">{rental.tenant.phone}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
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
