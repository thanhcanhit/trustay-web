"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Calendar, FileText, DollarSign, Clock, Download, Eye, Plus, RotateCcw, AlertCircle } from "lucide-react"
import { useContractStore } from "@/stores/contractStore"
import { Alert, AlertDescription } from "@/components/ui/alert"


const STATUS_COLORS = {
  active: 'bg-green-100 text-green-800',
  expired: 'bg-red-100 text-red-800',
  pending: 'bg-yellow-100 text-yellow-800',
  terminated: 'bg-gray-100 text-gray-800',
  draft: 'bg-blue-100 text-blue-800',
  signed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
}

const STATUS_LABELS = {
  active: 'Đang hiệu lực',
  expired: 'Hết hạn',
  pending: 'Chờ ký',
  terminated: 'Đã chấm dứt',
  draft: 'Bản nháp',
  signed: 'Đã ký',
  cancelled: 'Đã hủy'
}

export default function ContractsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const {
    landlordContracts,
    loadingLandlord,
    errorLandlord,
    downloading,
    downloadError,
    loadLandlordContracts,
    downloadPDF,
    clearErrors
  } = useContractStore()

  useEffect(() => {
    loadLandlordContracts()
  }, [loadLandlordContracts])

  const filteredContracts = landlordContracts.filter(contract => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch =
      contract.id?.toLowerCase().includes(searchLower) ||
      contract.tenant?.firstName?.toLowerCase().includes(searchLower) ||
      contract.tenant?.lastName?.toLowerCase().includes(searchLower) ||
      contract.room?.name?.toLowerCase().includes(searchLower)

    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getDaysUntilExpiry = (endDate: string) => {
    const end = new Date(endDate)
    const today = new Date()
    const diffTime = end.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const handleDownload = async (contractId: string, contractNumber: string) => {
    try {
      const blob = await downloadPDF(contractId)
      if (blob) {
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${contractNumber}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  return (
    <DashboardLayout userType="landlord">
      <div className="px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý hợp đồng</h1>
          <p className="text-gray-600">Quản lý tất cả hợp đồng thuê trọ</p>
        </div>

        {/* Filters and Actions */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm hợp đồng..."
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
                <SelectItem value="active">Đang hiệu lực</SelectItem>
                <SelectItem value="draft">Bản nháp</SelectItem>
                <SelectItem value="pending">Chờ ký</SelectItem>
                <SelectItem value="signed">Đã ký</SelectItem>
                <SelectItem value="expired">Hết hạn</SelectItem>
                <SelectItem value="terminated">Đã chấm dứt</SelectItem>
                <SelectItem value="cancelled">Đã hủy</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => loadLandlordContracts()}
              disabled={loadingLandlord}
              className="flex items-center space-x-2"
            >
              <RotateCcw className={`h-4 w-4 ${loadingLandlord ? 'animate-spin' : ''}`} />
              <span>Làm mới</span>
            </Button>
          </div>

          <Button className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Tạo hợp đồng mới</span>
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

        {downloadError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {downloadError}
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
              <span className="text-gray-500">Đang tải hợp đồng...</span>
            </div>
          </div>
        )}

        {/* Contracts Grid */}
        {!loadingLandlord && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredContracts.map((contract) => {
              const endDate = contract.endDate
              const daysUntilExpiry = endDate ? getDaysUntilExpiry(endDate) : null
              const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 30 && daysUntilExpiry > 0

              const tenantName = contract.tenant
                ? `${contract.tenant.firstName} ${contract.tenant.lastName}`
                : 'Chưa có thông tin'

              const roomInfo = contract.room
                ? `${contract.room.name || 'N/A'} - ${contract.room.roomType || 'N/A'}`
                : 'Chưa có thông tin'

              return (
                <Card key={contract.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{`HĐ-${contract.id?.slice(-6)}`}</CardTitle>
                          <Badge className={STATUS_COLORS[contract.status as keyof typeof STATUS_COLORS] || 'bg-gray-100 text-gray-800'}>
                            {STATUS_LABELS[contract.status as keyof typeof STATUS_LABELS] || contract.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={contract.tenant?.avatarUrl || ''} alt={tenantName} />
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
                              {contract.startDate
                                ? new Date(contract.startDate).toLocaleDateString('vi-VN')
                                : 'N/A'
                              }
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-gray-600">Kết thúc</p>
                            <p className="font-medium">
                              {endDate
                                ? new Date(endDate).toLocaleDateString('vi-VN')
                                : 'N/A'
                              }
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
                              {(contract.monthlyRent || 0).toLocaleString('vi-VN')} VNĐ
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-gray-600">Tiền cọc</p>
                            <p className="font-medium text-blue-600">
                              N/A
                            </p>
                          </div>
                        </div>
                      </div>

                      {contract.createdAt && (
                        <div className="flex items-center space-x-2 text-sm">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-500">
                            Tạo lúc: {new Date(contract.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      )}

                      {isExpiringSoon && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                          <p className="text-yellow-800 text-xs font-medium">
                            ⚠️ Hợp đồng sẽ hết hạn sau {daysUntilExpiry} ngày
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => window.open(`/dashboard/landlord/contracts/${contract.id}`, '_blank')}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Xem
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleDownload(contract.id!, `HĐ-${contract.id?.slice(-6)}`)}
                        disabled={downloading}
                      >
                        <Download className={`h-4 w-4 mr-1 ${downloading ? 'animate-spin' : ''}`} />
                        Tải
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {!loadingLandlord && filteredContracts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              {landlordContracts.length === 0
                ? 'Chưa có hợp đồng nào'
                : 'Không tìm thấy hợp đồng phù hợp'
              }
            </div>
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Tạo hợp đồng đầu tiên</span>
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
