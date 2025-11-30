"use client"

import { Suspense, useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Home, Calendar, DollarSign, MapPin, Loader2, AlertCircle, ChevronRight, Building2, Phone, Mail, ExternalLink, CalendarCheck, Link2 } from "lucide-react"
import { useRentalStore } from "@/stores/rentalStore"
import { RentalStatus, Rental } from "@/types/types"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { useRouter } from "next/navigation"
import { RenewRentalDialog } from "@/components/rental/RenewRentalDialog"
import { RenewRentalRequest } from "@/types/rental.types"
import { toast } from "sonner"
import { InviteLinkDialog } from "@/components/roommate/InviteLinkDialog"

const RENTAL_STATUS_CONFIG: Record<RentalStatus, { label: string; className: string }> = {
  active: { label: 'Đang thuê', className: 'bg-green-100 text-green-800' },
  pending: { label: 'Chờ xác nhận', className: 'bg-yellow-100 text-yellow-800' },
  expired: { label: 'Hết hạn', className: 'bg-red-100 text-red-800' },
  terminated: { label: 'Đã chấm dứt', className: 'bg-gray-100 text-gray-800' },
}

const formatDate = (dateStr: string | Date | null | undefined, formatStr: string = 'dd/MM/yyyy') => {
  if (!dateStr) return 'N/A'
  try {
    return format(new Date(dateStr), formatStr, { locale: vi })
  } catch {
    return 'N/A'
  }
}

const formatCurrency = (amount: string | number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(Number(amount))
}

function RentalContent() {
  const router = useRouter()
  const { tenantRentals, loadingTenant, errorTenant, submitting, loadTenantRentals, renew } = useRentalStore()
  const [selectedStatus, setSelectedStatus] = useState<RentalStatus | 'all'>('all')
  const [showRenewDialog, setShowRenewDialog] = useState(false)
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null)
  const [showInviteLinkDialog, setShowInviteLinkDialog] = useState(false)

  useEffect(() => {
    loadTenantRentals()
  }, [loadTenantRentals])

  const rentals = tenantRentals || []
  const filteredRentals = selectedStatus === 'all'
    ? rentals
    : rentals.filter(r => r.status === selectedStatus)

  const activeRental = rentals.find(r => r.status === 'active')
  const otherRentals = filteredRentals.filter(r => r.id !== activeRental?.id)

  const handleViewRoomPost = (roomId: string) => {
    window.open(`/rooms/${roomId}`, '_blank')
  }

  const handleOpenRenewDialog = (rental: Rental) => {
    setSelectedRental(rental)
    setShowRenewDialog(true)
  }

  const handleRenewRental = async (rentalId: string, data: RenewRentalRequest) => {
    const success = await renew(rentalId, data)
    if (success) {
      toast.success('Yêu cầu gia hạn đã được gửi đến chủ trọ!')
      setShowRenewDialog(false)
      setSelectedRental(null)
      await loadTenantRentals()
    } else {
      toast.error('Không thể gửi yêu cầu gia hạn')
    }
  }

  if (loadingTenant) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
          <span className="text-gray-500">Đang tải thông tin lưu trú...</span>
        </div>
      </div>
    )
  }

  if (errorTenant) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <AlertCircle className="h-6 w-6 text-red-600" />
          <div>
            <h3 className="text-lg font-semibold text-red-800">Không thể tải thông tin</h3>
            <p className="text-red-600">{errorTenant}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!activeRental && rentals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Home className="h-5 w-5" />
            <span>Thông tin lưu trú</span>
          </CardTitle>
          <CardDescription>
            Thông tin về nơi ở hiện tại (dành cho người thuê trọ)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Home className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có thông tin lưu trú</h3>
            <p className="text-gray-600 mb-4">
              Bạn chưa có hợp đồng thuê nào đang hoạt động
            </p>
            <Button onClick={() => router.push('/rooms')}>
              Tìm phòng trọ
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        <Button
          size="sm"
          variant={selectedStatus === 'all' ? 'default' : 'outline'}
          onClick={() => setSelectedStatus('all')}
        >
          Tất cả ({rentals.length})
        </Button>
        {Object.entries(RENTAL_STATUS_CONFIG).map(([status, config]) => {
          const count = rentals.filter(r => r.status === status).length
          return (
            <Button
              key={status}
              size="sm"
              variant={selectedStatus === status ? 'default' : 'outline'}
              onClick={() => setSelectedStatus(status as RentalStatus)}
            >
              {config.label} ({count})
            </Button>
          )
        })}
      </div>

      {/* Active Rental Info */}
      {activeRental && selectedStatus === 'all' && (
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Home className="h-5 w-5" />
                <span>Thông tin lưu trú hiện tại</span>
              </div>
              <Badge className={RENTAL_STATUS_CONFIG[activeRental.status as RentalStatus].className}>
                {RENTAL_STATUS_CONFIG[activeRental.status as RentalStatus].label}
              </Badge>
            </CardTitle>
            <CardDescription>Nơi ở bạn đang thuê</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Room & Building Info */}
              <div
                className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
                onClick={() => router.push(`/dashboard/tenant/rentals/${activeRental.id}`)}
              >
                <div className="p-3 bg-blue-200 rounded-lg">
                  <MapPin className="h-6 w-6 text-blue-700" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">
                      {activeRental.roomInstance?.room?.name || ''}
                    </h3>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Building2 className="h-4 w-4 text-gray-500" />
                    <p className="text-sm text-gray-600">
                      {activeRental.roomInstance?.room?.building?.name || ''}
                    </p>
                  </div>
                  {activeRental.roomInstance?.roomNumber && (
                    <p className="text-sm text-gray-500 mt-1">
                      Phòng số: {activeRental.roomInstance.roomNumber}
                    </p>
                  )}
                </div>
              </div>

              {/* Landlord Info */}
              {activeRental.owner && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-3">Thông tin chủ nhà</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Họ tên:</span>
                      <span className="font-medium">
                        {activeRental.owner.lastName} {activeRental.owner.firstName}
                      </span>
                    </div>
                    {activeRental.owner.phone && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 flex items-center gap-1">
                          <Phone className="h-3 w-3" /> Số điện thoại:
                        </span>
                        <a href={`tel:${activeRental.owner.phone}`} className="font-medium text-blue-600 hover:underline">
                          {activeRental.owner.phone}
                        </a>
                      </div>
                    )}
                    {activeRental.owner.email && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 flex items-center gap-1">
                          <Mail className="h-3 w-3" /> Email:
                        </span>
                        <a href={`mailto:${activeRental.owner.email}`} className="font-medium text-blue-600 hover:underline">
                          {activeRental.owner.email}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Rental Terms */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <div className="p-2 bg-green-200 rounded-lg">
                    <DollarSign className="h-5 w-5 text-green-700" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tiền thuê hàng tháng</p>
                    <p className="font-semibold text-green-700">
                      {formatCurrency(activeRental.monthlyRent || 0)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <div className="p-2 bg-blue-200 rounded-lg">
                    <DollarSign className="h-5 w-5 text-blue-700" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tiền cọc</p>
                    <p className="font-semibold text-blue-700">
                      {formatCurrency(activeRental.depositPaid || 0)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                  <div className="p-2 bg-purple-200 rounded-lg">
                    <Calendar className="h-5 w-5 text-purple-700" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ngày bắt đầu</p>
                    <p className="font-semibold">
                      {formatDate(activeRental.contractStartDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                  <div className="p-2 bg-orange-200 rounded-lg">
                    <Calendar className="h-5 w-5 text-orange-700" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ngày kết thúc</p>
                    <p className="font-semibold">
                      {activeRental.contractEndDate? formatDate(activeRental.contractEndDate) : 'Chưa xác định'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => router.push(`/dashboard/tenant/rentals/${activeRental.id}`)}
                >
                  Xem chi tiết
                </Button>
                {activeRental.roomInstance?.room?.id && (
                  <Button
                    variant="outline"
                    onClick={() => handleViewRoomPost(activeRental.roomInstance!.room!.id!)}
                    title="Xem bài đăng phòng trọ"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
                {activeRental.status === 'active' && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setShowInviteLinkDialog(true)}
                      title="Tạo link mời roommate"
                    >
                      <Link2 className="h-4 w-4 mr-2" />
                      Mời roommate
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleOpenRenewDialog(activeRental)}
                      title="Yêu cầu gia hạn"
                    >
                      <CalendarCheck className="h-4 w-4 mr-2" />
                      Gia hạn
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Other Rentals */}
      {otherRentals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              {activeRental && selectedStatus === 'all' ? 'Lịch sử thuê trọ' : 'Danh sách hợp đồng thuê'}
            </CardTitle>
            <CardDescription>
              {activeRental && selectedStatus === 'all' ? 'Các hợp đồng thuê trước đây' : 'Tất cả hợp đồng thuê của bạn'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {otherRentals.map((rental) => (
                <div
                  key={rental.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => router.push(`/dashboard/tenant/rentals/${rental.id}`)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{rental.roomInstance?.room?.name || ''}</p>
                      <Badge className={RENTAL_STATUS_CONFIG[rental.status as RentalStatus].className}>
                        {RENTAL_STATUS_CONFIG[rental.status as RentalStatus].label}
                      </Badge>
                      {rental.roomInstance?.room?.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleViewRoomPost(rental.roomInstance!.room!.id)
                          }}
                          className="h-6 w-6 p-0"
                          title="Xem bài đăng"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {rental.roomInstance?.room?.building?.name || ''}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>Từ {formatDate(rental.contractStartDate)}</span>
                      <span>•</span>
                      <span>Đến {formatDate(rental.contractEndDate)}</span>
                      <span>•</span>
                      <span className="font-medium text-green-600">{formatCurrency(rental.monthlyRent || 0)}/tháng</span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Renew Rental Dialog */}
      <RenewRentalDialog
        rental={selectedRental}
        open={showRenewDialog}
        onOpenChange={setShowRenewDialog}
        onSubmit={handleRenewRental}
        isSubmitting={submitting}
      />

      {/* Invite Link Dialog */}
      <InviteLinkDialog
        open={showInviteLinkDialog}
        onOpenChange={setShowInviteLinkDialog}
      />
    </div>
  )
}

function RentalPageContent() {
  return (
    <DashboardLayout userType="tenant">
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Trọ của tôi</h1>
          <p className="text-gray-600">Thông tin về nơi ở hiện tại và lịch sử thuê trọ</p>
        </div>
        <RentalContent />
      </div>
    </DashboardLayout>
  )
}

export default function RentalPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Đang tải...</p>
        </div>
      </div>
    }>
      <RentalPageContent />
    </Suspense>
  )
}
