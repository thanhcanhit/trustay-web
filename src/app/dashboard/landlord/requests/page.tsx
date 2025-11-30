"use client"

import { useEffect, useMemo, useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Search, Calendar, Phone, Mail, Clock, CheckCircle, MessageSquare, X, UserPlus, Home, DollarSign, XCircle, ExternalLink } from "lucide-react"
import { useBookingRequestStore } from "@/stores/bookingRequestStore"
import { useInvitationStore } from "@/stores/invitationStore"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { ClickableUserAvatar } from "@/components/profile/clickable-user-avatar"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"

const BOOKING_STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
  expired: 'bg-gray-100 text-gray-800',
  awaiting_confirmation: 'bg-yellow-100 text-yellow-800'
}

const BOOKING_STATUS_LABELS = {
  pending: 'Chờ xử lý',
  accepted: 'Đã chấp nhận',
  rejected: 'Đã từ chối',
  cancelled: 'Đã hủy',
  expired: 'Đã hết hạn',
  awaiting_confirmation: 'Chờ xác nhận'
}

const CONFIRMED_COLORS = {
  true: 'bg-green-100 text-green-800',
  false: 'bg-yellow-100 text-yellow-800'
}

const CONFIRMED_LABELS = {
  true: 'Đã xác nhận',
  false: 'Chờ xác nhận'
}

const INVITATION_STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-800',
  accepted: 'bg-emerald-100 text-emerald-800',
  declined: 'bg-red-100 text-red-800',
  expired: 'bg-gray-100 text-gray-800',
  withdrawn: 'bg-orange-100 text-orange-800',
}

const INVITATION_STATUS_LABELS = {
  pending: 'Đang chờ',
  accepted: 'Đã chấp nhận',
  declined: 'Từ chối',
  expired: 'Đã hết hạn',
  withdrawn: 'Đã rút lại',
}

export default function RequestsPage() {
  const [activeTab, setActiveTab] = useState('booking-requests')

  // Booking Requests states (yêu cầu thuê nhận được)
  const { received, receivedMeta, loadingReceived, errorReceived, submitting, loadReceived, ownerUpdate } = useBookingRequestStore()
  const [bookingSearchTerm, setBookingSearchTerm] = useState('')
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all')
  const [bookingPage, setBookingPage] = useState(1)

  // Invitations states (lời mời đã gửi)
  const {
    sent,
    sentMeta,
    loadingSent,
    errorSent,
    submitting: invitationSubmitting,
    loadSent,
    withdraw,
    confirm
  } = useInvitationStore()
  const [invitationSearchTerm, setInvitationSearchTerm] = useState('')
  const [invitationStatusFilter, setInvitationStatusFilter] = useState('all')
  const [invitationPage, setInvitationPage] = useState(1)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  // Load data
  useEffect(() => {
    loadReceived({ page: bookingPage, limit: 12, status: bookingStatusFilter === 'all' ? undefined : bookingStatusFilter })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingPage, bookingStatusFilter])

  useEffect(() => {
    loadSent({ page: invitationPage, limit: 12, status: invitationStatusFilter === 'all' ? undefined : invitationStatusFilter })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invitationPage, invitationStatusFilter])

  // Booking Requests
  const canBookingPrev = useMemo(() => receivedMeta?.hasPrev, [receivedMeta])
  const canBookingNext = useMemo(() => receivedMeta?.hasNext, [receivedMeta])

  const filteredBookingRequests = useMemo(() => {
    const term = bookingSearchTerm.trim().toLowerCase()
    if (!term) return received
    return received.filter(r => {
      const name = `${r.tenant?.firstName || ''} ${r.tenant?.lastName || ''}`.toLowerCase()
      const phone = r.tenant?.phone?.toLowerCase() || ''
      const email = r.tenant?.email?.toLowerCase() || ''
      return name.includes(term) || phone.includes(term) || email.includes(term)
    })
  }, [received, bookingSearchTerm])

  const handleApprove = async (id: string) => {
    const success = await ownerUpdate(id, { status: 'accepted' })
    if (success) {
      toast.success(
        'Đã chấp nhận yêu cầu!\n\nĐang chờ tenant xác nhận để tạo hợp đồng thuê.',
        { duration: 3000 }
      )
      loadReceived({ page: bookingPage, limit: 12, status: bookingStatusFilter === 'all' ? undefined : bookingStatusFilter })
    }
  }

  const handleReject = async (id: string) => {
    const success = await ownerUpdate(id, { status: 'rejected' })
    if (success) {
      toast.success('Đã từ chối yêu cầu')
      loadReceived({ page: bookingPage, limit: 12, status: bookingStatusFilter === 'all' ? undefined : bookingStatusFilter })
    }
  }

  // Invitations
  const canInvitationPrev = useMemo(() => sentMeta && sentMeta.page > 1, [sentMeta])
  const canInvitationNext = useMemo(() => sentMeta && sentMeta.page < sentMeta.totalPages, [sentMeta])

  const filteredInvitations = useMemo(() => {
    const term = invitationSearchTerm.trim().toLowerCase()
    if (!term) return sent
    return sent.filter(inv => {
      const name = `${inv.recipient?.firstName || ''} ${inv.recipient?.lastName || ''}`.toLowerCase()
      const phone = inv.recipient?.phone?.toLowerCase() || ''
      const email = inv.recipient?.email?.toLowerCase() || ''
      const roomName = inv.room?.name?.toLowerCase() || ''
      return name.includes(term) || phone.includes(term) || email.includes(term) || roomName.includes(term)
    })
  }, [sent, invitationSearchTerm])

  const handleWithdraw = async (id: string) => {
    const success = await withdraw(id)
    if (success) {
      toast.success('Đã rút lại lời mời')
      loadSent({ page: invitationPage, limit: 12, status: invitationStatusFilter === 'all' ? undefined : invitationStatusFilter })
    } else {
      toast.error('Không thể rút lại lời mời')
    }
  }

  const handleConfirm = async (id: string) => {
    const result = await confirm(id)
    if (result) {
      toast.success('Đã xác nhận lời mời. Hợp đồng thuê đã được tạo!')
      setConfirmingId(null)
      loadSent({ page: invitationPage, limit: 12, status: invitationStatusFilter === 'all' ? undefined : invitationStatusFilter })
    } else {
      toast.error('Không thể xác nhận lời mời')
    }
  }

  return (
    <DashboardLayout userType="landlord">
      <div className="px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý yêu cầu thuê</h1>
          <p className="text-gray-600">Xem và xử lý các yêu cầu thuê trọ và lời mời thuê</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 w-full grid grid-cols-2">
            <TabsTrigger value="booking-requests">
              <Calendar className="h-4 w-4 mr-2" />
              Yêu cầu nhận được
            </TabsTrigger>
            <TabsTrigger value="invitations">
              <UserPlus className="h-4 w-4 mr-2" />
              Lời mời đã gửi
            </TabsTrigger>
          </TabsList>

          {/* Booking Requests Tab */}
          <TabsContent value="booking-requests">
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm theo tên, điện thoại, email"
                  value={bookingSearchTerm}
                  onChange={(event) => setBookingSearchTerm(event.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={bookingStatusFilter} onValueChange={(v) => { setBookingStatusFilter(v); setBookingPage(1) }}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="pending">Chờ xử lý</SelectItem>
                  <SelectItem value="accepted">Đã chấp nhận</SelectItem>
                  <SelectItem value="awaiting_confirmation">Chờ xác nhận</SelectItem>
                  <SelectItem value="rejected">Đã từ chối</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={() => loadReceived({ page: bookingPage, limit: 12, status: bookingStatusFilter === 'all' ? undefined : bookingStatusFilter })}>
                Làm mới
              </Button>
            </div>

            {errorReceived && (
              <div className="bg-red-50 text-red-700 border border-red-200 rounded p-3 mb-4 text-sm">{errorReceived}</div>
            )}

            {loadingReceived ? (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">Đang tải...</CardContent>
              </Card>
            ) : filteredBookingRequests.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Calendar />
                  </EmptyMedia>
                  <EmptyTitle>
                    {bookingSearchTerm || bookingStatusFilter !== 'all'
                      ? 'Không tìm thấy yêu cầu'
                      : 'Chưa có yêu cầu thuê trọ'
                    }
                  </EmptyTitle>
                  <EmptyDescription>
                    {bookingSearchTerm || bookingStatusFilter !== 'all'
                      ? 'Không có yêu cầu nào phù hợp với bộ lọc hiện tại. Hãy thử tìm kiếm hoặc lọc với điều kiện khác.'
                      : 'Bạn chưa nhận được yêu cầu thuê trọ nào. Yêu cầu sẽ xuất hiện khi khách thuê gửi yêu cầu cho phòng của bạn.'}
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredBookingRequests.map((request) => (
                  <Card key={request.id} className="hover:shadow-lg transition-shadow">
                    <div className="p-6">
                      {/* Room Info - Highlighted */}
                      <div className="mb-4 pb-4 border-b-2 border-blue-100">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-3 flex-1">
                            <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                              <Home className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-bold text-blue-900 line-clamp-1">
                                {request.room?.name || 'Phòng không xác định'}
                              </h3>
                              {request.room?.building?.name && (
                                <p className="text-sm text-gray-600 line-clamp-1">{request.room.building.name}</p>
                              )}
                            </div>
                          </div>
                          <Badge className={BOOKING_STATUS_COLORS[request.status as keyof typeof BOOKING_STATUS_COLORS]}>
                            {BOOKING_STATUS_LABELS[request.status as keyof typeof BOOKING_STATUS_LABELS]}
                          </Badge>
                        </div>
                        {request.room?.slug && (
                          <a
                            href={`/rooms/${request.room.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline mt-1 ml-[60px]"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Xem chi tiết phòng
                          </a>
                        )}
                      </div>

                      {/* Tenant Info */}
                      <div className="mb-4">
                        <div className="flex items-center space-x-3 mb-3">
                          <ClickableUserAvatar
                            userId={request.tenant?.id || ''}
                            avatarUrl={request.tenant?.avatarUrl}
                            userName={`${request.tenant?.firstName || ''} ${request.tenant?.lastName || ''}`}
                            size="md"
                          />
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {request.tenant?.firstName} {request.tenant?.lastName}
                            </h4>
                            <p className="text-xs text-gray-500">Người thuê</p>
                          </div>
                        </div>
                        <div className="space-y-1 text-sm ml-[60px]">
                          {request.tenant?.phone && (
                            <div className="flex items-center text-gray-600">
                              <Phone className="h-4 w-4 mr-2 text-gray-400" />
                              <span>{request.tenant.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center text-gray-600">
                            <Mail className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="truncate">{request.tenant?.email || '-'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">

                        <div className="flex items-center space-x-2 text-sm">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">Ngày vào: {format(new Date(request.moveInDate), 'dd/MM/yyyy', { locale: vi })}</span>
                        </div>

                        <div className="flex items-center space-x-2 text-sm">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-500">Gửi: {format(new Date(request.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}</span>
                        </div>

                        {request.messageToOwner && (
                          <div className="text-sm">
                            <p className="text-gray-600 font-medium mb-1 flex items-center">
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Tin nhắn:
                            </p>
                            <p className="text-gray-700 bg-gray-50 p-2 rounded text-xs whitespace-pre-wrap">
                              {request.messageToOwner}
                            </p>
                          </div>
                        )}

                        {request.status === 'accepted' && (
                          <div className="pt-2 border-t">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-600">Xác nhận tenant:</span>
                              <Badge className={CONFIRMED_COLORS[String(request.isConfirmedByTenant) as keyof typeof CONFIRMED_COLORS]}>
                                {CONFIRMED_LABELS[String(request.isConfirmedByTenant) as keyof typeof CONFIRMED_LABELS]}
                              </Badge>
                            </div>
                            {request.isConfirmedByTenant && request.confirmedAt && (
                              <p className="text-xs text-gray-500 mt-1">
                                Xác nhận lúc: {format(new Date(request.confirmedAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-4 border-t">
                        {request.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1 bg-green-600 hover:bg-green-700"
                              onClick={() => handleApprove(request.id)}
                              disabled={submitting}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Chấp nhận
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
                              onClick={() => handleReject(request.id)}
                              disabled={submitting}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Từ chối
                            </Button>
                          </div>
                        )}
                        {request.status === 'accepted' && !request.isConfirmedByTenant && (
                          <div className="text-center">
                            <div className="inline-flex items-center text-yellow-700 text-sm font-medium">
                              <Clock className="h-4 w-4 mr-1" />
                              Đang chờ tenant xác nhận
                            </div>
                          </div>
                        )}
                        {request.status === 'accepted' && request.isConfirmedByTenant && (
                          <div className="text-center">
                            <div className="inline-flex items-center text-green-700 text-sm font-medium">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Hoàn tất - Yêu cầu đã được xác nhận
                            </div>
                          </div>
                        )}
                        {request.status === 'rejected' && (
                          <div className="text-center">
                            <div className="inline-flex items-center text-red-600 text-sm font-medium">
                              <XCircle className="h-4 w-4 mr-1" />
                              Đã từ chối
                            </div>
                          </div>
                        )}
                        {request.status === 'cancelled' && (
                          <div className="text-center">
                            <div className="inline-flex items-center text-gray-600 text-sm font-medium">
                              <XCircle className="h-4 w-4 mr-1" />
                              Đã hủy
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-600">Trang {receivedMeta?.page || 1}/{receivedMeta?.totalPages || 1}</div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setBookingPage((p) => Math.max(1, p - 1))} disabled={!canBookingPrev}>Trước</Button>
                <Button variant="outline" size="sm" onClick={() => setBookingPage((p) => p + 1)} disabled={!canBookingNext}>Sau</Button>
              </div>
            </div>
          </TabsContent>

          {/* Invitations Tab */}
          <TabsContent value="invitations">
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm theo tên, phòng, điện thoại"
                  value={invitationSearchTerm}
                  onChange={(event) => setInvitationSearchTerm(event.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={invitationStatusFilter} onValueChange={(v) => { setInvitationStatusFilter(v); setInvitationPage(1) }}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="pending">Đang chờ</SelectItem>
                  <SelectItem value="accepted">Đã chấp nhận</SelectItem>
                  <SelectItem value="declined">Từ chối</SelectItem>
                  <SelectItem value="expired">Đã hết hạn</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => loadSent({ page: invitationPage, limit: 12, status: invitationStatusFilter === 'all' ? undefined : invitationStatusFilter })}
              >
                Làm mới
              </Button>
            </div>

            {errorSent && (
              <div className="bg-red-50 text-red-700 border border-red-200 rounded p-3 mb-4 text-sm">{errorSent}</div>
            )}

            {loadingSent ? (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">Đang tải...</CardContent>
              </Card>
            ) : filteredInvitations.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <UserPlus />
                  </EmptyMedia>
                  <EmptyTitle>
                    {invitationSearchTerm || invitationStatusFilter !== 'all'
                      ? 'Không tìm thấy lời mời'
                      : 'Chưa có lời mời thuê'
                    }
                  </EmptyTitle>
                  <EmptyDescription>
                    {invitationSearchTerm || invitationStatusFilter !== 'all'
                      ? 'Không có lời mời nào phù hợp với bộ lọc hiện tại.'
                      : 'Bạn chưa gửi lời mời thuê nào.'}
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredInvitations.map(invitation => (
                  <Card key={invitation.id} className="hover:shadow-lg transition-shadow">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <Home className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold line-clamp-1">
                              {invitation.room?.name || 'Phòng không xác định'}
                            </h3>
                            {invitation.room?.building?.name && (
                              <p className="text-xs text-gray-500">{invitation.room.building.name}</p>
                            )}
                          </div>
                        </div>
                        <Badge className={INVITATION_STATUS_COLORS[invitation.status as keyof typeof INVITATION_STATUS_COLORS]}>
                          {INVITATION_STATUS_LABELS[invitation.status as keyof typeof INVITATION_STATUS_LABELS]}
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-start space-x-3 text-sm">
                          <ClickableUserAvatar
                            userId={invitation.recipient?.id || ''}
                            avatarUrl={invitation.recipient?.avatarUrl}
                            userName={`${invitation.recipient?.firstName} ${invitation.recipient?.lastName}`}
                            size="md"
                          />
                          <div>
                            <div className="text-gray-900 font-medium">{invitation.recipient?.firstName} {invitation.recipient?.lastName}</div>
                            <div className="text-xs text-gray-600">{invitation.recipient?.email}</div>
                            <div className="text-xs text-gray-500">Người nhận</div>
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
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-red-600 hover:text-red-700 border-red-300 hover:bg-red-50"
                            onClick={() => handleWithdraw(invitation.id)}
                            disabled={invitationSubmitting}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Rút lại lời mời
                          </Button>
                        )}
                        {invitation.status === 'accepted' && !invitation.isConfirmedBySender && (
                          <Button
                            size="sm"
                            className="w-full"
                            onClick={() => setConfirmingId(invitation.id)}
                            disabled={invitationSubmitting}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Xác nhận tạo hợp đồng
                          </Button>
                        )}
                        {invitation.status === 'accepted' && invitation.isConfirmedBySender && (
                          <div className="text-center">
                            <div className="inline-flex items-center text-emerald-700 text-sm font-medium">
                              <CheckCircle className="h-4 w-4 mr-1" /> Đã xác nhận - Rental đã tạo
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
                    </div>
                  </Card>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-600">
                Trang {sentMeta?.page || 1}/{sentMeta?.totalPages || 1}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInvitationPage((p) => Math.max(1, p - 1))}
                  disabled={!canInvitationPrev}
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInvitationPage((p) => p + 1)}
                  disabled={!canInvitationNext}
                >
                  Sau
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Confirm Dialog for Invitation */}
        <Dialog open={!!confirmingId} onOpenChange={(open) => !open && setConfirmingId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xác nhận tạo hợp đồng thuê</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn xác nhận lời mời này?
                Sau khi xác nhận, hợp đồng thuê (Rental) sẽ được tạo tự động trong hệ thống.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setConfirmingId(null)}
                disabled={invitationSubmitting}
              >
                Hủy
              </Button>
              <Button
                variant="default"
                onClick={() => confirmingId && handleConfirm(confirmingId)}
                disabled={invitationSubmitting}
              >
                Xác nhận
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
