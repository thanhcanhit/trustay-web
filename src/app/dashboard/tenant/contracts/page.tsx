"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ContractCard } from "@/components/contract/ContractCard"
import { Search, RotateCcw, AlertCircle, Loader2, FileText } from "lucide-react"
import { useContractStore } from "@/stores/contractStore"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { Contract } from "@/types/types"
import { UserProfileModal } from "@/components/profile/user-profile-modal"
import { translateContractStatus } from "@/utils"
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
      // Download PDF (store handles 404 and auto-generate)
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
      } else {
        console.error('Failed to download PDF blob')
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
              <SelectItem value="active">{translateContractStatus('active')}</SelectItem>
              <SelectItem value="draft">{translateContractStatus('draft')}</SelectItem>
              <SelectItem value="pending_signature">{translateContractStatus('pending_signature')}</SelectItem>
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
          {filteredContracts.map((contract: Contract) => (
            <ContractCard
              key={contract.id}
              contract={contract}
              userType="tenant"
              onViewDetails={handleViewContract}
              onViewPreview={(contractId) => router.push(`/dashboard/tenant/contracts/${contractId}/preview`)}
              onSign={handleViewContract}
              onDownload={handleDownload}
              onViewProfile={(userId) => {
                setSelectedUserId(userId)
                setProfileModalOpen(true)
              }}
              downloading={downloading}
            />
          ))}
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
