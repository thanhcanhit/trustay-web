"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Search, Phone, Mail, Calendar } from "lucide-react"

// Mock data for tenants
const MOCK_TENANTS = [
  {
    id: '1',
    name: 'Nguyễn Văn A',
    phone: '0123456789',
    email: 'nguyenvana@email.com',
    room: 'A102 - Studio cao cấp',
    moveInDate: '2024-01-01',
    contractEndDate: '2024-12-31',
    status: 'active',
    rentAmount: 4500000,
    lastPayment: '2024-01-15'
  },
  {
    id: '2',
    name: 'Trần Thị B',
    phone: '0987654321',
    email: 'tranthib@email.com',
    room: 'B201 - Phòng đôi',
    moveInDate: '2023-12-01',
    contractEndDate: '2024-11-30',
    status: 'active',
    rentAmount: 3800000,
    lastPayment: '2024-01-10'
  },
  {
    id: '3',
    name: 'Lê Văn C',
    phone: '0555666777',
    email: 'levanc@email.com',
    room: 'A301 - Phòng đơn',
    moveInDate: '2023-11-01',
    contractEndDate: '2024-10-31',
    status: 'overdue',
    rentAmount: 3200000,
    lastPayment: '2023-12-15'
  }
]

const STATUS_COLORS = {
  active: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
  inactive: 'bg-gray-100 text-gray-800',
  pending: 'bg-yellow-100 text-yellow-800'
}

const STATUS_LABELS = {
  active: 'Đang thuê',
  overdue: 'Quá hạn thanh toán',
  inactive: 'Không còn thuê',
  pending: 'Chờ ký hợp đồng'
}

export default function TenantsManagementPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredTenants = MOCK_TENANTS.filter(tenant => {
    const matchesSearch = tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.phone.includes(searchTerm) ||
                         tenant.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || tenant.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  return (
    <DashboardLayout userType="landlord">
      <div className="px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý khách thuê</h1>
          <p className="text-gray-600">Quản lý thông tin và trạng thái của tất cả khách thuê</p>
        </div>

        {/* Filters and Actions */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm khách thuê..."
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
                <SelectItem value="active">Đang thuê</SelectItem>
                <SelectItem value="overdue">Quá hạn thanh toán</SelectItem>
                <SelectItem value="inactive">Không còn thuê</SelectItem>
                <SelectItem value="pending">Chờ ký hợp đồng</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Thêm khách thuê</span>
          </Button>
        </div>

        {/* Tenants Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTenants.map((tenant) => (
            <Card key={tenant.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="" alt={tenant.name} />
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {tenant.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{tenant.name}</CardTitle>
                      <Badge className={STATUS_COLORS[tenant.status as keyof typeof STATUS_COLORS]}>
                        {STATUS_LABELS[tenant.status as keyof typeof STATUS_LABELS]}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{tenant.phone}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{tenant.email}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Phòng: {tenant.room}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Tiền thuê:</span>
                    <span className="font-medium text-green-600">
                      {tenant.rentAmount.toLocaleString('vi-VN')} VNĐ
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Ngày vào:</span>
                    <span className="font-medium">{tenant.moveInDate}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Hết hạn hợp đồng:</span>
                    <span className="font-medium">{tenant.contractEndDate}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Thanh toán cuối:</span>
                    <span className="text-gray-500">{tenant.lastPayment}</span>
                  </div>
                </div>
                
                <div className="mt-4 flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Chỉnh sửa
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Chi tiết
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTenants.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">Không tìm thấy khách thuê nào</div>
            <Button variant="outline">Thêm khách thuê đầu tiên</Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
