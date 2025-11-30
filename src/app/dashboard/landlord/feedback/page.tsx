"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, AlertTriangle, Clock, MapPin, Phone, Mail, CheckCircle, Loader2 } from "lucide-react"
import { RoomIssueCategory, RoomIssueStatus } from "@/types/types"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useRoomIssueStore } from "@/stores/roomIssueStore"
import { SizingImage } from "@/components/sizing-image"

const CATEGORY_LABELS: Record<RoomIssueCategory, string> = {
  facility: 'Cơ sở vật chất',
  utility: 'Tiện ích',
  neighbor: 'Hàng xóm',
  noise: 'Tiếng ồn',
  security: 'An ninh',
  other: 'Khác'
}

const CATEGORY_COLORS: Record<RoomIssueCategory, string> = {
  facility: 'bg-orange-100 text-orange-800',
  utility: 'bg-blue-100 text-blue-800',
  neighbor: 'bg-purple-100 text-purple-800',
  noise: 'bg-yellow-100 text-yellow-800',
  security: 'bg-red-100 text-red-800',
  other: 'bg-gray-100 text-gray-800'
}

const STATUS_COLORS: Record<RoomIssueStatus, string> = {
  new: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800'
}

const STATUS_LABELS: Record<RoomIssueStatus, string> = {
  new: 'Mới',
  in_progress: 'Đang xử lý',
  resolved: 'Đã giải quyết'
}

export default function FeedbackPage() {
  const {
    issues,
    loading,
    updating,
    error,
    meta,
    loadLandlordIssues,
    updateStatus,
  } = useRoomIssueStore()

  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<RoomIssueCategory | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<RoomIssueStatus | 'all'>('all')
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [imageDialogOpen, setImageDialogOpen] = useState(false)

  useEffect(() => {
    loadLandlordIssues({
      page: 1,
      limit: 20,
      category: categoryFilter !== 'all' ? categoryFilter : undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined
    })
  }, [categoryFilter, statusFilter, loadLandlordIssues])

  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  const handleStatusChange = async (issueId: string, newStatus: RoomIssueStatus) => {
    const success = await updateStatus(issueId, newStatus)
    
    if (success) {
      toast.success('Cập nhật trạng thái thành công')
    } else {
      toast.error('Không thể cập nhật trạng thái')
    }
  }

  const handlePageChange = (page: number) => {
    loadLandlordIssues({
      page,
      limit: 20,
      category: categoryFilter !== 'all' ? categoryFilter : undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined
    })
  }

  const showImages = (imageUrls: string[]) => {
    setSelectedImages(imageUrls)
    setImageDialogOpen(true)
  }

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

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         `${issue.reporter.firstName} ${issue.reporter.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.roomInstance.room.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

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
              placeholder="Tìm kiếm sự cố..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as RoomIssueCategory | 'all')}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Danh mục" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả danh mục</SelectItem>
              <SelectItem value="facility">Cơ sở vật chất</SelectItem>
              <SelectItem value="utility">Tiện ích</SelectItem>
              <SelectItem value="neighbor">Hàng xóm</SelectItem>
              <SelectItem value="noise">Tiếng ồn</SelectItem>
              <SelectItem value="security">An ninh</SelectItem>
              <SelectItem value="other">Khác</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as RoomIssueStatus | 'all')}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="new">Mới</SelectItem>
              <SelectItem value="in_progress">Đang xử lý</SelectItem>
              <SelectItem value="resolved">Đã giải quyết</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        )}

        {/* Issues Grid */}
        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredIssues.map((issue) => (
              <Card key={issue.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{issue.title}</CardTitle>
                        <div className="flex space-x-2 mt-1">
                          <Badge className={CATEGORY_COLORS[issue.category]}>
                            {CATEGORY_LABELS[issue.category]}
                          </Badge>
                          <Badge className={STATUS_COLORS[issue.status]}>
                            {STATUS_LABELS[issue.status]}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <TenantAvatar 
                        name={`${issue.reporter.firstName || ''} ${issue.reporter.lastName || ''}`.trim()} 
                        src="" 
                      />
                      <div>
                        <span className="font-medium text-sm">
                          {issue.reporter.firstName} {issue.reporter.lastName}
                        </span>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <MapPin className="h-3 w-3" />
                          <span>{issue.roomInstance.room.name} - {issue.roomInstance.roomNumber}</span>
                        </div>
                      </div>
                    </div>
                    
                    {issue.imageUrls && issue.imageUrls.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-600 font-medium mb-2">Hình ảnh:</p>
                        <div className="flex gap-2 flex-wrap">
                          {issue.imageUrls.slice(0, 3).map((url, idx) => (
                            <div 
                              key={idx}
                              className="relative w-20 h-20 rounded-lg overflow-hidden cursor-pointer border border-gray-200 hover:border-gray-400 transition-colors"
                              onClick={() => showImages(issue.imageUrls)}
                            >
                              <SizingImage 
                                src={url} 
                                alt={`Issue ${idx + 1}`}
                                fill
                                srcSize="256x256"
                                className="object-cover"
                              />
                            </div>
                          ))}
                          {issue.imageUrls.length > 3 && (
                            <button
                              onClick={() => showImages(issue.imageUrls)}
                              className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-sm text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors"
                            >
                              +{issue.imageUrls.length - 3}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {issue.reporter.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">{issue.reporter.phone}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600 truncate">{issue.reporter.email}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>
                        {new Date(issue.createdAt).toLocaleString('vi-VN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                  
                  {issue.status === 'new' && (
                    <div className="mt-4 flex space-x-2">
                      <Button 
                        size="sm" 
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                        onClick={() => handleStatusChange(issue.id, 'in_progress')}
                        disabled={updating}
                      >
                        {updating ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Bắt đầu xử lý'
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleStatusChange(issue.id, 'resolved')}
                        disabled={updating}
                      >
                        Đánh dấu đã giải quyết
                      </Button>
                    </div>
                  )}
                  
                  {issue.status === 'in_progress' && (
                    <div className="mt-4">
                      <Button 
                        size="sm" 
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={() => handleStatusChange(issue.id, 'resolved')}
                        disabled={updating}
                      >
                        {updating ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Đánh dấu đã giải quyết
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && filteredIssues.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">Không có sự cố nào</div>
          </div>
        )}

        {/* Pagination */}
        {!loading && meta && meta.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(Math.max(1, meta.page - 1))}
              disabled={meta.page === 1}
            >
              Trước
            </Button>
            <span className="text-sm text-gray-600">
              Trang {meta.page} / {meta.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(Math.min(meta.totalPages, meta.page + 1))}
              disabled={meta.page === meta.totalPages}
            >
              Sau
            </Button>
          </div>
        )}

        {/* Image Dialog */}
        <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Hình ảnh sự cố</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto">
              {selectedImages.map((url, idx) => (
                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                  <SizingImage 
                    src={url} 
                    alt={`Issue ${idx + 1}`}
                    fill
                    srcSize="512x512"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
