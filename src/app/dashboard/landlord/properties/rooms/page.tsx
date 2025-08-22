"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, MoreHorizontal } from "lucide-react"

// Mock data for rooms
const MOCK_ROOMS = [
  {
    id: '1',
    name: 'Phòng đơn view đẹp',
    roomNumber: 'A101',
    building: 'Toà A - 123 Đường ABC',
    floor: 'Tầng 1',
    area: 25,
    price: 3000000,
    status: 'available',
    tenant: null,
    lastUpdated: '2024-01-15'
  },
  {
    id: '2',
    name: 'Studio cao cấp',
    roomNumber: 'A102',
    building: 'Toà A - 123 Đường ABC',
    floor: 'Tầng 1',
    area: 35,
    price: 4500000,
    status: 'occupied',
    tenant: 'Nguyễn Văn A',
    lastUpdated: '2024-01-10'
  },
  {
    id: '3',
    name: 'Phòng đôi tiện nghi',
    roomNumber: 'A201',
    building: 'Toà A - 123 Đường ABC',
    floor: 'Tầng 2',
    area: 40,
    price: 5500000,
    status: 'maintenance',
    tenant: null,
    lastUpdated: '2024-01-12'
  }
]

const STATUS_COLORS = {
  available: 'bg-green-100 text-green-800',
  occupied: 'bg-blue-100 text-blue-800',
  maintenance: 'bg-yellow-100 text-yellow-800',
  reserved: 'bg-purple-100 text-purple-800'
}

const STATUS_LABELS = {
  available: 'Còn trống',
  occupied: 'Đã cho thuê',
  maintenance: 'Bảo trì',
  reserved: 'Đã đặt trước'
}

export default function RoomsManagementPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [buildingFilter, setBuildingFilter] = useState('all')

  const filteredRooms = MOCK_ROOMS.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || room.status === statusFilter
    const matchesBuilding = buildingFilter === 'all' || room.building === buildingFilter
    
    return matchesSearch && matchesStatus && matchesBuilding
  })

  return (
    <DashboardLayout userType="landlord">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý phòng</h1>
          <p className="text-gray-600">Quản lý tất cả các phòng trong hệ thống</p>
        </div>

        {/* Filters and Actions */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm phòng..."
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
                <SelectItem value="available">Còn trống</SelectItem>
                <SelectItem value="occupied">Đã cho thuê</SelectItem>
                <SelectItem value="maintenance">Bảo trì</SelectItem>
                <SelectItem value="reserved">Đã đặt trước</SelectItem>
              </SelectContent>
            </Select>

            <Select value={buildingFilter} onValueChange={setBuildingFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Toà nhà" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả toà nhà</SelectItem>
                <SelectItem value="Toà A - 123 Đường ABC">Toà A</SelectItem>
                <SelectItem value="Toà B - 456 Đường XYZ">Toà B</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Thêm phòng</span>
          </Button>
        </div>

        {/* Rooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <Card key={room.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1">{room.name}</CardTitle>
                    <p className="text-sm text-gray-600">{room.roomNumber}</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Toà nhà:</span>
                    <span className="font-medium">{room.building}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Tầng:</span>
                    <span className="font-medium">{room.floor}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Diện tích:</span>
                    <span className="font-medium">{room.area}m²</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Giá thuê:</span>
                    <span className="font-medium text-green-600">
                      {room.price.toLocaleString('vi-VN')} VNĐ
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Trạng thái:</span>
                    <Badge className={STATUS_COLORS[room.status as keyof typeof STATUS_COLORS]}>
                      {STATUS_LABELS[room.status as keyof typeof STATUS_LABELS]}
                    </Badge>
                  </div>
                  
                  {room.tenant && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Người thuê:</span>
                      <span className="font-medium">{room.tenant}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Cập nhật:</span>
                    <span className="text-gray-500">{room.lastUpdated}</span>
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

        {filteredRooms.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">Không tìm thấy phòng nào</div>
            <Button variant="outline">Thêm phòng đầu tiên</Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
