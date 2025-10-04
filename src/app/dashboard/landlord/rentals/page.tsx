"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Search,
  Calendar,
  Home,
  DollarSign,
  Clock,
  Plus,
  RotateCcw,
  AlertCircle,
  FileText,
  Edit,
  StopCircle,
  RefreshCw
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
    submitting,
    loadLandlordRentals,
    terminate,
    renew,
    clearErrors
  } = useRentalStore()

  const {
    autoGenerate,
    submitting: contractSubmitting
  } = useContractStore()

  useEffect(() => {
    loadLandlordRentals()
  }, [loadLandlordRentals])

  const filteredRentals = landlordRentals.filter(rental => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch =
      rental.tenant?.firstName?.toLowerCase().includes(searchLower) ||
      rental.tenant?.lastName?.toLowerCase().includes(searchLower) ||
      rental.room?.name?.toLowerCase().includes(searchLower) ||
      rental.room?.roomType?.toLowerCase().includes(searchLower)

    const matchesStatus = statusFilter === 'all' || rental.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getDaysUntilExpiry = (endDate: string) => {
    const end = new Date(endDate)
    const today = new Date()
    const diffTime = end.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const handleGenerateContract = async (rentalId: string) => {
    const success = await autoGenerate(rentalId)
    if (success) {
      setShowContractDialog(false)
      setSelectedRental(null)
      // Reload rentals to update contract status
      await loadLandlordRentals()
    }
  }

  const handleTerminate = async (rentalId: string) => {
    const confirmTerminate = window.confirm('Bạn có chắc chắn muốn chấm dứt hợp đồng thuê này?')
    if (confirmTerminate) {
      const success = await terminate(rentalId, {
        status: 'terminated',
        reason: 'Chấm dứt theo yêu cầu của chủ nhà',
        terminationDate: new Date().toISOString().split('T')[0]
      })
      if (success) {
        await loadLandlordRentals()
      }
    }
  }

  const handleRenew = async (rentalId: string) => {
    const months = window.prompt('Gia hạn bao nhiều tháng?', '12')
    if (months && parseInt(months) > 0) {
      // Calculate new end date by adding months to current date
      const currentDate = new Date()
      const newEndDate = new Date(currentDate.setMonth(currentDate.getMonth() + parseInt(months)))

      const success = await renew(rentalId, {
        newEndDate: newEndDate.toISOString().split('T')[0]
      })
      if (success) {
        await loadLandlordRentals()
      }
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

          <Button className="flex items-center space-x-2">
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
        {!loadingLandlord && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredRentals.map((rental) => {
              const daysUntilExpiry = getDaysUntilExpiry(rental.endDate)
              const isExpiringSoon = daysUntilExpiry <= 30 && daysUntilExpiry > 0
              const hasContract = rental.contract != null

              const tenantName = rental.tenant
                ? `${rental.tenant.firstName} ${rental.tenant.lastName}`
                : 'Chưa có thông tin'

              const roomInfo = rental.room
                ? `${rental.room.name || 'N/A'} - ${rental.room.roomType || 'N/A'}`
                : 'Chưa có thông tin'

              return (
                <Card key={rental.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Home className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">HD-{rental.id?.slice(-6)}</CardTitle>
                          <Badge className={STATUS_COLORS[rental.status as keyof typeof STATUS_COLORS] || 'bg-gray-100 text-gray-800'}>
                            {STATUS_LABELS[rental.status as keyof typeof STATUS_LABELS] || rental.status}
                          </Badge>
                        </div>
                      </div>
                      {hasContract && (
                        <Badge variant="outline" className="text-blue-600 border-blue-200">
                          <FileText className="h-3 w-3 mr-1" />
                          Có HĐ
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={rental.tenant?.avatarUrl || ''} alt={tenantName} />
                          <AvatarFallback className="bg-green-100 text-green-600 text-xs">
                            {tenantName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">{tenantName}</span>
                      </div>

                      <div className="flex items-center space-x-2 text-sm">
                        <span className="text-gray-600">Phòng:</span>
                        <span className="font-medium">{roomInfo}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-gray-600">Bắt đầu</p>
                            <p className="font-medium">
                              {new Date(rental.startDate).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-gray-600">Kết thúc</p>
                            <p className="font-medium">
                              {new Date(rental.endDate).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-gray-600">Tiền thuê</p>
                            <p className="font-medium text-green-600">
                              {(rental.monthlyRent || 0).toLocaleString('vi-VN')} VNĐ
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-gray-600">Tiền cọc</p>
                            <p className="font-medium text-blue-600">
                              {(rental.depositAmount || 0).toLocaleString('vi-VN')} VNĐ
                            </p>
                          </div>
                        </div>
                      </div>

                      {rental.createdAt && (
                        <div className="flex items-center space-x-2 text-sm">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-500">
                            Tạo lúc: {new Date(rental.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      )}

                      {isExpiringSoon && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                          <p className="text-yellow-800 text-xs font-medium">
                            ⚠ Hợp đồng sẽ hết hạn sau {daysUntilExpiry} ngày
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex flex-col space-y-2">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => window.open(`/dashboard/landlord/rentals/${rental.id}`, '_blank')}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Chỉnh sửa
                        </Button>
                        {!hasContract && rental.status === 'active' && (
                          <Dialog open={showContractDialog && selectedRental === rental.id} onOpenChange={(open) => {
                            setShowContractDialog(open)
                            if (!open) setSelectedRental(null)
                          }}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => setSelectedRental(rental.id!)}
                              >
                                <FileText className="h-4 w-4 mr-1" />
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

                      {rental.status === 'active' && (
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleRenew(rental.id!)}
                            disabled={submitting}
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Gia hạn
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-red-600 hover:bg-red-50"
                            onClick={() => handleTerminate(rental.id!)}
                            disabled={submitting}
                          >
                            <StopCircle className="h-4 w-4 mr-1" />
                            Chấm dứt
                          </Button>
                        </div>
                      )}
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
              {landlordRentals.length === 0
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