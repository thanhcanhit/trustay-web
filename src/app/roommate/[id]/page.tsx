"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, Heart, Share2, MapPin, User, Calendar, DollarSign, Phone, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { mockRoommatePosts } from "@/data/mock-data"

export default function RoommateDetailPage() {
  const params = useParams()
  const postId = params.id as string
  const [isSaved, setIsSaved] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const post = mockRoommatePosts.find(p => p.id === postId)
  
  if (!post) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy bài đăng</h1>
          <Button onClick={() => window.history.back()}>
            Quay lại
          </Button>
        </div>
      </div>
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  const getGenderText = (gender: string) => {
    switch (gender) {
      case 'male': return 'Nam'
      case 'female': return 'Nữ'
      case 'any': return 'Không yêu cầu'
      default: return 'Không yêu cầu'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => window.history.back()}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsSaved(!isSaved)}
              >
                <Heart className={`h-4 w-4 mr-2 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
                {isSaved ? 'Đã lưu' : 'Lưu'}
              </Button>
              <Button variant="ghost" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Chia sẻ
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            {post.images.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
                <div className="relative h-96">
                  <Image
                    src={post.images[currentImageIndex] || "/placeholder-roommate.jpg"}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                  {post.isHot && (
                    <div className="absolute top-4 left-4">
                      <span className="bg-orange-500 text-white text-sm font-bold px-3 py-1 rounded">
                        HOT
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Image Thumbnails */}
                {post.images.length > 1 && (
                  <div className="flex gap-2 p-4 overflow-x-auto">
                    {post.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                          currentImageIndex === index ? 'border-blue-500' : 'border-gray-200'
                        }`}
                      >
                        <Image
                          src={image}
                          alt={`${post.title} ${index + 1}`}
                          width={80}
                          height={80}
                          className="object-cover w-full h-full"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Post Info */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {post.title}
              </h1>

              <div className="flex items-center mb-4">
                <User className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-gray-700">Đăng bởi: {post.authorName}</span>
              </div>

              <div className="flex items-center mb-4">
                <MapPin className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-gray-700">
                  {post.location}, {post.district}, {post.city}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-gray-700">
                    Ngân sách: <span className="font-medium text-green-600">{formatPrice(post.budget)} VNĐ/tháng</span>
                  </span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-gray-700">
                    Dọn vào: <span className="font-medium">{formatDate(post.moveInDate)}</span>
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <span className="text-gray-700">
                  Tìm bạn: <span className="font-medium">{getGenderText(post.preferredGender)}</span>
                </span>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Mô tả chi tiết</h3>
                <p className="text-gray-700 whitespace-pre-line">{post.description}</p>
              </div>

              {/* Requirements */}
              {post.requirements.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Yêu cầu</h3>
                  <div className="flex flex-wrap gap-2">
                    {post.requirements.map((requirement, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                      >
                        {requirement}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-sm text-gray-500">
                Đăng ngày: {formatDate(post.createdAt)}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                  {post.authorAvatar ? (
                    <Image
                      src={post.authorAvatar}
                      alt={post.authorName}
                      width={64}
                      height={64}
                      className="rounded-full"
                    />
                  ) : (
                    <User className="h-8 w-8 text-gray-500" />
                  )}
                </div>
                <h3 className="font-semibold text-gray-900">{post.authorName}</h3>
                <p className="text-sm text-gray-600">Người đăng</p>
              </div>

              <div className="space-y-3 mb-6">
                <Button variant="outline" className="w-full" size="lg">
                  <Phone className="h-4 w-4 mr-2" />
                  Liên hệ qua Zalo
                </Button>
                
                {post.contactInfo.email && (
                  <Button variant="outline" className="w-full" size="lg">
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                )}
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-3">Thông tin liên hệ</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  {post.contactInfo.phone && (
                    <div>Điện thoại: {post.contactInfo.phone}</div>
                  )}
                  {post.contactInfo.email && (
                    <div>Email: {post.contactInfo.email}</div>
                  )}
                  {post.contactInfo.facebook && (
                    <div>Facebook: {post.contactInfo.facebook}</div>
                  )}
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <h4 className="font-semibold text-gray-900 mb-3">Thông tin bài đăng</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>Ngân sách: {formatPrice(post.budget)} VNĐ/tháng</div>
                  <div>Dọn vào: {formatDate(post.moveInDate)}</div>
                  <div>Tìm: {getGenderText(post.preferredGender)}</div>
                  <div>Khu vực: {post.district}, {post.city}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
