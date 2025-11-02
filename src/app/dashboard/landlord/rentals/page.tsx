"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Plus,
  RotateCcw,
  AlertCircle,
  FileText,
  Eye,
  FileCheck,
  ExternalLink,
  Edit,
  XCircle,
  Home,
  User,
  Calendar,
  DollarSign,
} from "lucide-react"
import { useRentalStore } from "@/stores/rentalStore"
import { useContractStore } from "@/stores/contractStore"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ContractCreationForm } from "@/components/contract/ContractCreationForm"
import { toast } from "sonner"
import { Rental, UpdateRentalRequest, TerminateRentalRequest } from "@/types/rental.types"
import { UpdateRentalDialog } from "@/components/rental/UpdateRentalDialog"
import { TerminateRentalDialog } from "@/components/rental/TerminateRentalDialog"

const STATUS_COLORS = {
  active: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  expired: 'bg-red-100 text-red-800',
  terminated: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800'
}

const STATUS_LABELS = {
  active: 'Đang hoạt động',
  pending: 'Chờ xác nhận',
  expired: 'Hết hạn',
  terminated: 'Đã chấm dứt',
  cancelled: 'Đã hủy'
}

export default function RentalsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showFormDialog, setShowFormDialog] = useState(false)
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null)
  const [showUpdateDialog, setShowUpdateDialog] = useState(false)
  const [showTerminateDialog, setShowTerminateDialog] = useState(false)

  const {
    landlordRentals,
    loadingLandlord,
    errorLandlord,
    submitting,
    loadLandlordRentals,
    update,
    terminate,
    clearErrors
  } = useRentalStore()

  const {
    autoGenerate,
    submitting: contractSubmitting
  } = useContractStore()

  useEffect(() => {
    loadLandlordRentals()
  }, [loadLandlordRentals])

  const filteredRentals = (landlordRentals || []).filter(rental => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch =
      rental.tenant?.firstName?.toLowerCase().includes(searchLower) ||
      rental.tenant?.lastName?.toLowerCase().includes(searchLower) ||
      rental.tenant?.email?.toLowerCase().includes(searchLower) ||
      rental.roomInstance?.room?.name?.toLowerCase().includes(searchLower) ||
      rental.roomInstance?.room?.building?.name?.toLowerCase().includes(searchLower) ||
      rental.roomInstance?.roomNumber?.toLowerCase().includes(searchLower) ||
      rental.id?.toLowerCase().includes(searchLower)

    const matchesStatus = statusFilter === 'all' || rental.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleOpenContractForm = (rental: Rental) => {
    setSelectedRental(rental)
    setShowFormDialog(true)
  }

  const handleGenerateContract = async (formData: {
    financial: {
      monthlyRent: number;
      deposit: number;
      depositMonths: number;
      paymentMethod: string;
      paymentDueDate: number;
      electricityPrice: number;
      waterPrice: number;
      internetPrice?: number;
      parkingFee?: number;
    };
    terms: {
      utilities: string[];
      restrictions: string[];
      rules: string[];
      landlordResponsibilities: string[];
      tenantResponsibilities: string[];
    };
    emergencyContact?: {
      name: string;
      phone: string;
    };
    specialNote?: string;
  }) => {
    if (!selectedRental?.id) {
      toast.error('Không tìm thấy thông tin cho thuê')
      return
    }

    // Prepare contract data to send to backend
    const additionalContractData = {
      financial: formData.financial,
      terms: {
        ...formData.terms,
        responsibilities: {
          landlord: formData.terms.landlordResponsibilities,
          tenant: formData.terms.tenantResponsibilities
        }
      },
      emergencyContact: formData.emergencyContact,
      specialNote: formData.specialNote
    }

    const success = await autoGenerate(selectedRental.id, additionalContractData)
    if (success) {
      toast.success('Tạo hợp đồng thành công!')
      setShowFormDialog(false)
      setSelectedRental(null)
      // Reload rentals to update contract status
      await loadLandlordRentals()
    } else {
      toast.error('Không thể tạo hợp đồng')
    }
  }

  const handleViewDetail = (rentalId: string) => {
    window.open(`/dashboard/landlord/rentals/${rentalId}`, '_blank')
  }

  const handleViewRoomPost = (roomId: string) => {
    window.open(`/rooms/${roomId}`, '_blank')
  }

  const handleOpenUpdateDialog = (rental: Rental) => {
    setSelectedRental(rental)
    setShowUpdateDialog(true)
  }

  const handleOpenTerminateDialog = (rental: Rental) => {
    setSelectedRental(rental)
    setShowTerminateDialog(true)
  }

  const handleUpdateRental = async (rentalId: string, data: UpdateRentalRequest) => {
    const success = await update(rentalId, data)
    if (success) {
      toast.success('Cập nhật hợp đồng cho thuê thành công!')
      setShowUpdateDialog(false)
      setSelectedRental(null)
      await loadLandlordRentals()
    } else {
      toast.error('Không thể cập nhật hợp đồng cho thuê')
    }
  }

  const handleTerminateRental = async (rentalId: string, data: TerminateRentalRequest) => {
    const success = await terminate(rentalId, data)
    if (success) {
      toast.success('Chấm dứt hợp đồng cho thuê thành công!')
      setShowTerminateDialog(false)
      setSelectedRental(null)
      await loadLandlordRentals()
    } else {
      toast.error('Không thể chấm dứt hợp đồng cho thuê')
    }
  }

  return (
    <DashboardLayout userType="landlord">
      <div className="px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý cho thuê</h1>
          <p className="text-gray-600">Quản lý tất cả hợp đồng cho thuê trọ</p>
        </div>

        {/* Filters and Actions */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm hợp đồng thuê..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="active">Đang hoạt động</SelectItem>
                <SelectItem value="pending">Chờ xác nhận</SelectItem>
                <SelectItem value="expired">Hết hạn</SelectItem>
                <SelectItem value="terminated">Đã chấm dứt</SelectItem>
                <SelectItem value="cancelled">Đã hủy</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => loadLandlordRentals()}
              disabled={loadingLandlord}
              className="flex items-center space-x-2"
            >
              <RotateCcw className={`h-4 w-4 ${loadingLandlord ? 'animate-spin' : ''}`} />
              <span>Làm mới</span>
            </Button>
          </div>

          <Button 
            className="flex items-center space-x-2"
            onClick={() => window.location.href = '/dashboard/landlord/rental-requests'}
            title="Tạo hợp đồng cho thuê từ yêu cầu thuê trọ"
          >
            <Plus className="h-4 w-4" />
            <span>Tạo hợp đồng cho thuê mới</span>
          </Button>
        </div>

        {/* Error Display */}
        {errorLandlord && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {errorLandlord}
              <Button
                variant="outline"
                size="sm"
                onClick={clearErrors}
                className="ml-2"
              >
                Đóng
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {loadingLandlord && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2">
              <RotateCcw className="h-6 w-6 animate-spin text-gray-500" />
              <span className="text-gray-500">Đang tải hợp đồng cho thuê...</span>
            </div>
          </div>
        )}

        {/* Rentals Grid */}
        {!loadingLandlord && filteredRentals.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredRentals.map((rental) => {
              const hasContract = rental.contract != null
              const tenantName = rental.tenant
                ? `${rental.tenant.firstName} ${rental.tenant.lastName}`
                : 'Chưa có thông tin'

              // Get room info from roomInstance
              const roomName = rental.roomInstance?.room?.name || 'N/A'
              const buildingName = rental.roomInstance?.room?.building?.name || 'N/A'
              const roomNumber = rental.roomInstance?.roomNumber || 'N/A'

              // Parse monthly rent and deposit
              const monthlyRent = rental.monthlyRent ? parseFloat(rental.monthlyRent) : 0
              const depositPaid = rental.depositPaid ? parseFloat(rental.depositPaid) : 0

              // Get dates
              const startDate = rental.contractStartDate || rental.startDate
              const endDate = rental.contractEndDate || rental.endDate

              return (
                <Card key={rental.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Home className="h-4 w-4 text-gray-500" />
                          <h3 className="font-semibold text-lg">{roomName}</h3>
                          {rental.roomInstance?.room?.id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewRoomPost(rental.roomInstance!.room!.id)}
                              className="h-6 w-6 p-0"
                              title="Xem bài đăng"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{buildingName}</p>
                        <Badge variant="outline" className="mt-2">{roomNumber}</Badge>
                      </div>
                      <Badge className={STATUS_COLORS[rental.status as keyof typeof STATUS_COLORS] || 'bg-gray-100 text-gray-800'}>
                        {STATUS_LABELS[rental.status as keyof typeof STATUS_LABELS] || rental.status}
                      </Badge>
                    </div>

                    {/* Tenant Info */}
                    <div className="mb-4 pb-4 border-b">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">Người thuê</span>
                      </div>
                      <p className="font-medium ml-6">{tenantName}</p>
                      {rental.tenant?.email && (
                        <p className="text-xs text-gray-500 ml-6">{rental.tenant.email}</p>
                      )}
                    </div>

                    {/* Financial Info */}
                    <div className="mb-4 pb-4 border-b space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">Tiền thuê</span>
                        </div>
                        <span className="font-semibold text-green-600">
                          {monthlyRent.toLocaleString('vi-VN')} đ
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">Tiền cọc</span>
                        </div>
                        <span className="font-semibold text-blue-600">
                          {depositPaid.toLocaleString('vi-VN')} đ
                        </span>
                      </div>
                    </div>

                    {/* Date Info */}
                    <div className="mb-4 pb-4 border-b space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Ngày bắt đầu:</span>
                        <span className="text-sm font-medium">
                          {startDate ? new Date(startDate).toLocaleDateString('vi-VN') : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Ngày kết thúc:</span>
                        <span className="text-sm font-medium">
                          {endDate ? new Date(endDate).toLocaleDateString('vi-VN') : 'Không xác định'}
                        </span>
                      </div>
                    </div>

                    {/* Contract Status */}
                    <div className="mb-4 flex items-center justify-between">
                      <span className="text-sm text-gray-600">Hợp đồng:</span>
                      {hasContract ? (
                        <Badge variant="outline" className="text-blue-600 border-blue-200">
                          <FileCheck className="h-3 w-3 mr-1" />
                          Có
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-500 border-gray-200">
                          Chưa có
                        </Badge>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetail(rental.id!)}
                        className="flex items-center gap-1 flex-1"
                      >
                        <Eye className="h-3 w-3" />
                        Xem
                      </Button>
                      {!hasContract && rental.status === 'active' && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleOpenContractForm(rental)}
                          className="flex items-center gap-1 flex-1"
                        >
                          <FileText className="h-3 w-3" />
                          Tạo HĐ
                        </Button>
                      )}
                      {rental.status === 'active' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenUpdateDialog(rental)}
                            className="flex items-center gap-1"
                          >
                            <Edit className="h-3 w-3" />
                            Sửa
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleOpenTerminateDialog(rental)}
                            className="flex items-center gap-1"
                          >
                            <XCircle className="h-3 w-3" />
                            Chấm dứt
                          </Button>
                        </>
                      )}
                    </div>

                    {/* Rental ID */}
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-gray-400">ID: {rental.id?.slice(-8)}</p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {!loadingLandlord && filteredRentals.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              {(landlordRentals || []).length === 0
                ? 'Chưa có hợp đồng cho thuê nào'
                : 'Không tìm thấy hợp đồng cho thuê phù hợp'
              }
            </div>
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Tạo hợp đồng cho thuê đầu tiên</span>
            </Button>
          </div>
        )}

        {/* Contract Creation Form Dialog */}
        <Dialog open={showFormDialog} onOpenChange={(open) => {
          if (!open) {
            setShowFormDialog(false)
            setSelectedRental(null)
          }
        }}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tạo hợp đồng từ cho thuê</DialogTitle>
              <DialogDescription>
                {selectedRental && (
                  <span>
                    Phòng: {selectedRental.roomInstance?.room?.name} ({selectedRental.roomInstance?.roomNumber}) -
                    Người thuê: {selectedRental.tenant?.firstName} {selectedRental.tenant?.lastName}
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>

            {selectedRental && (
              <ContractCreationForm
                initialMonthlyRent={selectedRental.monthlyRent ? parseFloat(selectedRental.monthlyRent) : 0}
                initialDeposit={selectedRental.depositPaid ? parseFloat(selectedRental.depositPaid) : 0}
                onSubmit={handleGenerateContract}
                onCancel={() => {
                  setShowFormDialog(false)
                  setSelectedRental(null)
                }}
                isSubmitting={contractSubmitting}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Update Rental Dialog */}
        <UpdateRentalDialog
          rental={selectedRental}
          open={showUpdateDialog}
          onOpenChange={setShowUpdateDialog}
          onSubmit={handleUpdateRental}
          isSubmitting={submitting}
        />

        {/* Terminate Rental Dialog */}
        <TerminateRentalDialog
          rental={selectedRental}
          open={showTerminateDialog}
          onOpenChange={setShowTerminateDialog}
          onSubmit={handleTerminateRental}
          isSubmitting={submitting}
        />
      </div>
    </DashboardLayout>
  )
}
