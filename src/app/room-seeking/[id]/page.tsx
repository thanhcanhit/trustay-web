"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Loader2, Calendar, MapPin, Users, DollarSign, Info, ChevronDown, ChevronUp, PhoneCall, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { SizingImage } from '@/components/sizing-image'
import { Badge } from '@/components/ui/badge'
import { useRoomSeekingStore } from '@/stores/roomSeekingStore'
import { ROOM_TYPE_LABELS, STATUS_LABELS } from '@/types/room-seeking'

export default function RoomSeekingDetailPage() {
  const params = useParams()
  const id = String(params?.id)
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)

  const { currentPost, postLoading, postError, loadPostDetail, clearCurrentPost } = useRoomSeekingStore()

  useEffect(() => {
    if (id) void loadPostDetail(id)
    return () => clearCurrentPost()
  }, [id, loadPostDetail, clearCurrentPost])

  const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN').format(value)
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('vi-VN')
  const formatAddress = () => {
    const ward = (currentPost as unknown as { preferredWard?: { name?: string } }).preferredWard?.name
    const district = (currentPost as unknown as { preferredDistrict?: { name?: string } }).preferredDistrict?.name
    const province = (currentPost as unknown as { preferredProvince?: { name?: string } }).preferredProvince?.name
    return [ward, district, province].filter(Boolean).join(', ')
  }

  if (postLoading) {
    return (
      <div className="container mx-auto px-4 py-8 pt-20 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-green-600" />
        <p className="text-gray-600 mt-2">Đang tải bài đăng...</p>
      </div>
    )
  }

  if (postError || !currentPost) {
    return (
      <div className="container mx-auto px-4 py-8 pt-20 text-center">
        <p className="text-red-600">{postError || 'Không tìm thấy bài đăng'}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-3 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="mb-4">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h1 className="text-2xl font-bold text-gray-900 mb-1.5 break-words">{currentPost.title}</h1>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                      <span className="inline-flex items-center gap-1"><Calendar className="h-4 w-4" />{formatDate(currentPost.createdAt)}</span>
                      <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" />{formatAddress()}</span>
                      <span className="inline-flex items-center gap-1"><DollarSign className="h-4 w-4" />{formatCurrency(Number(currentPost.minBudget))} - {formatCurrency(Number(currentPost.maxBudget))} ₫</span>
                    </div>
                  </div>
                  <Badge>{STATUS_LABELS[currentPost.status]}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Thông tin chi tiết</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-gray-600">Loại phòng mong muốn</p>
                    <p className="font-medium text-gray-900">{ROOM_TYPE_LABELS[currentPost.preferredRoomType]}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Số người ở</p>
                      <p className="font-medium text-gray-900">{currentPost.occupancy} người</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ngày dự định vào ở</p>
                    <p className="font-medium text-gray-900">{formatDate(currentPost.moveInDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Lượt liên hệ</p>
                    <p className="font-medium text-gray-900">{currentPost.contactCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Mô tả</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className={`text-gray-700 whitespace-pre-line ${!isDescriptionExpanded ? 'line-clamp-3' : ''}`}>{currentPost.description}</div>
                {currentPost.description?.length > 150 && (
                  <button
                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                    className="mt-1.5 text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium"
                  >
                    {isDescriptionExpanded ? (
                      <>Thu gọn <ChevronUp className="h-4 w-4 ml-1" /></>
                    ) : (
                      <>Xem thêm <ChevronDown className="h-4 w-4 ml-1" /></>
                    )}
                  </button>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            {/* Poster info - moved above budget */}
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Thông tin người đăng</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {(() => {
                  interface Requester { firstName?: string; lastName?: string; phone?: string; avatarUrl?: string | null; isVerifiedIdentity?: boolean }
                  const owner = (currentPost as unknown as { requester?: Requester }).requester ?? ({} as Requester)

                  const initials = `${(owner.firstName?.charAt(0) || 'U').toUpperCase()}${(owner.lastName?.charAt(0) || 'S').toUpperCase()}`

                  const handleContactOwner = () => {
                    if (!owner.phone) return
                    const phoneNumber = owner.phone.replace(/\D/g, '')
                    const zaloUrl = `https://zalo.me/${phoneNumber}`
                    window.open(zaloUrl, '_blank')
                  }

                  return (
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="h-12 w-12">
                          {owner.avatarUrl && owner.avatarUrl.trim() !== '' ? (
                            <div className="w-full h-full relative">
                              <SizingImage src={owner.avatarUrl} srcSize="128x128" alt={`${owner.firstName || 'User'} ${owner.lastName || ''}`} className="object-cover rounded-full" fill />
                            </div>
                          ) : (
                            <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">{initials}</AvatarFallback>
                          )}
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900 text-sm truncate">{owner.firstName || 'Người'} {owner.lastName || 'dùng'}</h3>
                            {owner.isVerifiedIdentity && (
                              <span className="inline-flex items-center gap-1 text-xs text-emerald-600"><CheckCircle className="h-3 w-3" /> Đã xác minh</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>Đang hoạt động</span>
                          </div>
                        </div>
                      </div>

                      <Button className="w-full" onClick={handleContactOwner} disabled={!owner.phone}>
                        <PhoneCall className="h-4 w-4 mr-2" />
                        Liên hệ qua Zalo
                      </Button>
                      {!owner.phone && (
                        <p className="text-xs text-gray-500 mt-2">Người đăng chưa cập nhật số điện thoại.</p>
                      )}
                    </div>
                  )
                })()}
              </CardContent>
            </Card>

            <Card className="mt-3 sticky top-[18rem]">
              <CardHeader>
                <CardTitle>Ngân sách mong muốn</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-600">{formatCurrency(Number(currentPost.minBudget))} - {formatCurrency(Number(currentPost.maxBudget))} ₫/tháng</div>
                <div className="mt-2 text-sm text-gray-600 flex items-center gap-1"><MapPin className="h-4 w-4" />{formatAddress()}</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}



