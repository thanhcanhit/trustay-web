"use client"

import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Download, AlertCircle, Receipt, Loader2 } from "lucide-react"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"

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

  useEffect(() => {
    fetchBills()
  }, [])

  const fetchBills = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bills/tenant`, {
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

  const payBill = async (billId: string) => {
    setProcessingPayment(billId)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bills/${billId}/pay`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        fetchBills() // Refresh list
      } else {
        alert('Có lỗi xảy ra khi thanh toán')
      }
    } catch (error) {
      console.error('Error paying bill:', error)
      alert('Có lỗi xảy ra khi thanh toán')
    } finally {
      setProcessingPayment(null)
    }
  }

  const downloadBill = async (billId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bills/${billId}/download`, {
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
    </div>
  )
}
