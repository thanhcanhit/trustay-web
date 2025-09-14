"use client"

import { useState } from "react"
import Image from "next/image"
import { Heart, MapPin, User, Calendar, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getHotRoommatePosts } from "@/data/mock-data"
import { getOptimizedImageUrl } from "@/lib/utils"

export function FeaturedRoommates() {
  const [savedPosts, setSavedPosts] = useState<string[]>([])
  const hotRoommatePosts = getHotRoommatePosts()

  const toggleSave = (postId: string) => {
    setSavedPosts(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price / 1000000)
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

  const handlePostClick = (postId: string) => {
    // Navigate to roommate post detail page
    window.location.href = `/room-seekings/${postId}`
  }

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            TÌM BẠN CÙNG PHÒNG NỔI BẬT
          </h2>
          <p className="text-gray-600">
            Những bài đăng tìm bạn cùng phòng được quan tâm nhiều nhất
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {hotRoommatePosts.map((post) => {
            const isSaved = savedPosts.includes(post.id)

            return (
              <div 
                key={post.id} 
                className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handlePostClick(post.id)}
              >
                {/* Image Container */}
                <div className="relative h-48">
                  <Image
                    src={post.images?.[0] && typeof post.images[0] === 'string' && post.images[0].trim() !== "" ? 
                      getOptimizedImageUrl(post.images[0], 'listing') : "/images/error-image.jpg"}
                    alt={post.title || "Roommate post image"}
                    fill
                    className="object-cover"
                  />
                  
                  {/* HOT Badge */}
                  <div className="absolute top-2 left-2">
                    <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">
                      HOT
                    </span>
                  </div>

                  {/* Save Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleSave(post.id)
                    }}
                    className="absolute top-2 right-2 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
                  >
                    <Heart 
                      className={`h-4 w-4 ${isSaved ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
                    />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {post.title}
                  </h3>

                  {/* Author */}
                  <div className="flex items-center mb-2">
                    <User className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-sm text-gray-600">{post.authorName}</span>
                  </div>

                  {/* Budget */}
                  <div className="flex items-center mb-2">
                    <DollarSign className="h-4 w-4 mr-2 text-green-500" />
                    <span className="text-sm font-medium text-green-600">
                      {formatPrice(post.budget)} VNĐ/tháng
                    </span>
                  </div>

                  {/* Gender Preference */}
                  <div className="text-sm text-gray-600 mb-2">
                    Tìm: {getGenderText(post.preferredGender)}
                  </div>

                  {/* Move-in Date */}
                  <div className="flex items-center mb-2">
                    <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                    <span className="text-sm text-gray-600">
                      Dọn vào: {formatDate(post.moveInDate)}
                    </span>
                  </div>

                  {/* Location */}
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{post.district}, {post.city}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* View More Button */}
        <div className="text-center mt-8">
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => window.location.href = '/room-seekings'}
          >
            Xem thêm bài đăng
          </Button>
        </div>
      </div>
    </section>
  )
}
