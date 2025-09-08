'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
//import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogTitle, AlertDialogHeader, AlertDialogDescription, AlertDialogCancel, AlertDialogAction, AlertDialogContent, AlertDialogFooter, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Eye, MapPin, Pencil, Plus, Trash2, DollarSign, Home } from 'lucide-react'
import { RoomSeekingPost } from '@/types'
import { deleteRoomSeekingPost } from '@/actions/room-seeking.action'

interface RoomSeekingManagerProps {
  posts: RoomSeekingPost[]
}

export function RoomSeekingManager({ posts }: RoomSeekingManagerProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete() {
    if (!deletingId) return
    const res = await deleteRoomSeekingPost(deletingId)
    setDeletingId(null)
    if (res.success) router.refresh()
    else alert(res.error)
  }

  if (posts.length === 0) {
    return (
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
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <Card
          key={post.id}
          className="rounded-lg border bg-white shadow-sm hover:shadow-lg transition-shadow overflow-hidden"
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3 flex-1">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Home className="h-6 w-6 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-lg font-semibold leading-snug line-clamp-1">{post.title}</CardTitle>
                  <div className="mt-1">
                    <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                      {post.preferredRoomType}
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
                <span className="text-gray-600">Quận {post.preferredDistrictId}</span>
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
                  <AlertDialogHeader>
                    <AlertDialogTitle>Bạn có chắc chắn muốn xóa bài đăng &quot;{post.title}&quot;?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Hành động này không thể hoàn tác. Bài đăng sẽ bị xóa vĩnh viễn.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="cursor-pointer">Hủy</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-500 hover:bg-red-600 text-white cursor-pointer"
                      onClick={() => {
                        setDeletingId(post.id)
                        handleDelete()
                      }}
                    >
                      Xóa
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}



