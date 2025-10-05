"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Search,
  Plus,
  RotateCcw,
  AlertCircle,
  FileText,
  Eye,
  FileCheck,
} from "lucide-react"
import { useRentalStore } from "@/stores/rentalStore"
import { useContractStore } from "@/stores/contractStore"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

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
  const [showContractDialog, setShowContractDialog] = useState(false)
  const [selectedRental, setSelectedRental] = useState<string | null>(null)

  const {
    landlordRentals,
    loadingLandlord,
    errorLandlord,
    //submitting,
    loadLandlordRentals,
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

  const handleGenerateContract = async (rentalId: string) => {
    const success = await autoGenerate(rentalId)
    if (success) {
      setShowContractDialog(false)
      setSelectedRental(null)
      // Reload rentals to update contract status
      await loadLandlordRentals()
    }
  }

  const handleViewDetail = (rentalId: string) => {
    window.open(`/dashboard/landlord/rentals/${rentalId}`, '_blank')
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

        {/* Rentals Table */}
        {!loadingLandlord && filteredRentals.length > 0 && (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Mã Rental</TableHead>
                      <TableHead className="min-w-[150px]">Người thuê</TableHead>
                      <TableHead className="min-w-[180px]">Phòng/Tòa nhà</TableHead>
                      <TableHead className="min-w-[120px]">Số phòng</TableHead>
                      <TableHead className="text-right min-w-[120px]">Tiền thuê</TableHead>
                      <TableHead className="text-right min-w-[120px]">Tiền cọc</TableHead>
                      <TableHead className="min-w-[110px]">Ngày bắt đầu</TableHead>
                      <TableHead className="min-w-[110px]">Ngày kết thúc</TableHead>
                      <TableHead className="min-w-[120px]">Trạng thái</TableHead>
                      <TableHead className="text-center min-w-[100px]">Hợp đồng</TableHead>
                      <TableHead className="text-center min-w-[200px]">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
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
                        <TableRow key={rental.id}>
                          <TableCell className="font-medium">
                            {rental.id?.slice(-8)}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{tenantName}</div>
                              {rental.tenant?.email && (
                                <div className="text-xs text-gray-500">{rental.tenant.email}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{roomName}</div>
                              <div className="text-xs text-gray-500">{buildingName}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{roomNumber}</Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium text-green-600">
                            {monthlyRent.toLocaleString('vi-VN')} đ
                          </TableCell>
                          <TableCell className="text-right font-medium text-blue-600">
                            {depositPaid.toLocaleString('vi-VN')} đ
                          </TableCell>
                          <TableCell>
                            {startDate
                              ? new Date(startDate).toLocaleDateString('vi-VN')
                              : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {endDate
                              ? new Date(endDate).toLocaleDateString('vi-VN')
                              : 'Không xác định'}
                          </TableCell>
                          <TableCell>
                            <Badge className={STATUS_COLORS[rental.status as keyof typeof STATUS_COLORS] || 'bg-gray-100 text-gray-800'}>
                              {STATUS_LABELS[rental.status as keyof typeof STATUS_LABELS] || rental.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
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
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewDetail(rental.id!)}
                                className="flex items-center gap-1"
                              >
                                <Eye className="h-3 w-3" />
                                Xem
                              </Button>
                              {!hasContract && rental.status === 'active' && (
                                <Dialog
                                  open={showContractDialog && selectedRental === rental.id}
                                  onOpenChange={(open) => {
                                    setShowContractDialog(open)
                                    if (!open) setSelectedRental(null)
                                  }}
                                >
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="default"
                                      size="sm"
                                      onClick={() => setSelectedRental(rental.id!)}
                                      className="flex items-center gap-1"
                                    >
                                      <FileText className="h-3 w-3" />
                                      Tạo HĐ
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Tạo hợp đồng từ cho thuê</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <p>Bạn có muốn tạo hợp đồng từ thông tin cho thuê này không?</p>
                                      <div className="flex space-x-2">
                                        <Button
                                          onClick={() => handleGenerateContract(rental.id!)}
                                          disabled={contractSubmitting}
                                          className="flex-1"
                                        >
                                          {contractSubmitting ? 'Đang tạo...' : 'Tạo hợp đồng'}
                                        </Button>
                                        <Button
                                          variant="outline"
                                          onClick={() => {
                                            setShowContractDialog(false)
                                            setSelectedRental(null)
                                          }}
                                          className="flex-1"
                                        >
                                          Hủy
                                        </Button>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
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
      </div>
    </DashboardLayout>
  )
}
