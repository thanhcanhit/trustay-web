"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Download, Eye, Plus, RotateCcw, AlertCircle, FileSignature } from "lucide-react"
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

  const filteredContracts = (landlordContracts || []).filter(contract => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch =
      contract.id?.toLowerCase().includes(searchLower) ||
      contract.tenant?.firstName?.toLowerCase().includes(searchLower) ||
      contract.tenant?.lastName?.toLowerCase().includes(searchLower) ||
      contract.room?.name?.toLowerCase().includes(searchLower)

    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // const getDaysUntilExpiry = (endDate: string) => {
  //   const end = new Date(endDate)
  //   const today = new Date()
  //   const diffTime = end.getTime() - today.getTime()
  //   const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  //   return diffDays
  // }

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

        {/* Contracts Table */}
        {!loadingLandlord && filteredContracts.length > 0 && (
          <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Mã HĐ</TableHead>
                  <TableHead className="min-w-[150px]">Người thuê</TableHead>
                  <TableHead className="min-w-[120px]">Phòng</TableHead>
                  <TableHead className="text-right min-w-[120px]">Tiền thuê</TableHead>
                  <TableHead className="text-right min-w-[120px]">Tiền cọc</TableHead>
                  <TableHead className="min-w-[110px]">Ngày bắt đầu</TableHead>
                  <TableHead className="min-w-[110px]">Ngày kết thúc</TableHead>
                  <TableHead className="min-w-[120px]">Trạng thái</TableHead>
                  <TableHead className="text-right min-w-[200px]">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContracts.map((contract) => {
                  const tenantName = contract.tenant
                    ? `${contract.tenant.firstName} ${contract.tenant.lastName}`
                    : 'Chưa có thông tin'

                  const roomName = contract.room?.name || 'N/A'

                  return (
                    <TableRow key={contract.id}>
                      <TableCell className="font-medium">
                        {contract.id ? `HĐ-${contract.id.slice(-8)}` : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{tenantName}</div>
                      </TableCell>
                      <TableCell>{roomName}</TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        {(contract.monthlyRent || 0).toLocaleString('vi-VN')}
                      </TableCell>
                      <TableCell className="text-right font-medium text-blue-600">
                        {(contract.depositAmount || 0).toLocaleString('vi-VN')}
                      </TableCell>
                      <TableCell>
                        {contract.startDate
                          ? new Date(contract.startDate).toLocaleDateString('vi-VN')
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {contract.endDate
                          ? new Date(contract.endDate).toLocaleDateString('vi-VN')
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge className={STATUS_COLORS[contract.status as keyof typeof STATUS_COLORS] || 'bg-gray-100 text-gray-800'}>
                          {STATUS_LABELS[contract.status as keyof typeof STATUS_LABELS] || contract.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`/dashboard/landlord/contracts/${contract.id}`, '_blank')}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Xem
                          </Button>
                          {contract.status === 'draft' && (
                            <Button
                              variant="outline"
                              size="sm"
                            >
                              <FileSignature className="h-4 w-4 mr-1" />
                              Ký
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(contract.id!, `HĐ-${contract.id?.slice(-8)}`)}
                            disabled={downloading}
                          >
                            <Download className={`h-4 w-4 mr-1 ${downloading ? 'animate-spin' : ''}`} />
                            PDF
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {!loadingLandlord && filteredContracts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              {(landlordContracts || []).length === 0
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
