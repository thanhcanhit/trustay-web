"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Receipt, Filter, AlertCircle } from "lucide-react"
import { PageHeader, PageHeaderActions } from "@/components/dashboard/page-header"
import { BillCard } from "@/components/billing/BillCard"
import { useBillStore } from "@/stores/billStore"
import { useBuildingStore } from "@/stores/buildingStore"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { getCurrentBillingPeriod } from "@/utils/billUtils"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import type { Bill, LandlordBillQueryParams } from "@/types/bill.types"
import type { BillStatus } from "@/types/types"

export default function InvoicesPage() {
  const router = useRouter()
  const {
    bills,
    loading,
    loadLandlordBills,
    markPaid,
    remove,
    markingPaid,
    deleting,
    deleteError,
    markPaidError,
    meta,
  } = useBillStore()

  const { buildings, fetchAllBuildings } = useBuildingStore()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [buildingFilter, setBuildingFilter] = useState('all')
  const [billingPeriod, setBillingPeriod] = useState(getCurrentBillingPeriod())
  const [sortBy, setSortBy] = useState<'roomName' | 'status' | 'totalAmount' | 'createdAt' | 'dueDate'>('roomName')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [showFilters, setShowFilters] = useState(false)

  // Count bills that need meter data
  const billsNeedingMeterData = bills.filter(b => b.requiresMeterData).length

  // Load buildings on mount
  useEffect(() => {
    fetchAllBuildings()
  }, [fetchAllBuildings])

  // Load bills when filters change
  useEffect(() => {
    const params: LandlordBillQueryParams = {
      page: 1,
      limit: 50,
      sortBy,
      sortOrder,
    }

    if (buildingFilter !== 'all') {
      params.buildingId = buildingFilter
    }

    if (statusFilter !== 'all') {
      params.status = statusFilter as BillStatus
    }

    if (searchTerm) {
      params.search = searchTerm
    }

    if (billingPeriod) {
      params.billingPeriod = billingPeriod
    }

    loadLandlordBills(params)
  }, [loadLandlordBills, buildingFilter, statusFilter, searchTerm, billingPeriod, sortBy, sortOrder])

  const handleViewDetail = (bill: Bill) => {
    router.push(`/dashboard/landlord/invoices/${bill.id}`)
  }

  const handleMarkAsPaid = async (bill: Bill) => {
    if (markingPaid) return

    const success = await markPaid(bill.id)
    if (success) {
      toast.success('Đã đánh dấu thanh toán')
    } else {
      toast.error(markPaidError || 'Có lỗi xảy ra khi đánh dấu thanh toán')
    }
  }

  const handleDeleteBill = async (billId: string) => {
    if (deleting) return

    const success = await remove(billId)
    if (success) {
      toast.success('Đã xóa hóa đơn thành công')
    } else {
      toast.error(deleteError || 'Có lỗi xảy ra khi xóa hóa đơn')
    }
  }

  const handleMeterDataUpdated = () => {
    // Reload bills list after meter data is updated
    const params: LandlordBillQueryParams = {
      page: 1,
      limit: 50,
      sortBy,
      sortOrder,
    }

    if (buildingFilter !== 'all') {
      params.buildingId = buildingFilter
    }

    if (statusFilter !== 'all') {
      params.status = statusFilter as BillStatus
    }

    if (searchTerm) {
      params.search = searchTerm
    }

    if (billingPeriod) {
      params.billingPeriod = billingPeriod
    }

    loadLandlordBills(params)
  }

  const resetFilters = () => {
    setBuildingFilter('all')
    setStatusFilter('all')
    setSearchTerm('')
    setBillingPeriod(getCurrentBillingPeriod())
    setSortBy('roomName')
    setSortOrder('asc')
  }

  return (
    <DashboardLayout userType="landlord">
      <div className="px-6">
        <PageHeader
          title="Quản lý hóa đơn"
          subtitle="Quản lý tất cả hóa đơn và thanh toán"
          actions={
            <PageHeaderActions.Custom>
              <Button
                className="flex items-center space-x-2"
                onClick={() => router.push('/dashboard/landlord/invoices/create')}
              >
                <Receipt className="h-4 w-4" />
                <span>Tạo hóa đơn mới</span>
              </Button>
            </PageHeaderActions.Custom>
          }
        />

        {/* Filters Section */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Quick Filters Row */}
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Tìm kiếm theo tên/số phòng..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Billing Period */}
                <div className="w-full sm:w-48">
                  <Input
                    type="month"
                    value={billingPeriod}
                    onChange={(e) => setBillingPeriod(e.target.value)}
                  />
                </div>

                {/* Building Filter */}
                <div className="w-full sm:w-56">
                  <Select value={buildingFilter} onValueChange={setBuildingFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tất cả toà nhà" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả toà nhà</SelectItem>
                      {buildings.map((building) => (
                        <SelectItem key={building.id} value={building.id}>
                          {building.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Status Filter */}
                <div className="w-full sm:w-48">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả trạng thái</SelectItem>
                      <SelectItem value="draft">Nháp</SelectItem>
                      <SelectItem value="pending">Chờ thanh toán</SelectItem>
                      <SelectItem value="paid">Đã thanh toán</SelectItem>
                      <SelectItem value="overdue">Quá hạn</SelectItem>
                      <SelectItem value="cancelled">Đã hủy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Toggle Advanced Filters */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowFilters(!showFilters)}
                  className="w-full sm:w-auto"
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <div className="pt-4 border-t space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Sort By */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Sắp xếp theo</Label>
                      <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="roomName">Tên phòng</SelectItem>
                          <SelectItem value="status">Trạng thái</SelectItem>
                          <SelectItem value="totalAmount">Tổng tiền</SelectItem>
                          <SelectItem value="createdAt">Ngày tạo</SelectItem>
                          <SelectItem value="dueDate">Hạn thanh toán</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Sort Order */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Thứ tự</Label>
                      <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as typeof sortOrder)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="asc">Tăng dần</SelectItem>
                          <SelectItem value="desc">Giảm dần</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Reset Filters */}
                    <div className="flex items-end">
                      <Button variant="outline" onClick={resetFilters} className="w-full">
                        Đặt lại bộ lọc
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats Summary */}
        <div className="mb-6 flex items-center justify-between">
          {meta && (
            <div className="text-sm text-muted-foreground">
              Hiển thị <span className="font-semibold">{bills.length}</span> trong tổng số{' '}
              <span className="font-semibold">{meta.total}</span> hóa đơn
            </div>
          )}
          {billsNeedingMeterData > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              <span className="text-blue-900">
                <span className="font-semibold">{billsNeedingMeterData}</span> hóa đơn cần nhập số đồng hồ
              </span>
              <Button
                size="sm"
                variant="link"
                className="text-blue-600 h-auto p-0"
                onClick={() => setStatusFilter('draft')}
              >
                Xem ngay
              </Button>
            </div>
          )}
        </div>

        {/* Bills Grid */}
        {loading || deleting || markingPaid ? (
          <div className="text-center py-12">
            {loading && 'Đang tải...'}
            {deleting && 'Đang xóa hóa đơn...'}
            {markingPaid && 'Đang cập nhật trạng thái...'}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {bills.map((bill) => (
                <BillCard
                  key={bill.id}
                  bill={bill}
                  onViewDetail={handleViewDetail}
                  onMarkAsPaid={handleMarkAsPaid}
                  onDelete={handleDeleteBill}
                  onMeterDataUpdated={handleMeterDataUpdated}
                  userRole="landlord"
                />
              ))}
            </div>

            {bills.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500 mb-4">Không có hóa đơn nào</div>
                <Button onClick={() => router.push('/dashboard/landlord/invoices/create')}>
                  Tạo hóa đơn đầu tiên
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
