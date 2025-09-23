'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState, useMemo, useEffect } from 'react'
import { ProfileLayout } from '@/components/profile/profile-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog, AlertDialogTitle, AlertDialogHeader, AlertDialogDescription, AlertDialogCancel, AlertDialogAction, AlertDialogContent, AlertDialogFooter, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Eye, MapPin, Pencil, Plus, Trash2, DollarSign, Home, Search } from 'lucide-react'
import { RoomSeekingPost } from '@/types'
import { deleteRoomSeekingPost } from '@/actions/room-seeking.action'
import { getRoomTypeDisplayName } from '@/utils/room-types'
import { toast } from 'sonner'
import { useRoomSeekingStore } from '@/stores/roomSeekingStore'

export default function ProfileRoomSeekingPostsPage() {
  const router = useRouter()
  const { userPosts, userPostsLoading, fetchMyPosts } = useRoomSeekingStore()

  const [localPosts, setLocalPosts] = useState<RoomSeekingPost[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRoomType, setFilterRoomType] = useState<string>('all')
  const [filterProvince, setFilterProvince] = useState<string>('all')

  useEffect(() => {
    fetchMyPosts({ limit: 50 })
  }, [fetchMyPosts])

  useEffect(() => {
    setLocalPosts(userPosts)
  }, [userPosts])

  // Filter and search logic
  const filteredPosts = useMemo(() => {
    return localPosts.filter(post => {
      const matchesSearch = searchTerm === '' ||
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.preferredProvince?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.preferredDistrict?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.preferredWard?.name?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesRoomType = filterRoomType === 'all' ||
        post.preferredRoomType === filterRoomType

      const matchesProvince = filterProvince === 'all' ||
        post.preferredProvince?.name === filterProvince

      return matchesSearch && matchesRoomType && matchesProvince
    })
  }, [localPosts, searchTerm, filterRoomType, filterProvince])

  const handleDeleteRoomSeekingPost = async (postId: string) => {
    try {
      const response = await deleteRoomSeekingPost(postId)
      if (!response.success) {
        toast.error(response.error)
        return
      }

      setLocalPosts(prevPosts => prevPosts.filter(post => post.id !== postId))
      toast.success('Xóa bài đăng thành công')
      router.refresh();
    } catch (error) {
      console.error('Error deleting post:', error)
      toast.error('Không thể xóa bài đăng. Vui lòng kiểm tra lại.')
    }
  }

  const handleSearch = () => {
    // Trigger re-render by updating search term
    setSearchTerm(searchTerm.trim())
  }

  // Get unique room types and provinces for filter options
  const roomTypes = useMemo(() => {
    const types = new Set(localPosts.map(post => post.preferredRoomType))
    return Array.from(types)
  }, [localPosts])

  const provinces = useMemo(() => {
    const provinceSet = new Set(localPosts.map(post => post.preferredProvince?.name).filter(Boolean))
    return Array.from(provinceSet)
  }, [localPosts])

  if (userPostsLoading) {
    return (
      <ProfileLayout>
        <div className="px-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Đang tải danh sách bài đăng...</p>
            </div>
          </div>
        </div>
      </ProfileLayout>
    )
  }

  if (localPosts.length === 0) {
    return (
      <ProfileLayout>
        <div className="px-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Bài đăng tìm trọ</h1>
                <p className="text-gray-600">Quản lý tất cả các bài đăng tìm trọ của bạn</p>
              </div>
              <Link href="/profile/posts/room-seeking/add">
                <Button className="bg-blue-500 hover:bg-blue-600 cursor-pointer">
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo bài đăng mới
                </Button>
              </Link>
            </div>

            <Card>
              <CardContent className="py-12 flex flex-col items-center gap-3">
                <div className="text-muted-foreground">Chưa có bài đăng tìm trọ</div>
                <Link href="/profile/posts/room-seeking/add">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" /> Tạo bài đăng tìm trọ
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </ProfileLayout>
    )
  }

  return (
    <ProfileLayout>
      <div className="px-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Bài đăng tìm trọ</h1>
              <p className="text-gray-600">Quản lý tất cả các bài đăng tìm trọ của bạn</p>
            </div>
            <Link href="/profile/posts/room-seeking/add">
              <Button className="bg-blue-500 hover:bg-blue-600 cursor-pointer">
                <Plus className="h-4 w-4 mr-2" />
                Tạo bài đăng mới
              </Button>
            </Link>
          </div>

          {/* Search and Filter */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Tìm kiếm theo tiêu đề, mô tả, địa điểm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Select value={filterRoomType} onValueChange={setFilterRoomType}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Loại phòng" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả loại phòng</SelectItem>
                    {roomTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {getRoomTypeDisplayName(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterProvince} onValueChange={setFilterProvince}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Tỉnh/Thành phố" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả tỉnh/thành</SelectItem>
                    {provinces.map(province => (
                      <SelectItem key={province} value={province as string}>
                        {province}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleSearch} variant="outline" className="cursor-pointer">
                  <Search className="h-4 w-4 mr-2" />
                  Tìm kiếm
                </Button>
              </div>
            </div>
          </div>

          {/* Results count */}
          <div className="text-sm text-gray-600">
            Hiển thị {filteredPosts.length} / {localPosts.length} bài đăng
          </div>

          {/* Posts Grid */}
          {filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">
                {searchTerm || filterRoomType !== 'all' || filterProvince !== 'all'
                  ? 'Không tìm thấy bài đăng nào phù hợp với bộ lọc'
                  : 'Chưa có bài đăng tìm trọ'}
              </div>
              <Link href="/profile/posts/room-seeking/add">
                <Button className="cursor-pointer">Tạo bài đăng đầu tiên</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <Card
                  key={post.id}
                  className="rounded-lg border bg-white shadow-sm hover:shadow-lg transition-shadow overflow-hidden"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between line-clamp-1">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <Home className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-lg font-semibold leading-snug">{post.title}</CardTitle>
                          <div className="mt-1">
                            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                              {getRoomTypeDisplayName(post.preferredRoomType)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-sm">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">
                          {post.preferredWard?.name ? `${post.preferredWard.name}, ` : ''}
                          {post.preferredDistrict?.name ? `${post.preferredDistrict.name}, ` : ''}
                          {post.preferredProvince?.name || 'Khu vực linh hoạt'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-gray-600">Ngân sách</p>
                            <p className="font-medium text-green-600">
                              {post.minBudget.toLocaleString('vi-VN')} - {post.maxBudget.toLocaleString('vi-VN')}đ
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Eye className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-gray-600">Lượt xem</p>
                            <p className="font-medium">{post.contactCount}</p>
                          </div>
                        </div>
                      </div>

                      {post.description && (
                        <div className="text-sm text-gray-600 line-clamp-2">
                          {post.description}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>Ngày tạo: {new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>

                    <div className="mt-4 flex space-x-2">
                      <Link href={`/profile/posts/room-seeking/${post.id}/edit`} className="flex-1">
                        <Button size="sm" className="w-full cursor-pointer">
                          <Pencil className="h-4 w-4 mr-1" />
                          Sửa
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50 cursor-pointer">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader className="line-clamp-4">
                            <AlertDialogTitle >Bạn có chắc chắn muốn xóa bài đăng &quot;{post.title}&quot;?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Hành động này không thể hoàn tác. Bài đăng sẽ bị xóa vĩnh viễn.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter >
                            <AlertDialogCancel className="cursor-pointer">
                              Hủy
                            </AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-500 hover:bg-red-600 text-white cursor-pointer"
                              onClick={() => handleDeleteRoomSeekingPost(post.id)}
                            >
                              Xoá
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProfileLayout>
  )
}