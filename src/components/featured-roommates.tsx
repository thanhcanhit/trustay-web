"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Heart, Calendar, DollarSign, Users, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getRoommateSeekingListings, type RoommateSeekingListingItem } from "@/actions/roommate-seeking-posts.action"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty"

export function FeaturedRoommates() {
  const [savedPosts, setSavedPosts] = useState<string[]>([])
  const [listings, setListings] = useState<RoommateSeekingListingItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadListings = async () => {
      try {
        const result = await getRoommateSeekingListings({
          page: 1,
          limit: 8,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        })
        
        console.log('Featured roommate listings result:', result);
        
        if (result.success && result.data) {
          // Filter only active posts
          const activeListings = result.data.data.filter(listing => listing.status === 'active');
          console.log('Featured active listings:', activeListings.length, 'out of', result.data.data.length);
          setListings(activeListings)
        }
      } catch (error) {
        console.error('Error loading roommate listings:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadListings()
  }, [])

  const toggleSave = (postId: string) => {
    setSavedPosts(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    )
  }

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency || 'VND'
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500 text-white">Đang hoạt động</Badge>
      case 'paused':
        return <Badge variant="secondary">Tạm dừng</Badge>
      case 'closed':
        return <Badge variant="outline">Đã đóng</Badge>
      case 'expired':
        return <Badge variant="destructive">Hết hạn</Badge>
      default:
        return null
    }
  }

  if (loading) {
    return (
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-gray-600">Đang tải...</p>
          </div>
        </div>
      </section>
    )
  }

  if (listings.length === 0) {
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
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Users />
              </EmptyMedia>
              <EmptyTitle>Chưa có bài đăng tìm bạn cùng phòng</EmptyTitle>
              <EmptyDescription>
                Hiện tại chưa có bài đăng tìm bạn cùng phòng nào. Hãy quay lại sau để xem các bài đăng mới nhất.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Link href="/roommate">
                <Button variant="outline">
                  Xem tất cả bài đăng
                </Button>
              </Link>
            </EmptyContent>
          </Empty>
        </div>
      </section>
    )
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
          {listings.slice(0, 8).map((listing) => {
            const isSaved = savedPosts.includes(listing.id)

            return (
              <Link 
                key={listing.id} 
                href={`/roommate/${listing.id}`}
                className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow block"
              >
                {/* Content */}
                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={listing.requester.avatarUrl || undefined} alt={listing.requester.name} />
                        <AvatarFallback className="text-xs">{getInitials(listing.requester.name)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-700 truncate">{listing.requester.name}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {getStatusBadge(listing.status)}
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          toggleSave(listing.id)
                        }}
                        className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <Heart 
                          className={`h-4 w-4 ${isSaved ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
                        />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {listing.title}
                  </h3>

                  {/* Description */}
                  {listing.description && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{listing.description}</p>
                  )}

                  {/* Max Budget */}
                  <div className="flex items-center mb-2">
                    <DollarSign className="h-4 w-4 mr-2 text-green-500" />
                    <span className="text-sm font-medium text-green-600">
                      {formatPrice(listing.maxBudget, listing.currency)}/tháng
                    </span>
                  </div>

                  {/* Occupancy */}
                  <div className="flex items-center mb-2">
                    <Users className="h-4 w-4 mr-2 text-blue-500" />
                    <span className="text-sm text-gray-600">Tìm {listing.occupancy} người</span>
                  </div>

                  {/* Move-in Date */}
                  <div className="flex items-center mb-2">
                    <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                    <span className="text-sm text-gray-600">
                      Từ: {formatDate(listing.moveInDate)}
                    </span>
                  </div>

                  {/* View & Contact Count */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {listing.viewCount || 0}
                    </div>
                    {listing.contactCount > 0 && (
                      <span>{listing.contactCount} lượt liên hệ</span>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* View More Button */}
        <div className="text-center mt-8">
          <Link href="/roommate">
            <Button variant="outline" size="lg">
              Xem thêm bài đăng
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
