"use client"

import { useEffect, useMemo, useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Calendar, Home, Phone, Mail, Clock, UserPlus, DollarSign } from "lucide-react"
import { useInvitationStore } from "@/stores/invitationStore"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-green-100 text-green-800',
  declined: 'bg-red-100 text-red-800',
  expired: 'bg-gray-100 text-gray-800'
}

const STATUS_LABELS = {
  pending: 'Chờ phản hồi',
  accepted: 'Đã chấp nhận',
  declined: 'Đã từ chối',
  expired: 'Đã hết hạn'
}

export default function BookingRequestsPage() {
  const { sent, sentMeta, loadingSent, errorSent, loadSent, withdraw } = useInvitationStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)

  useEffect(() => {
    loadSent({ page, limit: 12, status: statusFilter === 'all' ? undefined : statusFilter })
  }, [loadSent, page, statusFilter])

  const canPrev = useMemo(() => sentMeta?.hasPrev, [sentMeta])
  const canNext = useMemo(() => sentMeta?.hasNext, [sentMeta])

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return sent
    return sent.filter(invitation => {
      const name = `${invitation.recipient?.firstName || ''} ${invitation.recipient?.lastName || ''}`.toLowerCase()
      const phone = invitation.recipient?.phone?.toLowerCase() || ''
      const email = invitation.recipient?.email?.toLowerCase() || ''
      return name.includes(term) || phone.includes(term) || email.includes(term)
    })
  }, [sent, searchTerm])

  const handleWithdraw = async (id: string) => {
    await withdraw(id)
    loadSent({ page, limit: 12, status: statusFilter === 'all' ? undefined : statusFilter })
  }

  return (
    <DashboardLayout userType="landlord">
      <div className="px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Lời mời thuê</h1>
          <p className="text-gray-600">Quản lý các lời mời thuê trọ đã gửi cho khách thuê</p>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm theo tên, điện thoại, email"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="pending">Chờ phản hồi</SelectItem>
              <SelectItem value="accepted">Đã chấp nhận</SelectItem>
              <SelectItem value="declined">Đã từ chối</SelectItem>
              <SelectItem value="expired">Đã hết hạn</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={() => loadSent({ page, limit: 12, status: statusFilter === 'all' ? undefined : statusFilter })}>Làm mới</Button>
        </div>

        {errorSent && (
          <div className="bg-red-50 text-red-700 border border-red-200 rounded p-3 mb-4 text-sm">{errorSent}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {loadingSent && Array.from({ length: 6 }).map((_, idx) => (
            <Card key={idx}><CardContent className="p-6 text-gray-500">Đang tải...</CardContent></Card>
          ))}

          {!loadingSent && filtered.map((invitation) => (
            <Card key={invitation.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={invitation.recipient?.avatarUrl || ''} alt={`${invitation.recipient?.firstName || ''} ${invitation.recipient?.lastName || ''}`} />
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {`${(invitation.recipient?.firstName || 'U')[0]}${(invitation.recipient?.lastName || 'S')[0]}`}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{invitation.recipient?.firstName} {invitation.recipient?.lastName}</CardTitle>
                      <Badge className={STATUS_COLORS[invitation.status as keyof typeof STATUS_COLORS]}>
                        {STATUS_LABELS[invitation.status as keyof typeof STATUS_LABELS]}
                      </Badge>
                    </div>
                  </div>
                  <UserPlus className="h-5 w-5 text-gray-400" />
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-3">
                  {invitation.recipient?.phone && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{invitation.recipient.phone}</span>
                    </div>
                  )}

                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{invitation.recipient?.email || '-'}</span>
                  </div>

                  <div className="flex items-center space-x-2 text-sm">
                    <Home className="h-4 w-4 text-gray-400" />
                    <div className="text-gray-600">
                      <div className="font-medium">{invitation.room?.name}</div>
                      <div className="text-xs text-gray-500">{invitation.room?.building?.name}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-sm">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">
                      {parseInt(invitation.monthlyRent || '0').toLocaleString('vi-VN')}đ/tháng
                      {invitation.rentalMonths && ` • ${invitation.rentalMonths} tháng`}
                    </span>
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

                  {invitation.depositAmount && parseInt(invitation.depositAmount) > 0 && (
                    <div className="flex items-center space-x-2 text-sm">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Cọc: {parseInt(invitation.depositAmount).toLocaleString('vi-VN')}đ</span>
                    </div>
                  )}
                </div>

                {invitation.status === 'pending' && (
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-red-600 border-red-300 hover:bg-red-50"
                      onClick={() => handleWithdraw(invitation.id)}
                    >
                      Thu hồi lời mời
                    </Button>
                  </div>
                )}

                {invitation.status === 'accepted' && (
                  <div className="mt-4 text-center">
                    <div className="text-sm text-green-600 font-medium">✅ Đã được chấp nhận</div>
                  </div>
                )}

                {invitation.status === 'declined' && (
                  <div className="mt-4 text-center">
                    <div className="text-sm text-red-600 font-medium">❌ Đã bị từ chối</div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {!loadingSent && filtered.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">Chưa gửi lời mời thuê nào</div>
          </div>
        )}

        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-600">Trang {sentMeta?.page || 1}/{sentMeta?.totalPages || 1}</div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={!canPrev}>Trước</Button>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={!canNext}>Sau</Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}