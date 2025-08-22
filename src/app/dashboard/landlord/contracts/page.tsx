"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Calendar, FileText, DollarSign, Clock, Download, Eye } from "lucide-react"

// Mock data for contracts
const MOCK_CONTRACTS = [
  {
    id: '1',
    contractNumber: 'HD-2024-001',
    tenantName: 'Nguyễn Văn A',
    roomInfo: 'A102 - Studio cao cấp',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    rentAmount: 4500000,
    deposit: 4500000,
    status: 'active',
    lastPayment: '2024-01-15',
    avatar: ''
  },
  {
    id: '2',
    contractNumber: 'HD-2024-002',
    tenantName: 'Trần Thị B',
    roomInfo: 'B201 - Phòng đôi',
    startDate: '2023-12-01',
    endDate: '2024-11-30',
    rentAmount: 3800000,
    deposit: 3800000,
    status: 'active',
    lastPayment: '2024-01-10',
    avatar: ''
  },
  {
    id: '3',
    contractNumber: 'HD-2023-015',
    tenantName: 'Lê Văn C',
    roomInfo: 'A301 - Phòng đơn',
    startDate: '2023-11-01',
    endDate: '2024-10-31',
    rentAmount: 3200000,
    deposit: 3200000,
    status: 'expired',
    lastPayment: '2023-12-15',
    avatar: ''
  }
]

const STATUS_COLORS = {
  active: 'bg-green-100 text-green-800',
  expired: 'bg-red-100 text-red-800',
  pending: 'bg-yellow-100 text-yellow-800',
  terminated: 'bg-gray-100 text-gray-800'
}

const STATUS_LABELS = {
  active: 'Đang hiệu lực',
  expired: 'Hết hạn',
  pending: 'Chờ ký',
  terminated: 'Đã chấm dứt'
}

export default function ContractsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredContracts = MOCK_CONTRACTS.filter(contract => {
    const matchesSearch = contract.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.roomInfo.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getDaysUntilExpiry = (endDate: string) => {
    const end = new Date(endDate)
    const today = new Date()
    const diffTime = end.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <DashboardLayout userType="landlord">
      <div className="p-6">
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
                <SelectItem value="expired">Hết hạn</SelectItem>
                <SelectItem value="pending">Chờ ký</SelectItem>
                <SelectItem value="terminated">Đã chấm dứt</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Tạo hợp đồng mới</span>
          </Button>
        </div>

        {/* Contracts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredContracts.map((contract) => {
            const daysUntilExpiry = getDaysUntilExpiry(contract.endDate)
            const isExpiringSoon = daysUntilExpiry <= 30 && daysUntilExpiry > 0
            
            return (
              <Card key={contract.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{contract.contractNumber}</CardTitle>
                        <Badge className={STATUS_COLORS[contract.status as keyof typeof STATUS_COLORS]}>
                          {STATUS_LABELS[contract.status as keyof typeof STATUS_COLORS]}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={contract.avatar} alt={contract.tenantName} />
                        <AvatarFallback className="bg-green-100 text-green-600 text-xs">
                          {contract.tenantName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-sm">{contract.tenantName}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-gray-600">Phòng:</span>
                      <span className="font-medium">{contract.roomInfo}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-gray-600">Bắt đầu</p>
                          <p className="font-medium">{contract.startDate}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-gray-600">Kết thúc</p>
                          <p className="font-medium">{contract.endDate}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-gray-600">Tiền thuê</p>
                          <p className="font-medium text-green-600">
                            {contract.rentAmount.toLocaleString('vi-VN')} VNĐ
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-gray-600">Tiền cọc</p>
                          <p className="font-medium text-blue-600">
                            {contract.deposit.toLocaleString('vi-VN')} VNĐ
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-500">Thanh toán cuối: {contract.lastPayment}</span>
                    </div>
                    
                    {isExpiringSoon && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                        <p className="text-yellow-800 text-xs font-medium">
                          ⚠️ Hợp đồng sẽ hết hạn sau {daysUntilExpiry} ngày
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
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredContracts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">Không có hợp đồng nào</div>
            <Button>Tạo hợp đồng đầu tiên</Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
