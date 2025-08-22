"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Calendar, Home, Phone, Mail, Clock } from "lucide-react"

// Mock data for rental requests
const MOCK_REQUESTS = [
  {
    id: '1',
    tenantName: 'Nguyễn Văn A',
    phone: '0123456789',
    email: 'nguyenvana@email.com',
    roomType: 'Phòng đơn',
    budget: '3-5 triệu',
    moveInDate: '2024-02-01',
    duration: '12 tháng',
    status: 'pending',
    message: 'Tôi đang tìm phòng đơn gần trường ĐH Bách Khoa, có thể xem phòng vào cuối tuần không?',
    createdAt: '2024-01-20',
    avatar: ''
  },
  {
    id: '2',
    tenantName: 'Trần Thị B',
    phone: '0987654321',
    email: 'tranthib@email.com',
    roomType: 'Studio',
    budget: '5-7 triệu',
    moveInDate: '2024-02-15',
    duration: '6 tháng',
    status: 'approved',
    message: 'Cần studio cao cấp, có đầy đủ tiện nghi, gần trung tâm thành phố.',
    createdAt: '2024-01-18',
    avatar: ''
  },
  {
    id: '3',
    tenantName: 'Lê Văn C',
    phone: '0555666777',
    email: 'levanc@email.com',
    roomType: 'Phòng đôi',
    budget: '4-6 triệu',
    moveInDate: '2024-03-01',
    duration: '12 tháng',
    status: 'rejected',
    message: 'Tìm phòng đôi để ở cùng bạn, cần gần bến xe buýt.',
    createdAt: '2024-01-15',
    avatar: ''
  }
]

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  expired: 'bg-gray-100 text-gray-800'
}

const STATUS_LABELS = {
  pending: 'Chờ xử lý',
  approved: 'Đã chấp nhận',
  rejected: 'Đã từ chối',
  expired: 'Hết hạn'
}

export default function RentalRequestsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [roomTypeFilter, setRoomTypeFilter] = useState('all')

  const filteredRequests = MOCK_REQUESTS.filter(request => {
    const matchesSearch = request.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.phone.includes(searchTerm) ||
                         request.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter
    const matchesRoomType = roomTypeFilter === 'all' || request.roomType === roomTypeFilter
    
    return matchesSearch && matchesStatus && matchesRoomType
  })

  const handleStatusChange = (requestId: string, newStatus: string) => {
    // TODO: Call API to update status
    console.log(`Updating request ${requestId} to status: ${newStatus}`)
  }

  return (
    <DashboardLayout userType="landlord">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Yêu cầu thuê trọ</h1>
          <p className="text-gray-600">Quản lý các yêu cầu thuê trọ từ khách hàng</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm yêu cầu..."
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
              <SelectItem value="pending">Chờ xử lý</SelectItem>
              <SelectItem value="approved">Đã chấp nhận</SelectItem>
              <SelectItem value="rejected">Đã từ chối</SelectItem>
              <SelectItem value="expired">Hết hạn</SelectItem>
            </SelectContent>
          </Select>

          <Select value={roomTypeFilter} onValueChange={setRoomTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Loại phòng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả loại phòng</SelectItem>
              <SelectItem value="Phòng đơn">Phòng đơn</SelectItem>
              <SelectItem value="Studio">Studio</SelectItem>
              <SelectItem value="Phòng đôi">Phòng đôi</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Requests Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredRequests.map((request) => (
            <Card key={request.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={request.avatar} alt={request.tenantName} />
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {request.tenantName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{request.tenantName}</CardTitle>
                      <Badge className={STATUS_COLORS[request.status as keyof typeof STATUS_COLORS]}>
                        {STATUS_LABELS[request.status as keyof typeof STATUS_LABELS]}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{request.phone}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{request.email}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <Home className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{request.roomType}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Ngân sách:</span>
                    <span className="font-medium text-green-600">{request.budget}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Ngày vào: {request.moveInDate}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Thời hạn:</span>
                    <span className="font-medium">{request.duration}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-500">Gửi: {request.createdAt}</span>
                  </div>
                  
                  <div className="text-sm">
                    <p className="text-gray-600 font-medium mb-1">Tin nhắn:</p>
                    <p className="text-gray-700 bg-gray-50 p-2 rounded text-xs">
                      {request.message}
                    </p>
                  </div>
                </div>
                
                {request.status === 'pending' && (
                  <div className="mt-4 flex space-x-2">
                    <Button 
                      size="sm" 
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handleStatusChange(request.id, 'approved')}
                    >
                      Chấp nhận
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
                      onClick={() => handleStatusChange(request.id, 'rejected')}
                    >
                      Từ chối
                    </Button>
                  </div>
                )}
                
                {request.status !== 'pending' && (
                  <div className="mt-4">
                    <Button variant="outline" size="sm" className="w-full">
                      Xem chi tiết
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">Không có yêu cầu thuê trọ nào</div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
