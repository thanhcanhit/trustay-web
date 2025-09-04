"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Star, MessageSquare, Calendar, MapPin, ThumbsUp, ThumbsDown, Reply } from "lucide-react"

// Mock data for reviews
const MOCK_REVIEWS = [
  {
    id: '1',
    tenantName: 'Nguyễn Văn A',
    roomInfo: 'A102 - Studio cao cấp',
    rating: 5,
    title: 'Phòng rất đẹp và tiện nghi',
    content: 'Phòng rất sạch sẽ, đầy đủ tiện nghi, chủ nhà thân thiện và nhiệt tình. Vị trí thuận tiện, gần trường học và chợ. Rất hài lòng với quyết định thuê phòng này.',
    category: 'positive',
    status: 'published',
    createdAt: '2024-01-20',
    helpfulCount: 3,
    avatar: ''
  },
  {
    id: '2',
    tenantName: 'Trần Thị B',
    roomInfo: 'B201 - Phòng đôi',
    rating: 4,
    title: 'Phòng tốt, giá hợp lý',
    content: 'Phòng đẹp, giá thuê hợp lý so với chất lượng. Tuy nhiên cần cải thiện thêm về tiếng ồn từ đường phố.',
    category: 'positive',
    status: 'published',
    createdAt: '2024-01-18',
    helpfulCount: 1,
    avatar: ''
  },
  {
    id: '3',
    tenantName: 'Lê Văn C',
    roomInfo: 'A301 - Phòng đơn',
    rating: 2,
    title: 'Cần cải thiện nhiều',
    content: 'Phòng nhỏ, thiếu tiện nghi cơ bản. Hệ thống điện nước hay gặp sự cố. Chủ nhà ít quan tâm đến việc bảo trì.',
    category: 'negative',
    status: 'pending',
    createdAt: '2024-01-15',
    helpfulCount: 0,
    avatar: ''
  }
]

const RATING_LABELS = {
  5: 'Xuất sắc',
  4: 'Tốt',
  3: 'Trung bình',
  2: 'Kém',
  1: 'Rất kém'
}

const CATEGORY_COLORS = {
  positive: 'bg-green-100 text-green-800',
  negative: 'bg-red-100 text-red-800',
  neutral: 'bg-gray-100 text-gray-800'
}

const CATEGORY_LABELS = {
  positive: 'Tích cực',
  negative: 'Tiêu cực',
  neutral: 'Trung lập'
}

const STATUS_COLORS = {
  published: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  rejected: 'bg-red-100 text-red-800'
}

const STATUS_LABELS = {
  published: 'Đã đăng',
  pending: 'Chờ duyệt',
  rejected: 'Đã từ chối'
}

export default function ReviewsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [ratingFilter, setRatingFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredReviews = MOCK_REVIEWS.filter(review => {
    const matchesSearch = review.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.tenantName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRating = ratingFilter === 'all' || review.rating === parseInt(ratingFilter)
    const matchesCategory = categoryFilter === 'all' || review.category === categoryFilter
    const matchesStatus = statusFilter === 'all' || review.status === statusFilter
    
    return matchesSearch && matchesRating && matchesCategory && matchesStatus
  })

  const averageRating = MOCK_REVIEWS.reduce((sum, review) => sum + review.rating, 0) / MOCK_REVIEWS.length
  const totalReviews = MOCK_REVIEWS.length
  const positiveReviews = MOCK_REVIEWS.filter(review => review.category === 'positive').length

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  const handleStatusChange = (reviewId: string, newStatus: string) => {
    // TODO: Call API to update status
    console.log(`Updating review ${reviewId} to status: ${newStatus}`)
  }

  return (
    <DashboardLayout userType="landlord">
      <div className="px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Đánh giá khách hàng</h1>
          <p className="text-gray-600">Quản lý và phản hồi đánh giá từ khách thuê</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Điểm đánh giá trung bình</h3>
                  <p className="text-3xl font-bold text-yellow-600">
                    {averageRating.toFixed(1)}
                  </p>
                  <div className="flex items-center mt-2">
                    {renderStars(Math.round(averageRating))}
                  </div>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Star className="h-8 w-8 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Tổng số đánh giá</h3>
                  <p className="text-3xl font-bold text-blue-600">{totalReviews}</p>
                  <p className="text-sm text-gray-600 mt-2">Từ khách thuê</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <MessageSquare className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Đánh giá tích cực</h3>
                  <p className="text-3xl font-bold text-green-600">{positiveReviews}</p>
                  <p className="text-sm text-gray-600 mt-2">
                    {Math.round((positiveReviews / totalReviews) * 100)}% tổng số
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <ThumbsUp className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm đánh giá..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={ratingFilter} onValueChange={setRatingFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Điểm đánh giá" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả điểm</SelectItem>
              <SelectItem value="5">5 sao</SelectItem>
              <SelectItem value="4">4 sao</SelectItem>
              <SelectItem value="3">3 sao</SelectItem>
              <SelectItem value="2">2 sao</SelectItem>
              <SelectItem value="1">1 sao</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Loại đánh giá" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả loại</SelectItem>
              <SelectItem value="positive">Tích cực</SelectItem>
              <SelectItem value="negative">Tiêu cực</SelectItem>
              <SelectItem value="neutral">Trung lập</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="published">Đã đăng</SelectItem>
              <SelectItem value="pending">Chờ duyệt</SelectItem>
              <SelectItem value="rejected">Đã từ chối</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredReviews.map((review) => (
            <Card key={review.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Star className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{review.title}</CardTitle>
                      <div className="flex space-x-2 mt-1">
                        <Badge className={CATEGORY_COLORS[review.category as keyof typeof CATEGORY_COLORS]}>
                          {CATEGORY_LABELS[review.category as keyof typeof CATEGORY_COLORS]}
                        </Badge>
                        <Badge className={STATUS_COLORS[review.status as keyof typeof STATUS_COLORS]}>
                          {STATUS_LABELS[review.status as keyof typeof STATUS_COLORS]}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={review.avatar} alt={review.tenantName} />
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                        {review.tenantName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <span className="font-medium text-sm">{review.tenantName}</span>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <MapPin className="h-3 w-3" />
                        <span>{review.roomInfo}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="flex">
                      {renderStars(review.rating)}
                    </div>
                    <span className="text-sm text-gray-600 ml-2">
                      {RATING_LABELS[review.rating as keyof typeof RATING_LABELS]}
                    </span>
                  </div>
                  
                  <div className="text-sm">
                    <p className="text-gray-700 bg-gray-50 p-3 rounded text-sm leading-relaxed">
                      {review.content}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>{review.createdAt}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ThumbsUp className="h-4 w-4" />
                      <span>{review.helpfulCount} hữu ích</span>
                    </div>
                  </div>
                </div>
                
                {review.status === 'pending' && (
                  <div className="mt-4 flex space-x-2">
                    <Button 
                      size="sm" 
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handleStatusChange(review.id, 'published')}
                    >
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      Duyệt đăng
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
                      onClick={() => handleStatusChange(review.id, 'rejected')}
                    >
                      <ThumbsDown className="h-4 w-4 mr-1" />
                      Từ chối
                    </Button>
                  </div>
                )}
                
                {review.status === 'published' && (
                  <div className="mt-4">
                    <Button variant="outline" size="sm" className="w-full">
                      <Reply className="h-4 w-4 mr-1" />
                      Phản hồi
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredReviews.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">Không có đánh giá nào</div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
