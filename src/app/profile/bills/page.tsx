"use client"

import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreditCard, AlertCircle, Receipt, Loader2 } from "lucide-react"
import { ProfileLayout } from "@/components/profile/profile-layout"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { useBillStore } from "@/stores/billStore"

export default function TenantBillsPage() {
  const { bills, loading, markingPaid, loadAll, markPaid } = useBillStore()
  const [processingPayment, setProcessingPayment] = useState<string | null>(null)

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Đã Thanh Toán'
      case 'overdue': return 'Quá Hạn'
      case 'pending': return 'Chờ Thanh Toán'
      case 'draft': return 'Bản Nháp'
      case 'cancelled': return 'Đã Hủy'
      default: return status
    }
  }

  const getBillTypeLabel = (type: string) => {
    switch (type) {
      case 'rent': return 'Tiền thuê'
      case 'electric': return 'Tiền điện'
      case 'water': return 'Tiền nước'
      case 'service': return 'Dịch vụ'
      default: return type
    }
  }

  const handleMarkAsPaid = async (billId: string) => {
    setProcessingPayment(billId)
    const success = await markPaid(billId)
    if (!success) {
      alert('Có lỗi xảy ra khi đánh dấu đã thanh toán')
    }
    setProcessingPayment(null)
  }

  const overdueBills = bills.filter(bill => bill.status === 'overdue')
  const pendingBills = bills.filter(bill => bill.status === 'pending')

  if (loading) {
    return (
      <ProfileLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Đang tải hóa đơn...</p>
          </div>
        </div>
      </ProfileLayout>
    )
  }

  return (
    <ProfileLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Hóa Đơn Của Tôi</h1>
          <p className="text-gray-600">Quản lý và thanh toán hóa đơn phòng trọ</p>
        </div>

        {/* Alerts */}
        {overdueBills.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <div className="p-4 flex items-center space-x-2 text-red-800">
              <AlertCircle size={20} />
              <span>
                Bạn có {overdueBills.length} hóa đơn quá hạn cần thanh toán
              </span>
            </div>
          </Card>
        )}

        {pendingBills.length > 0 && (
          <Card className="border-yellow-200 bg-yellow-50">
            <div className="p-4 flex items-center space-x-2 text-yellow-800">
              <AlertCircle size={20} />
              <span>
                Bạn có {pendingBills.length} hóa đơn chờ thanh toán
              </span>
            </div>
          </Card>
        )}

        {/* Bills List */}
        {bills.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Receipt />
              </EmptyMedia>
              <EmptyTitle>Chưa có hóa đơn</EmptyTitle>
              <EmptyDescription>
                Bạn chưa có hóa đơn nào cần thanh toán
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="grid gap-4">
            {bills.map((bill) => (
              <Card key={bill.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Receipt className="h-5 w-5 text-gray-500" />
                      Hóa đơn {bill.billingPeriod}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Kỳ: {new Date(bill.periodStart).toLocaleDateString('vi-VN')} - {new Date(bill.periodEnd).toLocaleDateString('vi-VN')}
                    </p>
                    <p className="text-gray-600 text-sm">
                      Hạn thanh toán: {new Date(bill.dueDate).toLocaleDateString('vi-VN')}
                    </p>
                    {bill.paidDate && (
                      <p className="text-green-600 text-sm">
                        Đã thanh toán: {new Date(bill.paidDate).toLocaleDateString('vi-VN')}
                      </p>
                    )}
                  </div>
                  <Badge className={getStatusColor(bill.status)}>
                    {getStatusText(bill.status)}
                  </Badge>
                </div>

                {/* Bill Items */}
                <div className="space-y-2 mb-4 bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Chi tiết hóa đơn:</h4>
                  {bill.billItems && bill.billItems.length > 0 ? (
                    bill.billItems.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-700">
                          {item.itemName || getBillTypeLabel(item.itemType)}
                          {item.quantity && item.quantity > 1 && ` (x${item.quantity})`}
                          {item.description && <span className="text-gray-500 ml-2 text-xs">({item.description})</span>}
                        </span>
                        <span className="font-medium">
                          {item.amount.toLocaleString('vi-VN')} {item.currency}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500">Không có chi tiết</div>
                  )}
                </div>

                {/* Financial Summary */}
                <div className="space-y-1 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tổng phụ:</span>
                    <span className="font-medium">{bill.subtotal.toLocaleString('vi-VN')} đ</span>
                  </div>
                  {bill.discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Giảm giá:</span>
                      <span>-{bill.discountAmount.toLocaleString('vi-VN')} đ</span>
                    </div>
                  )}
                  {bill.taxAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Thuế:</span>
                      <span className="font-medium">+{bill.taxAmount.toLocaleString('vi-VN')} đ</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-gray-600">Tổng cộng:</span>
                    <span className="font-bold text-lg">{bill.totalAmount.toLocaleString('vi-VN')} đ</span>
                  </div>
                  {bill.paidAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Đã thanh toán:</span>
                      <span className="font-medium">{bill.paidAmount.toLocaleString('vi-VN')} đ</span>
                    </div>
                  )}
                  {bill.remainingAmount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Còn lại:</span>
                      <span className="font-bold">{bill.remainingAmount.toLocaleString('vi-VN')} đ</span>
                    </div>
                  )}
                </div>

                {bill.notes && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800"><span className="font-medium">Ghi chú:</span> {bill.notes}</p>
                  </div>
                )}

                <div className="border-t pt-4 flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    Tạo lúc: {new Date(bill.createdAt).toLocaleDateString('vi-VN')}
                  </div>
                  <div className="flex space-x-2">
                    {(bill.status === 'pending' || bill.status === 'overdue') && (
                      <Button
                        size="sm"
                        onClick={() => handleMarkAsPaid(bill.id)}
                        disabled={processingPayment === bill.id || markingPaid}
                        className={bill.status === 'overdue' ? 'bg-red-600 hover:bg-red-700' : ''}
                      >
                        {processingPayment === bill.id ? (
                          <>
                            <Loader2 size={16} className="mr-1 animate-spin" />
                            Đang xử lý...
                          </>
                        ) : (
                          <>
                            <CreditCard size={16} className="mr-1" />
                            Đánh dấu đã thanh toán
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ProfileLayout>
  )
}
