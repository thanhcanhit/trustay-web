"use client"

import { ProfileLayout } from "@/components/profile/profile-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Plus, Search, Filter, MapPin, Calendar, DollarSign, Eye } from "lucide-react"
import { mockRoommatePosts } from "@/data/mock-data"
import Link from "next/link"
import { stripHtmlTags } from "@/utils/textProcessing"
//import { useUserStore } from "@/stores/userStore"

export default function ProfileRoommatePage() {
  //const { user } = useUserStore()

  return (
    <ProfileLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý bài đăng tìm bạn cùng phòng</h1>
            <p className="text-gray-600">Quản lý các bài đăng tìm người ở cùng</p>
          </div>
          <Link href="/profile/roommate/add">
            <Button className="bg-blue-500 hover:bg-blue-600">
              <Plus className="h-4 w-4 mr-2" />
              Đăng tìm bạn cùng phòng
            </Button>
          </Link>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Tìm kiếm bài đăng..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Lọc
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tổng bài đăng</p>
                  <p className="text-2xl font-bold text-gray-900">{mockRoommatePosts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Eye className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Đang hoạt động</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {mockRoommatePosts.filter(p => p.status === 'active').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Hết hạn</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {mockRoommatePosts.filter(p => p.status === 'expired').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Đã tìm được</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {mockRoommatePosts.filter(p => p.status === 'found').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          {mockRoommatePosts.map((post) => (
            <Card key={post.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{post.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded ${
                        post.status === 'active' ? 'bg-green-100 text-green-800' :
                        post.status === 'expired' ? 'bg-yellow-100 text-yellow-800' :
                        post.status === 'found' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {post.status === 'active' ? 'Đang tìm' :
                         post.status === 'expired' ? 'Hết hạn' :
                         post.status === 'found' ? 'Đã tìm được' : 'Tạm dừng'}
                      </span>
                      {post.isHot && (
                        <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-800">
                          HOT
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {post.location}, {post.district}, {post.city}
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        {(post.budget / 1000000).toFixed(1)}M VNĐ
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(post.moveInDate).toLocaleDateString('vi-VN')}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {post.preferredGender === 'male' ? 'Nam' : 
                         post.preferredGender === 'female' ? 'Nữ' : 'Cả hai'}
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                      {stripHtmlTags(post.description)}
                    </p>

                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>{post.views} lượt xem</span>
                      <span>•</span>
                      <span>{post.responses} phản hồi</span>
                      <span>•</span>
                      <span>Đăng {new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    <Button size="sm" variant="outline">
                      Chỉnh sửa
                    </Button>
                    <Button size="sm" variant="outline">
                      Xem chi tiết
                    </Button>
                    <Button size="sm" variant="destructive">
                      Xóa
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {mockRoommatePosts.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có bài đăng nào</h3>
            <p className="text-gray-600 mb-4">Tạo bài đăng đầu tiên để tìm bạn cùng phòng</p>
            <Link href="/profile/roommate/add">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Đăng tìm bạn cùng phòng
              </Button>
            </Link>
          </div>
        )}
      </div>
    </ProfileLayout>
  )
}