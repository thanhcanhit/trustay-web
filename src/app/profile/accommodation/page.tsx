"use client"

import { Suspense, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Home, FileText, Calendar, DollarSign, User, MapPin, Clock, Loader2, AlertCircle, Star } from "lucide-react"
import { ProfileLayout } from "@/components/profile/profile-layout"
import { useRentalStore } from "@/stores/rentalStore"
import { useContractStore } from "@/stores/contractStore"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Contract } from "@/types/types"
import Link from "next/link"

const RENTAL_STATUS_COLORS = {
  active: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  expired: 'bg-red-100 text-red-800',
  terminated: 'bg-gray-100 text-gray-800',
}

const RENTAL_STATUS_LABELS = {
  active: 'Đang thuê',
  pending: 'Chờ xác nhận',
  expired: 'Hết hạn',
  terminated: 'Đã chấm dứt',
}

const CONTRACT_STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-800',
  pending_signatures: 'bg-yellow-100 text-yellow-800',
  active: 'bg-green-100 text-green-800',
  expired: 'bg-red-100 text-red-800',
  terminated: 'bg-red-100 text-red-800',
}

const CONTRACT_STATUS_LABELS = {
  draft: 'Bản nháp',
  pending_signatures: 'Chờ ký',
  active: 'Đang hiệu lực',
  expired: 'Hết hạn',
  terminated: 'Đã chấm dứt',
}

// Helper function to safely format dates
const formatDate = (dateStr: string | null | undefined, formatStr: string = 'dd/MM/yyyy') => {
  if (!dateStr) return 'N/A'
  try {
    return format(new Date(dateStr), formatStr, { locale: vi })
  } catch {
    return 'N/A'
  }
}

function AccommodationContent() {
  const { tenantRentals, loadingTenant, errorTenant, loadTenantRentals } = useRentalStore()
  const { contracts, loading: loadingContracts, error: errorContracts, loadAll } = useContractStore()

  useEffect(() => {
    loadTenantRentals()
    loadAll()
  }, [loadTenantRentals, loadAll])

  const activeRental = (tenantRentals || []).find(r => r.status === 'active')
  const activeContract = (contracts || []).find((c: Contract) => c.status === 'active')

  if (loadingTenant || loadingContracts) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
          <span className="text-gray-500">Đang tải thông tin lưu trú...</span>
        </div>
      </div>
    )
  }

  if (errorTenant || errorContracts) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <AlertCircle className="h-6 w-6 text-red-600" />
          <div>
            <h3 className="text-lg font-semibold text-red-800">Không thể tải thông tin</h3>
            <p className="text-red-600">{errorTenant || errorContracts}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!activeRental && (tenantRentals || []).length === 0) {
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
            <Button onClick={() => window.location.href = '/'}>
              Tìm phòng trọ
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Active Rental Info */}
      {activeRental && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Home className="h-5 w-5" />
                <span>Thông tin lưu trú hiện tại</span>
              </div>
              <Badge className={RENTAL_STATUS_COLORS[activeRental.status as keyof typeof RENTAL_STATUS_COLORS]}>
                {RENTAL_STATUS_LABELS[activeRental.status as keyof typeof RENTAL_STATUS_LABELS]}
              </Badge>
            </CardTitle>
            <CardDescription>Thông tin về nơi ở đang thuê</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Room & Building Info */}
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">
                    {activeRental.room?.name || 'N/A'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {activeRental.room?.buildingName || 'N/A'}
                  </p>
                  {activeRental.room?.roomType && (
                    <p className="text-sm text-gray-500 mt-1">
                      Loại phòng: {activeRental.room.roomType}
                    </p>
                  )}
                </div>
              </div>

              {/* Landlord Info */}
              {activeRental.landlord && (
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={activeRental.landlord.avatarUrl || ''} />
                    <AvatarFallback className="bg-green-100 text-green-600">
                      <User className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm text-gray-600">Chủ nhà</p>
                    <p className="font-medium">
                      {activeRental.landlord.firstName} {activeRental.landlord.lastName}
                    </p>
                    {activeRental.landlord.phone && (
                      <p className="text-sm text-gray-600">📱 {activeRental.landlord.phone}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Rental Terms */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tiền thuê hàng tháng</p>
                    <p className="font-semibold text-green-600">
                      {(activeRental.monthlyRent || 0).toLocaleString('vi-VN')} VNĐ
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tiền cọc</p>
                    <p className="font-semibold text-blue-600">
                      {(activeRental.depositAmount || 0).toLocaleString('vi-VN')} VNĐ
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ngày bắt đầu</p>
                    <p className="font-semibold">
                      {formatDate(activeRental.startDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ngày kết thúc</p>
                    <p className="font-semibold">
                      {formatDate(activeRental.endDate)}
                    </p>
                  </div>
                </div>
              </div>

              {activeRental.notes && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">Ghi chú:</p>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{activeRental.notes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Contract Info */}
      {activeContract && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Hợp đồng thuê trọ</span>
              </div>
              <Badge className={CONTRACT_STATUS_COLORS[activeContract.status as keyof typeof CONTRACT_STATUS_COLORS]}>
                {CONTRACT_STATUS_LABELS[activeContract.status as keyof typeof CONTRACT_STATUS_LABELS]}
              </Badge>
            </CardTitle>
            <CardDescription>Thông tin hợp đồng thuê trọ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Mã hợp đồng</p>
                <p className="font-medium">HĐ-{activeContract.id?.slice(-8)}</p>
              </div>

              {activeContract.createdAt && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">Ngày tạo</p>
                  <p className="font-medium">
                    {formatDate(activeContract.createdAt)}
                  </p>
                </div>
              )}

              {activeContract.landlordSignature && activeContract.tenantSignature && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-800">Hợp đồng đã được ký</p>
                      {activeContract.fullySignedAt && (
                        <p className="text-xs text-green-700 mt-1">
                          Hoàn thành lúc: {formatDate(activeContract.fullySignedAt, 'dd/MM/yyyy HH:mm')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open(`/dashboard/landlord/contracts/${activeContract.id}`, '_blank')}
              >
                <FileText className="h-4 w-4 mr-2" />
                Xem chi tiết hợp đồng
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Other Rentals */}
      {(tenantRentals || []).length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Lịch sử thuê trọ</CardTitle>
            <CardDescription>Các hợp đồng thuê trước đây</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(tenantRentals || [])
                .filter(r => r.id !== activeRental?.id)
                .map((rental) => {
                  const isCompleted = rental.status === 'expired' || rental.status === 'terminated'
                  
                  return (
                    <div key={rental.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{rental.room?.name || 'N/A'}</p>
                        <p className="text-sm text-gray-600">
                          {formatDate(rental.startDate)} - {formatDate(rental.endDate)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={RENTAL_STATUS_COLORS[rental.status as keyof typeof RENTAL_STATUS_COLORS]}>
                          {RENTAL_STATUS_LABELS[rental.status as keyof typeof RENTAL_STATUS_LABELS]}
                        </Badge>
                        {isCompleted && (
                          <Link href={`/profile/rate-rental/${rental.id}`}>
                            <Button variant="outline" size="sm" className="gap-1">
                              <Star className="h-3 w-3" />
                              Đánh giá
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function AccommodationPageContent() {
  return (
    <ProfileLayout>
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Trọ của tôi</h1>
          <p className="text-gray-600">Thông tin về nơi ở hiện tại và lịch sử thuê trọ</p>
        </div>
        <AccommodationContent />
      </div>
    </ProfileLayout>
  )
}

export default function AccommodationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Đang tải...</p>
        </div>
      </div>
    }>
      <AccommodationPageContent />
    </Suspense>
  )
}
