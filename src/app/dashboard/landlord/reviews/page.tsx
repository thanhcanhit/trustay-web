"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Star, MessageSquare, Calendar, MapPin, ThumbsUp, Reply, Loader2 } from "lucide-react"
import { useRatingStore } from "@/stores/ratingStore"
import { useUserStore } from "@/stores/userStore"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"

const RATING_LABELS = {
  5: 'Xuất sắc',
  4: 'Tốt',
  3: 'Trung bình',
  2: 'Kém',
  1: 'Rất kém'
}

export default function ReviewsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [ratingFilter, setRatingFilter] = useState('all')
  const { user } = useUserStore()
  const { ratings, statistics, isLoading, getRatings } = useRatingStore()

  // Fetch landlord's ratings
  useEffect(() => {
    if (user?.id) {
      getRatings({ targetType: 'landlord', targetId: user.id, page: 1, limit: 100 })
    }
  }, [user?.id, getRatings])

  const filteredReviews = ratings.filter(rating => {
    const reviewerName = rating.reviewer ? `${rating.reviewer.firstName} ${rating.reviewer.lastName}` : ''
    const matchesSearch = (rating.content || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reviewerName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRating = ratingFilter === 'all' || rating.rating === parseInt(ratingFilter)
    
    return matchesSearch && matchesRating
  })

  const averageRating = statistics?.averageRating || 0
  const totalReviews = statistics?.totalRatings || 0
  const positiveReviews = ratings.filter(rating => rating.rating >= 4).length

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

  if (isLoading) {
    return (
      <DashboardLayout userType="landlord">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Đang tải đánh giá...</p>
          </div>
        </div>
      </DashboardLayout>
    )
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
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredReviews.map((rating) => {
            const reviewerName = rating.reviewer 
              ? `${rating.reviewer.firstName} ${rating.reviewer.lastName}`
              : 'Người dùng ẩn danh'
            const roomInfo = rating.rentalId ? `Phòng thuê #${rating.rentalId.slice(0, 8)}` : 'N/A'
            
            return (
              <Card key={rating.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <Star className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {rating.rating >= 4 ? 'Đánh giá tích cực' : rating.rating >= 3 ? 'Đánh giá trung bình' : 'Cần cải thiện'}
                        </CardTitle>
                        <div className="flex space-x-2 mt-1">
                          <Badge className={rating.rating >= 4 ? 'bg-green-100 text-green-800' : rating.rating >= 3 ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800'}>
                            {rating.rating >= 4 ? 'Tích cực' : rating.rating >= 3 ? 'Trung lập' : 'Tiêu cực'}
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
                        <AvatarImage src="" alt={reviewerName} />
                        <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                          {reviewerName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <span className="font-medium text-sm">{reviewerName}</span>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <MapPin className="h-3 w-3" />
                          <span>{roomInfo}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="flex">
                        {renderStars(rating.rating)}
                      </div>
                      <span className="text-sm text-gray-600 ml-2">
                        {RATING_LABELS[rating.rating as keyof typeof RATING_LABELS]}
                      </span>
                    </div>
                    
                    {rating.content && (
                      <div className="text-sm">
                        <p className="text-gray-700 bg-gray-50 p-3 rounded text-sm leading-relaxed">
                          {rating.content}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(rating.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Button variant="outline" size="sm" className="w-full">
                      <Reply className="h-4 w-4 mr-1" />
                      Phản hồi
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredReviews.length === 0 && (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Star />
              </EmptyMedia>
              <EmptyTitle>Chưa có đánh giá</EmptyTitle>
              <EmptyDescription>
                Bạn chưa nhận được đánh giá nào từ khách thuê. Đánh giá sẽ xuất hiện sau khi khách thuê hoàn tất thuê trọ và để lại đánh giá.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>
    </DashboardLayout>
  )
}
