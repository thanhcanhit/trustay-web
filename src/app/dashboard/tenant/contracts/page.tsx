"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Download, RotateCcw, AlertCircle, FileSignature, Loader2, MoreHorizontal, FileText } from "lucide-react"
import { useContractStore } from "@/stores/contractStore"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Contract } from "@/types/types"
import { UserProfileModal } from "@/components/profile/user-profile-modal"
import { CONTRACT_SIGN, STATUS_COLORS } from "@/constants/basic"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"

export default function TenantContractsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const {
    contracts,
    loading,
    error,
    downloading,
    downloadError,
    loadAll,
    downloadPDF,
    clearErrors
  } = useContractStore()

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const filteredContracts = (contracts || []).filter((contract: Contract) => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch =
      contract.id?.toLowerCase().includes(searchLower) ||
      contract.landlord?.firstName?.toLowerCase().includes(searchLower) ||
      contract.landlord?.lastName?.toLowerCase().includes(searchLower) ||
      contract.room?.name?.toLowerCase().includes(searchLower)

    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter

    return matchesSearch && matchesStatus
  })

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

  const handleViewContract = (contractId: string) => {
    router.push(`/dashboard/tenant/contracts/${contractId}`)
  }

  return (
    <DashboardLayout userType="tenant">
      <div className="px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Hợp đồng của tôi</h1>
        <p className="text-gray-600">Quản lý hợp đồng thuê trọ của bạn</p>
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
              <SelectItem value="pending_signatures">Chờ ký</SelectItem>
              <SelectItem value="signed">Đã ký</SelectItem>
              <SelectItem value="expired">Hết hạn</SelectItem>
              <SelectItem value="terminated">Đã chấm dứt</SelectItem>
              <SelectItem value="cancelled">Đã hủy</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => loadAll()}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <RotateCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
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
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
            <span className="text-gray-500">Đang tải hợp đồng...</span>
          </div>
        </div>
      )}

      {/* Contracts Table */}
      {!loading && filteredContracts.length > 0 && (
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Mã HĐ</TableHead>
                <TableHead className="min-w-[150px]">Chủ nhà</TableHead>
                <TableHead className="min-w-[120px]">Phòng</TableHead>
                <TableHead className="text-right min-w-[120px]">Tiền thuê</TableHead>
                <TableHead className="text-right min-w-[120px]">Tiền cọc</TableHead>
                <TableHead className="min-w-[110px]">Ngày bắt đầu</TableHead>
                <TableHead className="min-w-[110px]">Ngày kết thúc</TableHead>
                <TableHead className="min-w-[120px]">Trạng thái</TableHead>
                <TableHead className="text-right w-[80px]">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContracts.map((contract: Contract) => {
                const landlordName = contract.landlord
                  ? `${contract.landlord.firstName} ${contract.landlord.lastName}`
                  : 'Chưa có thông tin'

                const roomName = contract.room?.name || 'N/A'

                return (
                  <TableRow key={contract.id}>
                    <TableCell className="font-medium">
                      {contract.id ? `HĐ-${contract.id.slice(-8)}` : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => {
                          if (contract.landlord?.id) {
                            setSelectedUserId(contract.landlord.id)
                            setProfileModalOpen(true)
                          }
                        }}
                        className="font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer text-left"
                        disabled={!contract.landlord?.id}
                      >
                        {landlordName}
                      </button>
                    </TableCell>
                    <TableCell>{roomName}</TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      {(contract.monthlyRent || 0).toLocaleString('vi-VN')} đ
                    </TableCell>
                    <TableCell className="text-right font-medium text-blue-600">
                      {(contract.depositAmount || 0).toLocaleString('vi-VN')} đ
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
                        {CONTRACT_SIGN[contract.status as keyof typeof CONTRACT_SIGN] || contract.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewContract(contract.id!)}>
                              <FileText className="h-4 w-4 mr-2" />
                              Xem chi tiết
                            </DropdownMenuItem>
                            {(contract.status === 'draft' || contract.status === 'pending_signatures') && (
                              <DropdownMenuItem onClick={() => handleViewContract(contract.id!)}>
                                <FileSignature className="h-4 w-4 mr-2" />
                                Ký hợp đồng
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => handleDownload(contract.id!, `HĐ-${contract.id?.slice(-8)}`)}
                              disabled={downloading}
                            >
                              <Download className={`h-4 w-4 mr-2 ${downloading ? 'animate-spin' : ''}`} />
                              Tải PDF
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {!loading && filteredContracts.length === 0 && (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileText />
            </EmptyMedia>
            <EmptyTitle>
              {(contracts || []).length === 0
                ? 'Chưa có hợp đồng'
                : 'Không tìm thấy hợp đồng'}
            </EmptyTitle>
            <EmptyDescription>
              {(contracts || []).length === 0
                ? 'Bạn chưa có hợp đồng thuê trọ nào. Hợp đồng sẽ được tạo tự động sau khi bạn xác nhận yêu cầu thuê được chấp nhận từ chủ nhà.'
                : 'Không có hợp đồng nào phù hợp với tiêu chí tìm kiếm. Hãy thử lại với từ khóa hoặc bộ lọc khác.'}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {/* User Profile Modal */}
      {selectedUserId && (
        <UserProfileModal
          userId={selectedUserId}
          open={profileModalOpen}
          onOpenChange={setProfileModalOpen}
        />
      )}
      </div>
    </DashboardLayout>
  )
}
