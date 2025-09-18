"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, AlertTriangle, Clock, MapPin, Phone, Mail, CheckCircle } from "lucide-react"

// Mock data for feedback
const MOCK_FEEDBACK = [
  {
    id: '1',
    type: 'complaint',
    priority: 'high',
    status: 'pending',
    tenantName: 'Nguyễn Văn A',
    roomInfo: 'A102 - Studio cao cấp',
    title: 'Mất nước trong phòng',
    description: 'Từ sáng đến giờ không có nước, cần khắc phục gấp để sinh hoạt.',
    contactPhone: '0123456789',
    contactEmail: 'nguyenvana@email.com',
    createdAt: '2024-01-20 08:30',
    avatar: ''
  },
  {
    id: '2',
    type: 'suggestion',
    priority: 'medium',
    status: 'in-progress',
    tenantName: 'Trần Thị B',
    roomInfo: 'B201 - Phòng đôi',
    title: 'Đề xuất lắp thêm camera an ninh',
    description: 'Để tăng cường an ninh cho khu vực để xe, đề xuất lắp thêm camera.',
    contactPhone: '0987654321',
    contactEmail: 'tranthib@email.com',
    createdAt: '2024-01-19 15:45',
    avatar: ''
  },
  {
    id: '3',
    type: 'maintenance',
    priority: 'low',
    status: 'resolved',
    tenantName: 'Lê Văn C',
    roomInfo: 'A301 - Phòng đơn',
    title: 'Bóng đèn phòng tắm bị hỏng',
    description: 'Bóng đèn phòng tắm bị chập chờn, cần thay mới.',
    contactPhone: '0555666777',
    contactEmail: 'levanc@email.com',
    createdAt: '2024-01-18 20:15',
    resolvedAt: '2024-01-19 10:30',
    avatar: ''
  }
]

const FEEDBACK_TYPE_LABELS = {
  complaint: 'Khiếu nại',
  suggestion: 'Đề xuất',
  maintenance: 'Bảo trì',
  emergency: 'Khẩn cấp'
}

const PRIORITY_COLORS = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-green-100 text-green-800'
}

const PRIORITY_LABELS = {
  high: 'Cao',
  medium: 'Trung bình',
  low: 'Thấp'
}

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800'
}

const STATUS_LABELS = {
  pending: 'Chờ xử lý',
  'in-progress': 'Đang xử lý',
  resolved: 'Đã giải quyết',
  closed: 'Đã đóng'
}

export default function FeedbackPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const TenantAvatar = ({ name, src }: { name: string; src?: string }) => {
    const [error, setError] = useState(false)
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase()
    const showImage = !!src && src.trim() !== '' && !error
    return (
      <Avatar className="h-8 w-8">
        {showImage ? (
          <AvatarImage src={src} alt={name} onError={() => setError(true)} />
        ) : (
          <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
            {initials}
          </AvatarFallback>
        )}
      </Avatar>
    )
  }

  const filteredFeedback = MOCK_FEEDBACK.filter(feedback => {
    const matchesSearch = feedback.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feedback.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feedback.tenantName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || feedback.type === typeFilter
    const matchesPriority = priorityFilter === 'all' || feedback.priority === priorityFilter
    const matchesStatus = statusFilter === 'all' || feedback.status === statusFilter
    
    return matchesSearch && matchesType && matchesPriority && matchesStatus
  })

  const handleStatusChange = (feedbackId: string, newStatus: string) => {
    // TODO: Call API to update status
    console.log(`Updating feedback ${feedbackId} to status: ${newStatus}`)
  }

  return (
    <DashboardLayout userType="landlord">
      <div className="px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Phản ánh, sự cố</h1>
          <p className="text-gray-600">Quản lý các phản ánh và sự cố từ khách thuê</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm phản ánh..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Loại" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả loại</SelectItem>
              <SelectItem value="complaint">Khiếu nại</SelectItem>
              <SelectItem value="suggestion">Đề xuất</SelectItem>
              <SelectItem value="maintenance">Bảo trì</SelectItem>
              <SelectItem value="emergency">Khẩn cấp</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Mức độ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả mức độ</SelectItem>
              <SelectItem value="high">Cao</SelectItem>
              <SelectItem value="medium">Trung bình</SelectItem>
              <SelectItem value="low">Thấp</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="pending">Chờ xử lý</SelectItem>
              <SelectItem value="in-progress">Đang xử lý</SelectItem>
              <SelectItem value="resolved">Đã giải quyết</SelectItem>
              <SelectItem value="closed">Đã đóng</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Feedback Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredFeedback.map((feedback) => (
            <Card key={feedback.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{feedback.title}</CardTitle>
                      <div className="flex space-x-2 mt-1">
                        <Badge className={PRIORITY_COLORS[feedback.priority as keyof typeof PRIORITY_COLORS]}>
                          {PRIORITY_LABELS[feedback.priority as keyof typeof PRIORITY_LABELS]}
                        </Badge>
                        <Badge className={STATUS_COLORS[feedback.status as keyof typeof STATUS_COLORS]}>
                          {STATUS_LABELS[feedback.status as keyof typeof STATUS_LABELS]}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <TenantAvatar name={feedback.tenantName} src={feedback.avatar} />
                    <div>
                      <span className="font-medium text-sm">{feedback.tenantName}</span>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <MapPin className="h-3 w-3" />
                        <span>{feedback.roomInfo}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-gray-600">Loại:</span>
                    <Badge variant="outline">
                      {FEEDBACK_TYPE_LABELS[feedback.type as keyof typeof FEEDBACK_TYPE_LABELS]}
                    </Badge>
                  </div>
                  
                  <div className="text-sm">
                    <p className="text-gray-600 font-medium mb-1">Mô tả:</p>
                    <p className="text-gray-700 bg-gray-50 p-2 rounded text-xs">
                      {feedback.description}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{feedback.contactPhone}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{feedback.contactEmail}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>Gửi: {feedback.createdAt}</span>
                  </div>
                  
                  {feedback.resolvedAt && (
                    <div className="flex items-center space-x-2 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>Giải quyết: {feedback.resolvedAt}</span>
                    </div>
                  )}
                </div>
                
                {feedback.status === 'pending' && (
                  <div className="mt-4 flex space-x-2">
                    <Button 
                      size="sm" 
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      onClick={() => handleStatusChange(feedback.id, 'in-progress')}
                    >
                      Bắt đầu xử lý
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleStatusChange(feedback.id, 'resolved')}
                    >
                      Đánh dấu đã giải quyết
                    </Button>
                  </div>
                )}
                
                {feedback.status === 'in-progress' && (
                  <div className="mt-4">
                    <Button 
                      size="sm" 
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => handleStatusChange(feedback.id, 'resolved')}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Đánh dấu đã giải quyết
                    </Button>
                  </div>
                )}
                
                {feedback.status === 'resolved' && (
                  <div className="mt-4">
                    <Button variant="outline" size="sm" className="w-full">
                      Liên hệ khách hàng
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredFeedback.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">Không có phản ánh nào</div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
