"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Send, XCircle, Clock, CheckCircle2, Home, Calendar, Square, AlertCircle, Loader2, FileText, User, UserPlus, DollarSign } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { useBookingRequestStore } from "@/stores/bookingRequestStore"
import { useInvitationStore } from "@/stores/invitationStore"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import { ClickableUserAvatar } from "@/components/profile/clickable-user-avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

function BookingStatusBadge({ status }: { status: 'pending' | 'awaiting_confirmation' | 'rejected' | 'cancelled' | 'accepted' | 'expired' }) {
  const map = {
    pending: { label: 'Đang chờ', className: 'bg-amber-100 text-amber-800' },
    accepted: { label: 'Đã chấp nhận', className: 'bg-blue-100 text-blue-800' },
    rejected: { label: 'Từ chối', className: 'bg-red-100 text-red-800' },
    cancelled: { label: 'Đã hủy', className: 'bg-gray-100 text-gray-800' },
    expired: { label: 'Đã hết hạn', className: 'bg-gray-100 text-gray-800' },
    awaiting_confirmation: { label: 'Chờ xác nhận', className: 'bg-yellow-100 text-yellow-800' },
  } as const
  const it = map[status]
  return <Badge className={it.className}>{it.label}</Badge>
}

function InvitationStatusBadge({ status }: { status: 'pending' | 'accepted' | 'declined' | 'expired' | 'withdrawn' }) {
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

function RequestsContent() {
  const { mine, mineMeta, loadingMine, errorMine, loadMine, cancelMine, confirm, submitting } = useBookingRequestStore()
  const [status, setStatus] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    loadMine({ page, limit: 10, status: status === 'all' ? undefined : status })
  }, [loadMine, page, status])

  const canPrev = useMemo(() => mineMeta?.hasPrev, [mineMeta])
  const canNext = useMemo(() => mineMeta?.hasNext, [mineMeta])

  const handleConfirm = async (id: string) => {
    const success = await confirm(id, { tenantNotes: notes })
    if (success) {
      toast.success(
        '✅ Xác nhận thành công!\n\nHợp đồng thuê đã được tạo tự động.\nBạn có thể xem trong mục "Hợp đồng thuê".',
        { duration: 4000 }
      )
      setNotes('')
      setConfirmingId(null)
      loadMine({ page, limit: 10, status: status === 'all' ? undefined : status })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Send className="h-5 w-5" />
          <span>Yêu cầu thuê của tôi</span>
        </CardTitle>
        <CardDescription>Quản lý các yêu cầu thuê trọ đã gửi</CardDescription>
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
                <SelectItem value="approved">Đã duyệt</SelectItem>
                <SelectItem value="rejected">Từ chối</SelectItem>
                <SelectItem value="cancelled">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => loadMine({ page, limit: 10, status: status === 'all' ? undefined : status })}>
              Làm mới
            </Button>
          </div>
        </div>

        {errorMine && (
          <div className="bg-red-50 text-red-700 border border-red-200 rounded p-3 mb-3 text-sm">{errorMine}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {loadingMine && Array.from({ length: 6 }).map((_, idx) => (
            <Card key={idx}><CardContent className="p-6 text-gray-500">Đang tải...</CardContent></Card>
          ))}

          {!loadingMine && mine.map((req) => (
            <Card key={req.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                      <Home className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {req.room?.name || 'Phòng không xác định'}
                      </CardTitle>
                      {req.room?.building?.name && (
                        <p className="text-xs text-gray-500">{req.room.building.name}</p>
                      )}
                      <BookingStatusBadge status={req.status} />
                    </div>
                  </div>
                  <Send className="h-5 w-5 text-gray-400" />
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-3">
                  {req.owner && (
                    <div className="flex items-start space-x-3 text-sm border-b">
                      <ClickableUserAvatar
                        userId={req.owner.id || ''}
                        avatarUrl={req.owner.avatarUrl}
                        userName={`${req.owner.firstName} ${req.owner.lastName}`}
                        size="md"
                      />
                      <div>
                        <div className="text-gray-900 font-medium">{req.owner.firstName} {req.owner.lastName}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <User className="h-3 w-3" />
                          Chủ nhà
                        </div>
                      </div>
                    </div>
                  )}

                  {req.room && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Square className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">
                        Diện tích: {Number(req.room.areaSqm)}m² • Tối đa {req.room.maxOccupancy} người
                      </span>
                    </div>
                  )}

                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Ngày vào: {format(new Date(req.moveInDate), 'dd/MM/yyyy', { locale: vi })}</span>
                  </div>

                  {req.moveOutDate && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Ngày rời: {format(new Date(req.moveOutDate), 'dd/MM/yyyy', { locale: vi })}</span>
                    </div>
                  )}

                  <div className="flex items-center space-x-2 text-sm">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-500">Gửi lúc: {format(new Date(req.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}</span>
                  </div>

                  {req.messageToOwner && (
                    <div className="text-sm">
                      <p className="text-gray-600 font-medium mb-1">Tin nhắn gửi chủ nhà:</p>
                      <p className="text-gray-700 bg-gray-50 p-2 rounded text-xs whitespace-pre-wrap">
                        {req.messageToOwner}
                      </p>
                    </div>
                  )}

                  {req.ownerNotes && (
                    <div className="text-sm">
                      <p className="text-gray-600 font-medium mb-1">Ghi chú từ chủ nhà:</p>
                      <p className="text-gray-700 bg-blue-50 p-2 rounded text-xs whitespace-pre-wrap">
                        {req.ownerNotes}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  {req.status === 'pending' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-red-600 border-red-300 hover:bg-red-50"
                      onClick={() => cancelMine(req.id, { cancellationReason: 'Người thuê huỷ' })}
                      disabled={submitting}
                    >
                      <XCircle className="h-4 w-4 mr-1" /> Hủy yêu cầu
                    </Button>
                  )}

                  {(req.status === 'awaiting_confirmation' || req.status === 'accepted') && !req.isConfirmedByTenant && (
                    <div className="space-y-3">
                      <Alert className="bg-blue-50 border-blue-200">
                        <AlertCircle className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-800">
                          <strong>Chủ nhà đã chấp nhận yêu cầu của bạn!</strong>
                          <br />
                          <span className="text-sm">Hãy xác nhận để được thêm vào phòng trọ.</span>
                        </AlertDescription>
                      </Alert>

                      {confirmingId === req.id && (
                        <Textarea
                          placeholder="Ghi chú cho chủ nhà (tùy chọn)"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className="h-20 text-sm"
                        />
                      )}

                      <Button
                        className="w-full bg-green-600 hover:bg-green-700"
                        size="sm"
                        onClick={() => {
                          if (confirmingId === req.id) {
                            handleConfirm(req.id)
                          } else {
                            setConfirmingId(req.id)
                          }
                        }}
                        disabled={submitting}
                      >
                        {confirmingId === req.id ? (
                          submitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Đang xử lý...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Xác nhận yêu cầu
                            </>
                          )
                        ) : (
                          <>
                            <FileText className="mr-2 h-4 w-4" />
                            Xem chi tiết và xác nhận
                          </>
                        )}
                      </Button>

                      {confirmingId === req.id && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            setConfirmingId(null)
                            setNotes('')
                          }}
                        >
                          Hủy
                        </Button>
                      )}
                    </div>
                  )}

                  {(req.status === 'awaiting_confirmation' || req.status === 'accepted') && req.isConfirmedByTenant && (
                    <Alert className="bg-green-50 border-green-200">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        <strong>Đã xác nhận!</strong>
                        <span className="text-sm">
                          Xác nhận lúc: {req.confirmedAt && format(new Date(req.confirmedAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                        </span>
                        <span className="text-sm">Yêu cầu đã được xác nhận.</span>
                      </AlertDescription>
                    </Alert>
                  )}

                  {req.status === 'rejected' && (
                    <div className="text-center">
                      <div className="inline-flex items-center text-red-600 text-sm font-medium">
                        <XCircle className="h-4 w-4 mr-1" /> Đã bị từ chối
                      </div>
                    </div>
                  )}

                  {req.status === 'cancelled' && (
                    <div className="text-center">
                      <div className="inline-flex items-center text-gray-600 text-sm font-medium">
                        <Clock className="h-4 w-4 mr-1" /> Đã hủy
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {!loadingMine && mine.length === 0 && (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Send />
              </EmptyMedia>
              <EmptyTitle>Chưa có yêu cầu thuê</EmptyTitle>
              <EmptyDescription>
                Bạn chưa gửi yêu cầu thuê nào. Hãy tìm phòng trọ phù hợp và gửi yêu cầu thuê để bắt đầu.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-600">Trang {mineMeta?.page || 1}/{mineMeta?.totalPages || 1}</div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={!canPrev}>Trước</Button>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={!canNext}>Sau</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function InvitationsContent() {
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
                        {invitation.room?.name || 'Phòng không xác định'}
                      </CardTitle>
                      {invitation.room?.building?.name && (
                        <p className="text-xs text-gray-500">{invitation.room.building.name}</p>
                      )}
                      <InvitationStatusBadge status={invitation.status} />
                    </div>
                  </div>
                  <UserPlus className="h-5 w-5 text-gray-400" />
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-3">
                  {invitation.sender && (
                    <div className="flex items-start space-x-3 text-sm pb-2 border-b">
                      <ClickableUserAvatar
                        userId={invitation.sender.id || ''}
                        avatarUrl={invitation.sender.avatarUrl}
                        userName={`${invitation.sender.firstName} ${invitation.sender.lastName}`}
                        size="md"
                      />
                      <div>
                        <div className="text-gray-900 font-medium">{invitation.sender.firstName} {invitation.sender.lastName}</div>
                        <div className="text-xs text-gray-600">{invitation.sender.email}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <User className="h-3 w-3" />
                          Chủ nhà
                        </div>
                      </div>
                    </div>
                  )}

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
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <UserPlus />
              </EmptyMedia>
              <EmptyTitle>Chưa có lời mời nào</EmptyTitle>
              <EmptyDescription>
                Bạn chưa nhận được lời mời thuê nào từ chủ nhà.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
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

function RequestsPageContent() {
  const [activeTab, setActiveTab] = useState('sent')

  return (
    <DashboardLayout userType="tenant">
      <div className="px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Yêu cầu thuê</h1>
          <p className="text-gray-600">Quản lý các yêu cầu thuê và lời mời thuê</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 w-full grid grid-cols-2">
            <TabsTrigger value="sent">
              <Send className="h-4 w-4" />
              Đã gửi
            </TabsTrigger>
            <TabsTrigger value="received">
              <UserPlus className="h-4 w-4" />
              Đã nhận
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sent">
            <RequestsContent />
          </TabsContent>

          <TabsContent value="received">
            <InvitationsContent />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

export default function RequestsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Đang tải...</p>
        </div>
      </div>
    }>
      <RequestsPageContent />
    </Suspense>
  )
}