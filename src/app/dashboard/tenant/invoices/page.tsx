"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, AlertCircle } from "lucide-react"
import { PageHeader } from "@/components/dashboard/page-header"
import { BillCard } from "@/components/billing/BillCard"
import { useBillStore } from "@/stores/billStore"
import { useRouter } from "next/navigation"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import type { Bill } from "@/types/bill.types"
import type { BillStatus } from "@/types/types"

export default function TenantInvoicesPage() {
  const router = useRouter()
  const {
    bills,
    loading,
    loadTenantBills,
    meta,
  } = useBillStore()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [billingPeriod, setBillingPeriod] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // Load bills when filters change
  useEffect(() => {
    const params: {
      page: number;
      limit: number;
      status?: BillStatus;
      billingPeriod?: string;
    } = {
      page: 1,
      limit: 50,
    }

    if (statusFilter !== 'all') {
      params.status = statusFilter as BillStatus
    }

    if (billingPeriod) {
      params.billingPeriod = billingPeriod
    }

    loadTenantBills(params)
  }, [loadTenantBills, statusFilter, billingPeriod])

  const handleViewDetail = (bill: Bill) => {
    router.push(`/dashboard/tenant/invoices/${bill.id}`)
  }

  const resetFilters = () => {
    setStatusFilter('all')
    setBillingPeriod('')
    setSearchTerm('')
  }

  // Client-side search filter
  const filteredBills = bills.filter(bill => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch = !searchTerm ||
      bill.billingPeriod.toLowerCase().includes(searchLower) ||
      bill.rental?.roomInstance?.roomNumber?.toLowerCase().includes(searchLower) ||
      bill.rental?.roomInstance?.room?.name?.toLowerCase().includes(searchLower)

    return matchesSearch
  })

  // Calculate summary stats
  const remainingAmount = bills.reduce((sum, b) => sum + b.remainingAmount, 0)
  const overdueCount = bills.filter(b => b.status === 'overdue').length
  const pendingCount = bills.filter(b => b.status === 'pending').length

  return (
    <DashboardLayout userType="tenant">
      <div className="px-6">
        <PageHeader
          title="Hóa đơn của tôi"
          subtitle="Xem và quản lý các hóa đơn thanh toán"
        />

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground">Tổng hóa đơn</div>
              <div className="text-2xl font-bold">{bills.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground">Chờ thanh toán</div>
              <div className="text-2xl font-bold text-orange-600">{pendingCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground">Quá hạn</div>
              <div className="text-2xl font-bold text-red-600">{overdueCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground">Còn phải trả</div>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                }).format(remainingAmount)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Warning for overdue bills */}
        {overdueCount > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-900">
                Bạn có {overdueCount} hóa đơn quá hạn thanh toán
              </p>
              <p className="text-sm text-red-700">
                Vui lòng thanh toán sớm để tránh các khoản phí phát sinh
              </p>
            </div>
          </div>
        )}

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
                    placeholder="Tìm kiếm theo kỳ, phòng..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Billing Period */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Kỳ thanh toán</Label>
                      <Input
                        type="month"
                        value={billingPeriod}
                        onChange={(e) => setBillingPeriod(e.target.value)}
                      />
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
        {meta && (
          <div className="mb-6 text-sm text-muted-foreground">
            Hiển thị <span className="font-semibold">{filteredBills.length}</span> trong tổng số{' '}
            <span className="font-semibold">{meta.total}</span> hóa đơn
          </div>
        )}

        {/* Bills Grid */}
        {loading ? (
          <div className="text-center py-12">Đang tải...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredBills.map((bill) => (
                <BillCard
                  key={bill.id}
                  bill={bill}
                  onViewDetail={handleViewDetail}
                  userRole="tenant"
                />
              ))}
            </div>

            {filteredBills.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500 mb-4">
                  {bills.length === 0
                    ? "Bạn chưa có hóa đơn nào"
                    : "Không tìm thấy hóa đơn phù hợp với bộ lọc"}
                </div>
                {bills.length > 0 && (
                  <Button variant="outline" onClick={resetFilters}>
                    Xóa bộ lọc
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
