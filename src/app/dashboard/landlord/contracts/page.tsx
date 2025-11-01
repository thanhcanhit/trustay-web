"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ContractCard } from "@/components/contract/ContractCard"
import { Search, Plus, RotateCcw, AlertCircle, Loader2, FileText } from "lucide-react"
import { useContractStore } from "@/stores/contractStore"
import { useRentalStore } from "@/stores/rentalStore"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import { Contract } from "@/types/types"
import { Rental } from "@/types/rental.types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { translateContractStatus } from "@/utils"
import { UserProfileModal } from "@/components/profile/user-profile-modal"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty"
import { ContractCreationForm } from "@/components/contract/ContractCreationForm"

export default function ContractsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedRentalId, setSelectedRentalId] = useState<string>('')
  const [showFormDialog, setShowFormDialog] = useState(false)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [contractToDelete, setContractToDelete] = useState<Contract | null>(null)

  const {
    contracts,
    loading,
    error,
    downloading,
    downloadError,
    deleting,
    deleteError,
    loadAll,
    downloadPDF,
    clearErrors,
    autoGenerate,
    submitting,
    delete: deleteContract
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

  const handleDeleteClick = (contract: Contract) => {
    setContractToDelete(contract)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!contractToDelete?.id) return

    const success = await deleteContract(contractToDelete.id)
    if (success) {
      toast.success('Xóa hợp đồng thành công!')
      setShowDeleteDialog(false)
      setContractToDelete(null)
    } else {
      toast.error(deleteError || 'Không thể xóa hợp đồng')
    }
  }

  const handleRentalSelected = () => {
    if (!selectedRentalId) {
      toast.error('Vui lòng chọn hợp đồng cho thuê')
      return
    }

    const rental = rentalsWithoutContract.find(r => r.id === selectedRentalId)
    if (!rental) {
      toast.error('Không tìm thấy hợp đồng cho thuê')
      return
    }

    setSelectedRental(rental)
    setShowCreateDialog(false)
    setShowFormDialog(true)
  }

  const handleCreateContract = async (formData: {
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
    if (!selectedRentalId) {
      toast.error('Vui lòng chọn hợp đồng cho thuê')
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

    const success = await autoGenerate(selectedRentalId, additionalContractData)
    if (success) {
      toast.success('Tạo hợp đồng thành công!')
      setShowFormDialog(false)
      setSelectedRentalId('')
      setSelectedRental(null)
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
                <SelectItem value="active">{translateContractStatus('active')}</SelectItem>
                <SelectItem value="draft">{translateContractStatus('draft')}</SelectItem>
                <SelectItem value="pending_signatures">{translateContractStatus('pending_signatures')}</SelectItem>
                <SelectItem value="partially_signed">{translateContractStatus('partially_signed')}</SelectItem>
                <SelectItem value="signed">{translateContractStatus('signed')}</SelectItem>
                <SelectItem value="fully_signed">{translateContractStatus('fully_signed')}</SelectItem>
                <SelectItem value="expired">{translateContractStatus('expired')}</SelectItem>
                <SelectItem value="terminated">{translateContractStatus('terminated')}</SelectItem>
                <SelectItem value="cancelled">{translateContractStatus('cancelled')}</SelectItem>
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

          <Button
            className="flex items-center space-x-2"
            onClick={() => setShowCreateDialog(true)}
          >
            <Plus className="h-4 w-4" />
            <span>Tạo hợp đồng mới</span>
          </Button>

          {/* Step 1: Select Rental Dialog */}
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Chọn hợp đồng cho thuê</DialogTitle>
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
                          <strong>Lưu ý:</strong> Bạn sẽ nhập các thông tin tài chính và điều khoản chi tiết ở bước tiếp theo.
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
                  onClick={handleRentalSelected}
                  disabled={!selectedRentalId}
                >
                  Tiếp tục
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Step 2: Contract Details Form Dialog */}
          <Dialog open={showFormDialog} onOpenChange={(open) => {
            if (!open) {
              setShowFormDialog(false)
              setSelectedRentalId('')
              setSelectedRental(null)
            }
          }}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nhập thông tin hợp đồng</DialogTitle>
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
                  initialMonthlyRent={parseFloat(selectedRental.monthlyRent) || 0}
                  initialDeposit={parseFloat(selectedRental.depositPaid) || 0}
                  onSubmit={handleCreateContract}
                  onCancel={() => {
                    setShowFormDialog(false)
                    setSelectedRentalId('')
                    setSelectedRental(null)
                  }}
                  isSubmitting={submitting}
                />
              )}
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

        {/* Contracts Grid */}
        {!loading && filteredContracts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContracts.map((contract) => (
              <ContractCard
                key={contract.id}
                contract={contract}
                userType="landlord"
                onViewDetails={(contractId) => router.push(`/dashboard/landlord/contracts/${contractId}`)}
                onViewPreview={(contractId) => router.push(`/dashboard/landlord/contracts/${contractId}/preview`)}
                onSign={(contractId) => router.push(`/dashboard/landlord/contracts/${contractId}`)}
                onDownload={handleDownload}
                onDelete={handleDeleteClick}
                onViewProfile={(userId) => {
                  setSelectedUserId(userId)
                  setProfileModalOpen(true)
                }}
                downloading={downloading}
              />
            ))}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xác nhận xóa hợp đồng</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn xóa hợp đồng này không? Hành động này không thể hoàn tác.
              </DialogDescription>
            </DialogHeader>
            {contractToDelete && (
              <div className="py-4">
                <div className="space-y-2 text-sm">
                  <p><strong>Mã hợp đồng:</strong> HĐ-{contractToDelete.id?.slice(-8)}</p>
                  <p><strong>Người thuê:</strong> {contractToDelete.tenant?.firstName} {contractToDelete.tenant?.lastName}</p>
                  <p><strong>Phòng:</strong> {contractToDelete.room?.name}</p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteDialog(false)
                  setContractToDelete(null)
                }}
                disabled={deleting}
              >
                Hủy
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={deleting}
              >
                {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Xóa hợp đồng
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
