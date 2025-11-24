"use client"

import { useEffect, useMemo, useState } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CreditCard, Download, AlertCircle, Receipt, Loader2, ExternalLink } from "lucide-react"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { toast } from "sonner"
import QRCode from "react-qr-code"
import type { PayOSLinkResponse } from '@/types/bill.types'

interface BillItem {
  id: string
  name: string
  type: 'rent' | 'electricity' | 'water' | 'internet' | 'cleaning' | 'other'
  quantity: number
  unit_price: number
  total: number
}

interface Bill {
  id: string
  rental_id: string
  tenant_name: string
  room_number: string
  amount: number
  due_date: string
  status: 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled'
  bill_items: BillItem[]
  created_at: string
}

export default function TenantBillsPage() {
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [processingPayment, setProcessingPayment] = useState<string | null>(null)
  const [payOSInfo, setPayOSInfo] = useState<PayOSLinkResponse | null>(null)

  const formattedAmount = useMemo(() => {
    if (!payOSInfo?.amount) return null
    return payOSInfo.amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
  }, [payOSInfo])

  useEffect(() => {
    fetchBills()
  }, [])

  const fetchBills = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bills/tenant`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setBills(data.bills || [])
      }
    } catch (error) {
      console.error('Error fetching bills:', error)
    } finally {
      setLoading(false)
    }
  }

  const buildPayOSUrls = (billId: string) => {
    const baseUrl = (process.env.NEXT_PUBLIC_PAYMENT_RETURN_BASE_URL || 'https://trustay.life').replace(/\/$/, '')
    const query = `billId=${encodeURIComponent(billId)}`
    return {
      returnUrl: `${baseUrl}/payments/success?${query}`,
      cancelUrl: `${baseUrl}/payments/cancel?${query}`
    }
  }

  const payBill = async (billId: string) => {
    setProcessingPayment(billId)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('Bạn cần đăng nhập để thanh toán')
        return
      }

      const payload = buildPayOSUrls(billId)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bills/${billId}/payos-link`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: payload ? JSON.stringify(payload) : undefined
      })

      if (!response.ok) {
        throw new Error('Không thể tạo liên kết PayOS')
      }

      const data: PayOSLinkResponse = await response.json()

      if (!data.checkoutUrl && !data.qrCode) {
        throw new Error('Không nhận được liên kết thanh toán hợp lệ')
      }

      setPayOSInfo(data)

      // Refresh local list shortly after to reflect potential status updates
      setTimeout(fetchBills, 2000)
    } catch (error) {
      console.error('Error creating PayOS link:', error)
      toast.error('Có lỗi xảy ra khi tạo liên kết PayOS')
    } finally {
      setProcessingPayment(null)
    }
  }

  const downloadBill = async (billId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bills/${billId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `bill-${billId}.pdf`
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error downloading bill:', error)
    }
  }

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
      case 'electricity': return 'Tiền điện'
      case 'water': return 'Tiền nước'
      case 'internet': return 'Internet'
      case 'cleaning': return 'Vệ sinh'
      case 'other': return 'Khác'
      default: return type
    }
  }

  const overdueBills = bills.filter(bill => bill.status === 'overdue')
  const pendingBills = bills.filter(bill => bill.status === 'pending')

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Đang tải hóa đơn...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
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
                      Hóa đơn phòng {bill.room_number}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Hạn thanh toán: {new Date(bill.due_date).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <Badge className={getStatusColor(bill.status)}>
                    {getStatusText(bill.status)}
                  </Badge>
                </div>

                {/* Bill Items */}
                <div className="space-y-2 mb-4 bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Chi tiết hóa đơn:</h4>
                  {bill.bill_items && bill.bill_items.length > 0 ? (
                    bill.bill_items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-700">
                          {getBillTypeLabel(item.type)} {item.quantity > 1 && `(x${item.quantity})`}
                        </span>
                        <span className="font-medium">
                          {item.total.toLocaleString('vi-VN')} đ
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500">Không có chi tiết</div>
                  )}
                </div>

                <div className="border-t pt-4 flex justify-between items-center">
                  <div>
                    <span className="text-sm text-gray-600">Tổng cộng:</span>
                    <div className="text-xl font-bold text-gray-900">
                      {bill.amount.toLocaleString('vi-VN')} đ
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadBill(bill.id)}
                    >
                      <Download size={16} className="mr-1" />
                      Tải PDF
                    </Button>
                    {(bill.status === 'pending' || bill.status === 'overdue') && (
                      <Button
                        size="sm"
                        onClick={() => payBill(bill.id)}
                        disabled={processingPayment === bill.id}
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
                            Thanh Toán
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

      <Dialog open={!!payOSInfo} onOpenChange={(open) => !open && setPayOSInfo(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Thanh toán qua PayOS</DialogTitle>
            <DialogDescription>
              Quét mã QR hoặc mở liên kết để hoàn tất giao dịch. Hệ thống sẽ tự cập nhật trạng thái hóa đơn sau khi PayOS xác nhận.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-white rounded-lg border">
              {payOSInfo?.qrCode ? (
                /^https?:/i.test(payOSInfo.qrCode) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={payOSInfo.qrCode}
                    alt="Mã QR PayOS"
                    className="w-56 h-56 object-contain"
                  />
                ) : (
                  <QRCode
                    value={payOSInfo.qrCode}
                    size={224}
                    style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                  />
                )
              ) : (
                payOSInfo?.checkoutUrl && (
                  <QRCode
                    value={payOSInfo.checkoutUrl}
                    size={224}
                    style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                  />
                )
              )}
            </div>

            {formattedAmount && (
              <div className="text-center">
                <p className="text-sm text-gray-500">Số tiền</p>
                <p className="text-xl font-semibold text-gray-900">{formattedAmount}</p>
              </div>
            )}

            <div className="flex flex-col gap-2 w-full">
              {payOSInfo?.checkoutUrl && (
                <Button
                  onClick={() => payOSInfo.checkoutUrl && window.open(payOSInfo.checkoutUrl, '_blank', 'noopener,noreferrer')}
                  className="gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Mở trang thanh toán PayOS
                </Button>
              )}
              <Button variant="outline" onClick={() => setPayOSInfo(null)}>
                Đóng
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
