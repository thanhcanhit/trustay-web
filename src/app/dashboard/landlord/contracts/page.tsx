"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Download, Eye, Plus, RotateCcw, AlertCircle, FileSignature, Loader2, MoreHorizontal, FileText } from "lucide-react"
import { useContractStore } from "@/stores/contractStore"
import { useRentalStore } from "@/stores/rentalStore"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Contract } from "@/types/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import ContractPreviewDialog from "@/components/contract/ContractPreviewDialog"
import { STATUS_COLORS, CONTRACT_SIGN } from "@/constants/basic"
import { UserProfileModal } from "@/components/profile/user-profile-modal"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty"

export default function ContractsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedRentalId, setSelectedRentalId] = useState<string>('')
  const [previewContractId, setPreviewContractId] = useState<string | null>(null)
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
    clearErrors,
    autoGenerate,
    submitting
  } = useContractStore()

  const {
    landlordRentals,
    loadLandlordRentals,
  } = useRentalStore()

  useEffect(() => {
    loadAll()
    loadLandlordRentals()
  }, [loadAll, loadLandlordRentals])

  const filteredContracts = (contracts || []).filter((contract: Contract) => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch =
      contract.id?.toLowerCase().includes(searchLower) ||
      contract.tenant?.firstName?.toLowerCase().includes(searchLower) ||
      contract.tenant?.lastName?.toLowerCase().includes(searchLower) ||
      contract.room?.name?.toLowerCase().includes(searchLower)

    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Debug: Log contracts data
  useEffect(() => {
    console.log('=== Contracts Debug ===')
    console.log('contracts:', contracts)
    console.log('contracts length:', contracts?.length)
    console.log('loading:', loading)
    console.log('error:', error)
    console.log('filteredContracts length:', filteredContracts.length)
    console.log('======================')
  }, [contracts, loading, error, filteredContracts.length])

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

  const handleCreateContract = async () => {
    if (!selectedRentalId) {
      toast.error('Vui lòng chọn hợp đồng cho thuê')
      return
    }

    const success = await autoGenerate(selectedRentalId)
    if (success) {
      toast.success('Tạo hợp đồng thành công!')
      setShowCreateDialog(false)
      setSelectedRentalId('')
      loadAll()
    } else {
      toast.error('Không thể tạo hợp đồng')
    }
  }

  // Get rentals without contracts
  const rentalsWithoutContract = (landlordRentals || []).filter(
    rental => rental.status === 'active' && !rental.contract
  )

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
                <SelectItem value="pending_signatures">Chờ ký</SelectItem>
                <SelectItem value="partially_signed">Đã ký một phần</SelectItem>
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

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <Button 
              className="flex items-center space-x-2"
              onClick={() => setShowCreateDialog(true)}
            >
              <Plus className="h-4 w-4" />
              <span>Tạo hợp đồng mới</span>
            </Button>

            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Tạo hợp đồng mới</DialogTitle>
                <DialogDescription>
                  Chọn hợp đồng cho thuê để tạo hợp đồng chính thức
                </DialogDescription>
              </DialogHeader>

              <div className="py-4">
                {rentalsWithoutContract.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Không có hợp đồng cho thuê nào chưa có hợp đồng chính thức
                  </div>
                ) : (
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Chọn hợp đồng cho thuê:</label>
                    <Select value={selectedRentalId} onValueChange={setSelectedRentalId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn hợp đồng cho thuê..." />
                      </SelectTrigger>
                      <SelectContent>
                        {rentalsWithoutContract.map((rental) => (
                          <SelectItem key={rental.id} value={rental.id!}>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {rental.roomInstance?.room?.name || 'N/A'} ({rental.roomInstance?.roomNumber || 'N/A'}) - {rental.tenant?.firstName} {rental.tenant?.lastName}
                              </span>
                              <span className="text-xs text-gray-500">
                                {rental.roomInstance?.room?.building?.name || 'N/A'}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {selectedRentalId && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Lưu ý:</strong> Hợp đồng sẽ được tạo tự động dựa trên thông tin từ hợp đồng cho thuê. 
                          Bạn có thể chỉnh sửa sau khi tạo.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowCreateDialog(false)
                    setSelectedRentalId('')
                  }}
                >
                  Hủy
                </Button>
                <Button 
                  onClick={handleCreateContract}
                  disabled={!selectedRentalId || submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang tạo...
                    </>
                  ) : (
                    'Tạo hợp đồng'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
                  <TableHead className="min-w-[120px]">Người thuê</TableHead>
                  <TableHead className="w-[80px]">Phòng</TableHead>
                  <TableHead className="text-right w-[80px]">Tiền thuê</TableHead>
                  <TableHead className="text-right w-[80px]">Tiền cọc</TableHead>
                  <TableHead className="min-w-[110px]">Ngày bắt đầu</TableHead>
                  <TableHead className="min-w-[110px]">Ngày kết thúc</TableHead>
                  <TableHead className="min-w-[120px]">Trạng thái</TableHead>
                  <TableHead className="w-[60px]">Thao tác</TableHead>
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
                        <button
                          onClick={() => {
                            if (contract.tenant?.id) {
                              setSelectedUserId(contract.tenant.id)
                              setProfileModalOpen(true)
                            }
                          }}
                          className="font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer text-left"
                          disabled={!contract.tenant?.id}
                        >
                          {tenantName}
                        </button>
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
                          : '...'}
                      </TableCell>
                      <TableCell>
                        {contract.endDate
                          ? new Date(contract.endDate).toLocaleDateString('vi-VN')
                          : '...'}
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
                              <DropdownMenuItem onClick={() => router.push(`/dashboard/landlord/contracts/${contract.id}`)}>
                                <FileText className="h-4 w-4 mr-2" />
                                Xem chi tiết
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setPreviewContractId(contract.id!)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Xem nhanh
                              </DropdownMenuItem>
                              {/* Hiển thị nút Ký nếu status là draft, pending_signatures, hoặc partially_signed VÀ landlord chưa ký */}
                              {(contract.status === 'draft' || contract.status === 'pending_signatures' || contract.status === 'partially_signed') && 
                               !contract.landlordSignature && (
                                <DropdownMenuItem onClick={() => router.push(`/dashboard/landlord/contracts/${contract.id}`)}>
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
                {searchTerm || statusFilter !== 'all'
                  ? 'Không tìm thấy hợp đồng'
                  : 'Chưa có hợp đồng'
                }
              </EmptyTitle>
              <EmptyDescription>
                {searchTerm || statusFilter !== 'all'
                  ? 'Không có hợp đồng nào phù hợp với bộ lọc hiện tại. Hãy thử tìm kiếm hoặc lọc với điều kiện khác.'
                  : 'Bạn chưa có hợp đồng nào. Hãy tạo hợp đồng đầu tiên từ các hợp đồng cho thuê đang hoạt động.'}
              </EmptyDescription>
            </EmptyHeader>
            {!searchTerm && statusFilter === 'all' && (
              <EmptyContent>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo hợp đồng đầu tiên
                </Button>
              </EmptyContent>
            )}
          </Empty>
        )}

        {/* Preview Dialog */}
        {previewContractId && (
          <ContractPreviewDialog
            contractId={previewContractId}
            open={!!previewContractId}
            onOpenChange={(open) => !open && setPreviewContractId(null)}
            showSignButton={
              // Hiển thị nút ký nếu status là draft, pending_signatures, hoặc partially_signed VÀ landlord chưa ký
              (() => {
                const contract = contracts?.find(c => c.id === previewContractId)
                return (contract?.status === 'draft' || contract?.status === 'pending_signatures' || contract?.status === 'partially_signed') && 
                       !contract?.landlordSignature
              })()
            }
            onSignClick={() => {
              setPreviewContractId(null)
              router.push(`/dashboard/landlord/contracts/${previewContractId}`)
            }}
          />
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
