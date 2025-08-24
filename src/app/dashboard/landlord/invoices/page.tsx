"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Calendar, Receipt, Clock, Download, Send, Eye } from "lucide-react"

// Mock data for invoices
const MOCK_INVOICES = [
  {
    id: '1',
    invoiceNumber: 'HD-2024-001',
    tenantName: 'Nguyễn Văn A',
    roomInfo: 'A102 - Studio cao cấp',
    issueDate: '2024-01-01',
    dueDate: '2024-01-15',
    totalAmount: 5200000,
    status: 'paid',
    paidDate: '2024-01-10',
    avatar: '',
    items: [
      { name: 'Tiền phòng', amount: 4500000 },
      { name: 'Tiền điện', amount: 350000 },
      { name: 'Tiền nước', amount: 150000 },
      { name: 'Tiền internet', amount: 200000 }
    ]
  },
  {
    id: '2',
    invoiceNumber: 'HD-2024-002',
    tenantName: 'Trần Thị B',
    roomInfo: 'B201 - Phòng đôi',
    issueDate: '2024-01-01',
    dueDate: '2024-01-15',
    totalAmount: 4200000,
    status: 'pending',
    paidDate: null,
    avatar: '',
    items: [
      { name: 'Tiền phòng', amount: 3800000 },
      { name: 'Tiền điện', amount: 250000 },
      { name: 'Tiền nước', amount: 100000 },
      { name: 'Tiền internet', amount: 200000 }
    ]
  },
  {
    id: '3',
    invoiceNumber: 'HD-2024-003',
    tenantName: 'Lê Văn C',
    roomInfo: 'A301 - Phòng đơn',
    issueDate: '2024-01-01',
    dueDate: '2024-01-15',
    totalAmount: 3800000,
    status: 'overdue',
    paidDate: null,
    avatar: '',
    items: [
      { name: 'Tiền phòng', amount: 3200000 },
      { name: 'Tiền điện', amount: 300000 },
      { name: 'Tiền nước', amount: 120000 },
      { name: 'Tiền internet', amount: 200000 }
    ]
  }
]

const STATUS_COLORS = {
  paid: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  overdue: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800'
}

const STATUS_LABELS = {
  paid: 'Đã thanh toán',
  pending: 'Chờ thanh toán',
  overdue: 'Quá hạn',
  cancelled: 'Đã hủy'
}

export default function InvoicesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredInvoices = MOCK_INVOICES.filter(invoice => {
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.roomInfo.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate)
    const today = new Date()
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <DashboardLayout userType="landlord">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý hóa đơn</h1>
          <p className="text-gray-600">Quản lý tất cả hóa đơn và thanh toán</p>
        </div>

        {/* Filters and Actions */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm hóa đơn..."
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
                <SelectItem value="paid">Đã thanh toán</SelectItem>
                <SelectItem value="pending">Chờ thanh toán</SelectItem>
                <SelectItem value="overdue">Quá hạn</SelectItem>
                <SelectItem value="cancelled">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button className="flex items-center space-x-2">
            <Receipt className="h-4 w-4" />
            <span>Tạo hóa đơn mới</span>
          </Button>
        </div>

        {/* Invoices Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredInvoices.map((invoice) => {
            const daysUntilDue = getDaysUntilDue(invoice.dueDate)
            const isDueSoon = daysUntilDue <= 7 && daysUntilDue > 0
            
            return (
              <Card key={invoice.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Receipt className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{invoice.invoiceNumber}</CardTitle>
                        <Badge className={STATUS_COLORS[invoice.status as keyof typeof STATUS_COLORS]}>
                          {STATUS_LABELS[invoice.status as keyof typeof STATUS_COLORS]}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={invoice.avatar} alt={invoice.tenantName} />
                        <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                          {invoice.tenantName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-sm">{invoice.tenantName}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-gray-600">Phòng:</span>
                      <span className="font-medium">{invoice.roomInfo}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-gray-600">Ngày tạo</p>
                          <p className="font-medium">{invoice.issueDate}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-gray-600">Hạn thanh toán</p>
                          <p className="font-medium">{invoice.dueDate}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-600">Chi tiết:</p>
                      <div className="space-y-1">
                        {invoice.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-xs">
                            <span className="text-gray-600">{item.name}:</span>
                            <span className="font-medium">{item.amount.toLocaleString('vi-VN')} VNĐ</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm border-t pt-2">
                      <span className="text-gray-600 font-medium">Tổng cộng:</span>
                      <span className="font-bold text-lg text-green-600">
                        {invoice.totalAmount.toLocaleString('vi-VN')} VNĐ
                      </span>
                    </div>
                    
                    {invoice.status === 'paid' && (
                      <div className="flex items-center space-x-2 text-sm text-green-600">
                        <Clock className="h-4 w-4" />
                        <span>Đã thanh toán: {invoice.paidDate}</span>
                      </div>
                    )}
                    
                    {isDueSoon && invoice.status === 'pending' && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                        <p className="text-yellow-800 text-xs font-medium">
                          ⚠️ Hạn thanh toán còn {daysUntilDue} ngày
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-1" />
                      Xem
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Download className="h-4 w-4 mr-1" />
                      Tải
                    </Button>
                  </div>
                  
                  {invoice.status === 'pending' && (
                    <div className="mt-2">
                      <Button size="sm" className="w-full">
                        <Send className="h-4 w-4 mr-1" />
                        Gửi nhắc nhở
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredInvoices.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">Không có hóa đơn nào</div>
            <Button>Tạo hóa đơn đầu tiên</Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
