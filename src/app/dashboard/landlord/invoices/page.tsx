"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Receipt, Filter, AlertCircle, Save, Eye, Trash2, CheckCircle, QrCode, ExternalLink, Copy } from "lucide-react"
import { PageHeader, PageHeaderActions } from "@/components/dashboard/page-header"
import { useBillStore } from "@/stores/billStore"
import { useBuildingStore } from "@/stores/buildingStore"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { getCurrentBillingPeriod, formatCurrency, getBillStatusLabel, getBillStatusColor } from "@/utils/billUtils"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import QRCode from "react-qr-code"
import type { Bill, LandlordBillQueryParams, PayOSLinkResponse } from "@/types/bill.types"
import { TokenManager } from "@/lib/api-client"
import type { BillStatus } from "@/types/types"

export default function InvoicesPage() {
  const router = useRouter()
  const {
    bills,
    loading,
    loadLandlordBills,
    markPaid,
    remove,
    updateWithMeterData,
    markingPaid,
    deleting,
    updatingMeter,
    deleteError,
    markPaidError,
    meterError,
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

  // Meter input state
  const [selectedBillId, setSelectedBillId] = useState<string | null>(null)
  const [meterInputs, setMeterInputs] = useState<Record<string, { oldReading: string; newReading: string }>>({})
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [creatingPayLinkFor, setCreatingPayLinkFor] = useState<string | null>(null)
  const [payOSModalData, setPayOSModalData] = useState<{
    info: PayOSLinkResponse | null
    bill: Bill | null
  }>({
    info: null,
    bill: null,
  })

  const formattedPayAmount = useMemo(() => {
    if (!payOSModalData.info?.amount) return null
    return payOSModalData.info.amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
  }, [payOSModalData.info])

  // Count bills that need meter data (both draft and pending can be edited)
  const billsNeedingMeterData = bills.filter(b =>
    (b.status === 'draft' || b.status === 'pending') &&
    b.meteredCostsToInput &&
    b.meteredCostsToInput.length > 0
  ).length

  // Get selected bill and its metered costs
  const selectedBill = bills.find(b => b.id === selectedBillId)
  const meteredCosts = useMemo(() => selectedBill?.meteredCostsToInput || [], [selectedBill])

  // Calculate draft invoice
  const draftInvoice = useMemo(() => {
    if (!selectedBill || meteredCosts.length === 0) return null

    const items: Array<{
      name: string
      unitPrice: number
      quantity: number
      amount: number
      unit: string
    }> = []

    let subtotal = selectedBill.subtotal || 0

    // Add metered costs
    meteredCosts.forEach(cost => {
      const input = meterInputs[cost.roomCostId]
      if (input?.newReading && input?.oldReading) {
        const oldReading = parseFloat(input.oldReading) || 0
        const newReading = parseFloat(input.newReading) || 0
        const consumption = Math.max(0, newReading - oldReading)
        const amount = consumption * cost.unitPrice

        items.push({
          name: cost.name,
          unitPrice: cost.unitPrice,
          quantity: consumption,
          amount,
          unit: cost.unit
        })

        subtotal += amount
      }
    })

    return {
      items,
      subtotal,
      totalAmount: subtotal
    }
  }, [selectedBill, meteredCosts, meterInputs])

  // Helper to get metered cost unitPrice for display in table
  const getMeteredCostDisplay = (bill: Bill, costName: string) => {
    const cost = bill.meteredCostsToInput?.find(c => 
      c.name.toLowerCase().includes(costName.toLowerCase())
    )
    
    if (!cost) return '-'
    
    // Show unit price
    return formatCurrency(cost.unitPrice)
  }

  // Calculate real-time total for a bill
  const calculateBillTotal = (bill: Bill) => {
    if (bill.id !== selectedBillId) {
      // Not selected, show original total
      return bill.totalAmount
    }

    // Selected bill - calculate with current inputs
    let total = bill.subtotal || 0

    bill.meteredCostsToInput?.forEach(cost => {
      const input = meterInputs[cost.roomCostId]
      if (input?.newReading && input?.oldReading) {
        const oldReading = parseFloat(input.oldReading) || 0
        const newReading = parseFloat(input.newReading) || 0
        const consumption = Math.max(0, newReading - oldReading)
        total += consumption * cost.unitPrice
      }
    })

    return total
  }

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildingFilter, statusFilter, searchTerm, billingPeriod, sortBy, sortOrder])

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
      // Clear selection if deleted bill was selected
      if (selectedBillId === billId) {
        setSelectedBillId(null)
        setMeterInputs({})
      }
    } else {
      toast.error(deleteError || 'Có lỗi xảy ra khi xóa hóa đơn')
    }
  }

  const handleSelectBill = (bill: Bill) => {
    if (selectedBillId === bill.id) {
      // Deselect if clicking the same bill
      setSelectedBillId(null)
      setMeterInputs({})
      return
    }

    setSelectedBillId(bill.id)
    
    // Initialize meter inputs with lastReading from API
    const initialInputs: Record<string, { oldReading: string; newReading: string }> = {}
    bill.meteredCostsToInput?.forEach(cost => {
      initialInputs[cost.roomCostId] = {
        oldReading: cost.lastReading > 0 ? cost.lastReading.toString() : '',
        newReading: cost.currentReading > 0 ? cost.currentReading.toString() : ''
      }
    })
    setMeterInputs(initialInputs)

    // Focus first input
    setTimeout(() => {
      if (inputRefs.current[0]) {
        inputRefs.current[0]?.focus()
      }
    }, 100)
  }

  const handleMeterInputChange = (roomCostId: string, field: 'oldReading' | 'newReading', value: string) => {
    setMeterInputs(prev => ({
      ...prev,
      [roomCostId]: {
        ...prev[roomCostId],
        [field]: value
      }
    }))
  }

  const buildPayOSUrls = (billId: string) => {
    const baseUrl = (process.env.NEXT_PUBLIC_PAYMENT_RETURN_BASE_URL || 'https://trustay.life').replace(/\/$/, '')
    const query = `billId=${encodeURIComponent(billId)}`
    return {
      returnUrl: `${baseUrl}/payments/success?${query}`,
      cancelUrl: `${baseUrl}/payments/cancel?${query}`,
    }
  }

  const handleGeneratePayOSLink = async (bill: Bill, event?: React.MouseEvent<HTMLButtonElement>) => {
    event?.stopPropagation()
    if (creatingPayLinkFor) return

    try {
      setCreatingPayLinkFor(bill.id)
      const token = TokenManager.getAccessToken()
      if (!token) {
        toast.error('Bạn cần đăng nhập để tạo link thanh toán')
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bills/${bill.id}/payos-link`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(buildPayOSUrls(bill.id)),
      })

      if (!response.ok) {
        throw new Error('Không thể tạo liên kết PayOS')
      }

      const data: PayOSLinkResponse = await response.json()
      setPayOSModalData({
        info: data,
        bill,
      })
    } catch (error) {
      console.error('Error generating PayOS link:', error)
      toast.error('Có lỗi xảy ra khi tạo liên kết PayOS')
    } finally {
      setCreatingPayLinkFor(null)
    }
  }

  const copyCheckoutUrl = async () => {
    if (!payOSModalData.info?.checkoutUrl) return
    try {
      await navigator.clipboard.writeText(payOSModalData.info.checkoutUrl)
      toast.success('Đã sao chép liên kết thanh toán')
    } catch {
      toast.error('Không thể sao chép liên kết, vui lòng thử lại')
    }
  }

  const handleMeterInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      
      if (index < meteredCosts.length * 2 - 1) {
        // Move to next input
        inputRefs.current[index + 1]?.focus()
      } else {
        // Last input - submit
        handleSubmitMeterData()
      }
    }
  }

  const handleSubmitMeterData = async () => {
    if (!selectedBill || updatingMeter) return

    // Validate all inputs
    const hasEmptyInput = meteredCosts.some(cost => {
      const input = meterInputs[cost.roomCostId]
      return !input?.oldReading || !input?.newReading
    })

    if (hasEmptyInput) {
      toast.error('Vui lòng nhập đầy đủ số cũ và số mới')
      return
    }

    // Validate new reading >= old reading
    const hasInvalidReading = meteredCosts.some(cost => {
      const input = meterInputs[cost.roomCostId]
      const oldReading = parseFloat(input.oldReading) || 0
      const newReading = parseFloat(input.newReading) || 0
      return newReading < oldReading
    })

    if (hasInvalidReading) {
      toast.error('Số mới phải lớn hơn hoặc bằng số cũ')
      return
    }

    // Convert to meter readings format
    const meterData = meteredCosts.map(cost => {
      const input = meterInputs[cost.roomCostId]
      return {
        roomCostId: cost.roomCostId,
        currentReading: parseFloat(input.newReading),
        lastReading: parseFloat(input.oldReading)
      }
    })

    // Get occupancy count from bill or default to 1
    const occupancyCount = selectedBill.occupancyCount || 1

    // Save current bill ID and find next bill BEFORE submitting
    const currentBillId = selectedBill.id

    // Find all bills that need meter data (both draft and pending can be edited)
    const billsNeedingInput = bills.filter(b =>
      (b.status === 'draft' || b.status === 'pending') &&
      b.meteredCostsToInput &&
      b.meteredCostsToInput.length > 0
    )

    // Find next bill from ALL bills needing input
    const currentInputIndex = billsNeedingInput.findIndex(b => b.id === currentBillId)
    const nextBill = currentInputIndex >= 0 && currentInputIndex < billsNeedingInput.length - 1
      ? billsNeedingInput[currentInputIndex + 1]
      : null

    // Prepare next bill data BEFORE API call
    let nextBillInputs: Record<string, { oldReading: string; newReading: string }> | null = null
    if (nextBill) {
      nextBillInputs = {}
      nextBill.meteredCostsToInput?.forEach(cost => {
        if (nextBillInputs) {
          nextBillInputs[cost.roomCostId] = {
            oldReading: cost.lastReading > 0 ? cost.lastReading.toString() : '',
            newReading: cost.currentReading > 0 ? cost.currentReading.toString() : ''
          }
        }
      })
    }

    // Move to next bill IMMEDIATELY (optimistic update) to keep form open
    if (nextBill && nextBillInputs) {
      setSelectedBillId(nextBill.id)
      setMeterInputs(nextBillInputs)

      // Focus first input
      setTimeout(() => {
        if (inputRefs.current[0]) {
          inputRefs.current[0]?.focus()
        }
      }, 100)
    } else {
      // No more bills, clear selection AFTER showing success
      setSelectedBillId(null)
      setMeterInputs({})
    }

    // Submit the update in background
    const success = await updateWithMeterData({
      billId: currentBillId,
      occupancyCount,
      meterData
    })

    if (success) {
      toast.success('Đã cập nhật số đồng hồ thành công')

      if (!nextBill) {
        toast.info('Đã hoàn thành tất cả hóa đơn cần nhập số đồng hồ')
      }
    } else {
      toast.error(meterError || 'Có lỗi xảy ra khi cập nhật số đồng hồ')
      // On error, could revert to previous bill but for now just show error
    }
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
        ) : bills.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">Không có hóa đơn nào</div>
            <Button onClick={() => router.push('/dashboard/landlord/invoices/create')}>
              Tạo hóa đơn đầu tiên
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left side - Table and Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Bills Table */}
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[120px]">Kỳ</TableHead>
                        <TableHead className="w-[80px]">Phòng</TableHead>
                        <TableHead className="text-right w-[100px]">Tổng</TableHead>
                        {/* Dynamic meter columns - show unit price */}
                        {bills.length > 0 && bills[0].meteredCostsToInput && bills[0].meteredCostsToInput.map((cost) => (
                          <TableHead key={cost.roomCostId} className="text-center w-[100px]">
                            {cost.name.replace('Tiền ', '')} (đơn giá)
                          </TableHead>
                        ))}
                        <TableHead className="w-[100px]">Trạng thái</TableHead>
                        <TableHead className="text-center w-[120px]">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bills.map((bill) => {
                        const isOverdue = new Date(bill.dueDate) < new Date() && bill.status === 'pending'
                        const isSelected = selectedBillId === bill.id
                        
                        return (
                          <TableRow 
                            key={bill.id}
                            className={`cursor-pointer hover:bg-muted/50 ${isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''} ${isOverdue ? 'bg-red-50' : ''}`}
                            onClick={() => handleSelectBill(bill)}
                          >
                            <TableCell className="font-medium">
                              {bill.billingMonth}/{bill.billingYear}
                              {(bill.status === 'draft' || bill.status === 'pending') && bill.meteredCostsToInput && bill.meteredCostsToInput.length > 0 && (
                                <Badge variant="outline" className="ml-2 text-xs text-blue-600 border-blue-600">
                                  Cần nhập
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="font-semibold">
                              {bill.rental?.roomInstance?.roomNumber || '-'}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {formatCurrency(calculateBillTotal(bill))}
                            </TableCell>
                            {/* Dynamic meter unit prices */}
                            {bill.meteredCostsToInput && bill.meteredCostsToInput.map((cost) => (
                              <TableCell key={cost.roomCostId} className="text-center">
                                {getMeteredCostDisplay(bill, cost.name)}
                              </TableCell>
                            ))}
                            <TableCell>
                              <Badge variant={getBillStatusColor(bill.status)}>
                                {getBillStatusLabel(bill.status)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-center gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleViewDetail(bill)
                                  }}
                                  title="Xem chi tiết"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-blue-600 hover:text-blue-700"
                                  title="Tạo link PayOS"
                                  disabled={creatingPayLinkFor === bill.id}
                                  onClick={(e) => handleGeneratePayOSLink(bill, e)}
                                >
                                  <QrCode className={`h-4 w-4 ${creatingPayLinkFor === bill.id ? 'animate-pulse' : ''}`} />
                                </Button>
                                
                                {bill.status === 'pending' && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-green-600 hover:text-green-700"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleMarkAsPaid(bill)
                                    }}
                                    title="Đánh dấu đã thanh toán"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                )}
                                
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteBill(bill.id)
                                  }}
                                  title="Xóa"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Meter Input Form (below table) */}
              {selectedBill && meteredCosts.length > 0 && (
                <Card className="border-2 border-blue-500">
                  <CardContent className="pt-6">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold mb-2">
                        Nhập số đồng hồ - Phòng {selectedBill.rental?.roomInstance?.roomNumber}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Tháng {selectedBill.billingMonth}/{selectedBill.billingYear}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      {meteredCosts.map((cost, index) => {
                        let displayName = cost.name
                        if (cost.name.toLowerCase().includes('điện')) {
                          displayName = 'Tiền điện'
                        } else if (cost.name.toLowerCase().includes('nước')) {
                          displayName = 'Tiền nước'
                        }
                        
                        const inputIndex = index * 2
                        
                        return (
                          <div key={cost.roomCostId} className="space-y-2">
                            <Label className="text-sm font-medium">{displayName}</Label>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Input
                                  ref={(el) => { inputRefs.current[inputIndex] = el }}
                                  type="number"
                                  step="0.01"
                                  placeholder="Số cũ"
                                  value={meterInputs[cost.roomCostId]?.oldReading || ''}
                                  onChange={(e) => handleMeterInputChange(cost.roomCostId, 'oldReading', e.target.value)}
                                  onKeyDown={(e) => handleMeterInputKeyDown(e, inputIndex)}
                                  className="text-sm"
                                />
                                <div className="text-xs text-gray-500 mt-1">Số cũ</div>
                              </div>
                              <div>
                                <Input
                                  ref={(el) => { inputRefs.current[inputIndex + 1] = el }}
                                  type="number"
                                  step="0.01"
                                  placeholder="Số mới"
                                  value={meterInputs[cost.roomCostId]?.newReading || ''}
                                  onChange={(e) => handleMeterInputChange(cost.roomCostId, 'newReading', e.target.value)}
                                  onKeyDown={(e) => handleMeterInputKeyDown(e, inputIndex + 1)}
                                  className="text-sm"
                                />
                                <div className="text-xs text-gray-500 mt-1">Số mới</div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Nhấn Enter để chuyển sang ô tiếp theo hoặc lưu
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedBillId(null)
                            setMeterInputs({})
                          }}
                        >
                          Hủy
                        </Button>
                        <Button
                          onClick={handleSubmitMeterData}
                          disabled={updatingMeter}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          {updatingMeter ? 'Đang lưu...' : 'Lưu và tiếp tục'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right side - Draft Invoice Panel (Real-time) */}
            <div className="lg:col-span-1">
              {selectedBill ? (
                <Card className="sticky top-6 border-2 border-blue-500 h-fit">
                  <CardContent className="pt-6">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold">
                        Hóa đơn tạm
                      </h3>
                    </div>

                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm font-medium text-blue-900">
                        Phòng {selectedBill.rental?.roomInstance?.roomNumber}
                      </div>
                      <div className="text-xs text-blue-700">
                        Tháng {selectedBill.billingMonth}/{selectedBill.billingYear}
                      </div>
                    </div>

                    {/* Existing bill items */}
                    <div className="space-y-2 mb-4">
                      <div className="text-sm font-semibold text-gray-700">Chi phí hiện tại:</div>
                      {selectedBill.billItems && selectedBill.billItems.length > 0 ? (
                        selectedBill.billItems.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-gray-600">{item.itemName}</span>
                            <span className="font-medium">{formatCurrency(item.amount)}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-gray-500">Chưa có chi phí cố định</div>
                      )}
                    </div>

                    {/* Metered costs calculation (real-time) */}
                    {meteredCosts.length > 0 && (
                      <>
                        <div className="border-t pt-4 mb-4">
                          <div className="text-sm font-semibold text-gray-700 mb-2">Chi phí đồng hồ:</div>
                          <div className="space-y-3">
                            {meteredCosts.map((cost) => {
                              const input = meterInputs[cost.roomCostId]
                              const oldReading = parseFloat(input?.oldReading || '0') || 0
                              const newReading = parseFloat(input?.newReading || '0') || 0
                              const consumption = Math.max(0, newReading - oldReading)
                              const amount = consumption * cost.unitPrice

                              return (
                                <div key={cost.roomCostId} className="text-sm">
                                  <div className="flex justify-between items-start">
                                    <span className="text-gray-600 font-medium">{cost.name}:</span>
                                    <div className="text-right">
                                      {input?.oldReading && input?.newReading && consumption > 0 ? (
                                        <>
                                          <div className="font-semibold text-blue-600">{formatCurrency(amount)}</div>
                                          <div className="text-xs text-gray-500">
                                            {formatCurrency(cost.unitPrice)} × {consumption.toFixed(2)} = {formatCurrency(amount)}
                                          </div>
                                        </>
                                      ) : (
                                        <span className="text-gray-400">-</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        {/* Total */}
                        <div className="border-t pt-4">
                          <div className="flex justify-between items-center">
                            <span className="text-base font-bold">Tổng cộng:</span>
                            <span className="text-xl font-bold text-blue-600">
                              {draftInvoice ? formatCurrency(draftInvoice.totalAmount) : formatCurrency(selectedBill.totalAmount)}
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="sticky top-6 h-fit">
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <Receipt className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-500 mb-2">Chưa chọn hóa đơn</p>
                      <p className="text-sm text-gray-400">
                        Nhấp vào hóa đơn bên trái để xem hóa đơn tạm
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
      <Dialog open={!!payOSModalData.info} onOpenChange={(open) => {
        if (!open) {
          setPayOSModalData({ info: null, bill: null })
        }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Tạo liên kết thanh toán PayOS</DialogTitle>
            <DialogDescription>
              Gửi QR hoặc đường dẫn này cho tenant để thanh toán online. Trạng thái hóa đơn sẽ tự cập nhật khi PayOS phản hồi.
            </DialogDescription>
          </DialogHeader>

          {payOSModalData.bill && (
            <div className="p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground">
              Hóa đơn phòng <span className="font-semibold text-foreground">{payOSModalData.bill.rental?.roomInstance?.roomNumber || payOSModalData.bill.id}</span> • Kỳ {payOSModalData.bill.billingMonth}/{payOSModalData.bill.billingYear}
            </div>
          )}

          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-white rounded-lg border">
              {payOSModalData.info?.qrCode ? (
                /^https?:/i.test(payOSModalData.info.qrCode) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={payOSModalData.info.qrCode}
                    alt="Mã QR PayOS"
                    className="w-60 h-60 object-contain"
                  />
                ) : (
                  <QRCode
                    value={payOSModalData.info.qrCode}
                    size={240}
                    style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                  />
                )
              ) : payOSModalData.info?.checkoutUrl ? (
                <QRCode
                  value={payOSModalData.info.checkoutUrl}
                  size={240}
                  style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                />
              ) : null}
            </div>

            {formattedPayAmount && (
              <div className="text-center">
                <p className="text-sm text-gray-500">Số tiền</p>
                <p className="text-2xl font-semibold text-gray-900">{formattedPayAmount}</p>
              </div>
            )}

            <div className="w-full space-y-2">
              {payOSModalData.info?.checkoutUrl && (
                <>
                  <Button
                    className="w-full gap-2"
                    onClick={() => window.open(payOSModalData.info?.checkoutUrl ?? '#', '_blank', 'noopener,noreferrer')}
                  >
                    <ExternalLink className="h-4 w-4" />
                    Mở trang thanh toán
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={copyCheckoutUrl}
                  >
                    <Copy className="h-4 w-4" />
                    Sao chép liên kết
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setPayOSModalData({ info: null, bill: null })}
              >
                Đóng
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
