"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserPlus, XCircle, Clock, CheckCircle2, Home, Calendar, DollarSign } from "lucide-react"
import { ProfileLayout } from "@/components/profile/profile-layout"
import { useInvitationStore } from "@/stores/invitationStore"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Textarea } from "@/components/ui/textarea"
import { ClickableUserAvatar } from "@/components/profile/clickable-user-avatar"

function StatusBadge({ status }: { status: 'pending' | 'accepted' | 'declined' | 'expired' | 'withdrawn' }) {
  const map = {
    pending: { label: 'Đang chờ', className: 'bg-amber-100 text-amber-800' },
    accepted: { label: 'Đã chấp nhận', className: 'bg-emerald-100 text-emerald-800' },
    declined: { label: 'Từ chối', className: 'bg-red-100 text-red-800' },
    expired: { label: 'Đã hết hạn', className: 'bg-gray-100 text-gray-800' },
    withdrawn: { label: 'Đã rút lại', className: 'bg-orange-100 text-orange-800' },
  } as const
  const it = map[status]
  return <Badge className={it.className}>{it.label}</Badge>
}

function RoomBookingsContent() {
  const { received, receivedMeta, loadingReceived, errorReceived, loadReceived, respond, submitting } = useInvitationStore()
  const [status, setStatus] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [respondingId, setRespondingId] = useState<string | null>(null)
  const [tenantNotes, setTenantNotes] = useState('')

  useEffect(() => {
    loadReceived({ page, limit: 10, status: status === 'all' ? undefined : status })
  }, [loadReceived, page, status])

  const canPrev = useMemo(() => receivedMeta?.hasPrev, [receivedMeta])
  const canNext = useMemo(() => receivedMeta?.hasNext, [receivedMeta])

  const handleRespond = async (id: string, response: 'accepted' | 'declined') => {
    const success = await respond(id, response, tenantNotes)
    if (success) {
      setRespondingId(null)
      setTenantNotes('')
      // Reload the list to reflect changes
      loadReceived({ page, limit: 10, status: status === 'all' ? undefined : status })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <UserPlus className="h-5 w-5" />
          <span>Lời mời thuê nhận được</span>
        </CardTitle>
        <CardDescription>Quản lý các lời mời thuê trọ từ chủ nhà</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1) }}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="pending">Đang chờ</SelectItem>
                <SelectItem value="accepted">Đã chấp nhận</SelectItem>
                <SelectItem value="declined">Từ chối</SelectItem>
                <SelectItem value="expired">Đã hết hạn</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => loadReceived({ page, limit: 10, status: status === 'all' ? undefined : status })}>
              Làm mới
            </Button>
          </div>
        </div>

        {errorReceived && (
          <div className="bg-red-50 text-red-700 border border-red-200 rounded p-3 mb-3 text-sm">{errorReceived}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {loadingReceived && Array.from({ length: 6 }).map((_, idx) => (
            <Card key={idx}><CardContent className="p-6 text-gray-500">Đang tải...</CardContent></Card>
          ))}

          {!loadingReceived && received.map(invitation => (
            <Card key={invitation.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <Home className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg line-clamp-1">
                        {invitation.room?.name}
                      </CardTitle>
                      <p className="text-xs text-gray-500">{invitation.room?.building?.name}</p>
                      <StatusBadge status={invitation.status} />
                    </div>
                  </div>
                  <UserPlus className="h-5 w-5 text-gray-400" />
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 text-sm">
                    <ClickableUserAvatar
                      userId={invitation.sender?.id || ''}
                      avatarUrl={invitation.sender?.avatarUrl}
                      userName={`${invitation.sender?.firstName} ${invitation.sender?.lastName}`}
                      size="md"
                    />
                    <div>
                      <div className="text-gray-900 font-medium">{invitation.sender?.firstName} {invitation.sender?.lastName}</div>
                      <div className="text-xs text-gray-600">{invitation.sender?.email}</div>
                      <div className="text-xs text-gray-500">Chủ nhà</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-sm">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="text-gray-900 font-medium">
                        {parseInt(invitation.monthlyRent ?? '0').toLocaleString('vi-VN')}đ/tháng
                      </div>
                      {invitation.rentalMonths && (
                        <div className="text-xs text-gray-600">{invitation.rentalMonths} tháng</div>
                      )}
                      {invitation.depositAmount && parseInt(invitation.depositAmount) > 0 && (
                        <div className="text-xs text-gray-600">Cọc: {parseInt(invitation.depositAmount).toLocaleString('vi-VN')}đ</div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Ngày vào: {invitation.moveInDate ? format(new Date(invitation.moveInDate), 'dd/MM/yyyy', { locale: vi }) : '-'}</span>
                  </div>

                  <div className="flex items-center space-x-2 text-sm">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-500">Gửi: {format(new Date(invitation.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}</span>
                  </div>

                  {invitation.message && (
                    <div className="text-sm">
                      <p className="text-gray-600 font-medium mb-1">Tin nhắn:</p>
                      <p className="text-gray-700 bg-gray-50 p-2 rounded text-xs whitespace-pre-wrap">
                        {invitation.message}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  {invitation.status === 'pending' && (
                    <div className="space-y-3">
                      {respondingId === invitation.id ? (
                        <div className="space-y-2">
                          <Textarea
                            placeholder="Ghi chú (tùy chọn)"
                            value={tenantNotes}
                            onChange={(e) => setTenantNotes(e.target.value)}
                            className="w-full h-20 text-xs"
                          />
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => {
                                setRespondingId(null)
                                setTenantNotes('')
                              }}
                              disabled={submitting}
                            >
                              Hủy
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 text-red-600 hover:text-red-700 border-red-300 hover:bg-red-50"
                              onClick={() => handleRespond(invitation.id, 'declined')}
                              disabled={submitting}
                            >
                              Từ chối
                            </Button>
                            <Button
                              size="sm"
                              className="flex-1"
                              onClick={() => handleRespond(invitation.id, 'accepted')}
                              disabled={submitting}
                            >
                              Chấp nhận
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => setRespondingId(invitation.id)}
                        >
                          Phản hồi
                        </Button>
                      )}
                    </div>
                  )}
                  {invitation.status === 'accepted' && (
                    <div className="text-center">
                      <div className="inline-flex items-center text-emerald-700 text-sm font-medium">
                        <CheckCircle2 className="h-4 w-4 mr-1" /> Đã chấp nhận
                      </div>
                    </div>
                  )}
                  {invitation.status === 'declined' && (
                    <div className="text-center">
                      <div className="inline-flex items-center text-red-600 text-sm font-medium">
                        <XCircle className="h-4 w-4 mr-1" /> Đã từ chối
                      </div>
                    </div>
                  )}
                  {invitation.status === 'expired' && (
                    <div className="text-center">
                      <div className="inline-flex items-center text-gray-600 text-sm font-medium">
                        <Clock className="h-4 w-4 mr-1" /> Đã hết hạn
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {!loadingReceived && received.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">Chưa có lời mời nào</div>
          </div>
        )}

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-600">Trang {receivedMeta?.page || 1}/{receivedMeta?.totalPages || 1}</div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={!canPrev}>Trước</Button>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={!canNext}>Sau</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function RoomBookingsPageContent() {
  return (
    <ProfileLayout>
      <div className="space-y-6">
        <RoomBookingsContent />
      </div>
    </ProfileLayout>
  )
}

export default function RoomBookingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Đang tải...</p>
        </div>
      </div>
    }>
      <RoomBookingsPageContent />
    </Suspense>
  )
}
