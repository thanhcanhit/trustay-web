"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Wrench, Settings, DollarSign, Users, Calendar } from "lucide-react"

// Mock data for services
const MOCK_SERVICES = [
  {
    id: '1',
    name: 'Dọn dẹp phòng',
    description: 'Dịch vụ dọn dẹp phòng định kỳ hàng tuần',
    price: 200000,
    priceType: 'per-time',
    status: 'active',
    usageCount: 15,
    lastUsed: '2024-01-20',
    category: 'Vệ sinh'
  },
  {
    id: '2',
    name: 'Giặt ủi',
    description: 'Dịch vụ giặt ủi quần áo cho khách thuê',
    price: 50000,
    priceType: 'per-kg',
    status: 'active',
    usageCount: 8,
    lastUsed: '2024-01-18',
    category: 'Giặt ủi'
  },
  {
    id: '3',
    name: 'Bảo trì điện nước',
    description: 'Dịch vụ bảo trì hệ thống điện nước',
    price: 300000,
    priceType: 'per-time',
    status: 'active',
    usageCount: 3,
    lastUsed: '2024-01-15',
    category: 'Bảo trì'
  },
  {
    id: '4',
    name: 'Đưa đón sân bay',
    description: 'Dịch vụ đưa đón khách từ sân bay',
    price: 500000,
    priceType: 'per-trip',
    status: 'inactive',
    usageCount: 0,
    lastUsed: null,
    category: 'Vận chuyển'
  }
]

const PRICE_TYPE_LABELS = {
  'per-time': 'Theo lần',
  'per-kg': 'Theo kg',
  'per-trip': 'Theo chuyến',
  'per-month': 'Theo tháng'
}

const STATUS_COLORS = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  maintenance: 'bg-yellow-100 text-yellow-800'
}

const STATUS_LABELS = {
  active: 'Hoạt động',
  inactive: 'Tạm dừng',
  maintenance: 'Bảo trì'
}

export default function ServicesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const filteredServices = MOCK_SERVICES.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || service.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter
    
    return matchesSearch && matchesStatus && matchesCategory
  })

  const totalRevenue = MOCK_SERVICES.reduce((sum, service) => {
    if (service.status === 'active') {
      return sum + (service.price * service.usageCount)
    }
    return sum
  }, 0)

  return (
    <DashboardLayout userType="landlord">
      <div className="px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý dịch vụ</h1>
          <p className="text-gray-600">Quản lý các dịch vụ bổ sung cho khách thuê</p>
        </div>

        {/* Summary Card */}
        <div className="mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Tổng doanh thu dịch vụ</h3>
                  <p className="text-3xl font-bold text-green-600">
                    {totalRevenue.toLocaleString('vi-VN')} VNĐ
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm dịch vụ..."
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
                <SelectItem value="active">Hoạt động</SelectItem>
                <SelectItem value="inactive">Tạm dừng</SelectItem>
                <SelectItem value="maintenance">Bảo trì</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                <SelectItem value="Vệ sinh">Vệ sinh</SelectItem>
                <SelectItem value="Giặt ủi">Giặt ủi</SelectItem>
                <SelectItem value="Bảo trì">Bảo trì</SelectItem>
                <SelectItem value="Vận chuyển">Vận chuyển</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Thêm dịch vụ mới</span>
          </Button>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <Card key={service.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Wrench className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                      <Badge className={STATUS_COLORS[service.status as keyof typeof STATUS_COLORS]}>
                        {STATUS_LABELS[service.status as keyof typeof STATUS_LABELS]}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">{service.description}</p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Danh mục:</span>
                    <span className="font-medium">{service.category}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Giá:</span>
                    <span className="font-medium text-green-600">
                      {service.price.toLocaleString('vi-VN')} VNĐ
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Đơn vị tính:</span>
                    <span className="font-medium">{PRICE_TYPE_LABELS[service.priceType as keyof typeof PRICE_TYPE_LABELS]}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-gray-600">Sử dụng</p>
                        <p className="font-medium">{service.usageCount} lần</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-gray-600">Lần cuối</p>
                        <p className="font-medium">
                          {service.lastUsed ? service.lastUsed : 'Chưa sử dụng'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Doanh thu:</span>
                    <span className="font-bold text-green-600">
                      {(service.price * service.usageCount).toLocaleString('vi-VN')} VNĐ
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Settings className="h-4 w-4 mr-1" />
                    Chỉnh sửa
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Wrench className="h-4 w-4 mr-1" />
                    Quản lý
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">Không có dịch vụ nào</div>
            <Button>Thêm dịch vụ đầu tiên</Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
