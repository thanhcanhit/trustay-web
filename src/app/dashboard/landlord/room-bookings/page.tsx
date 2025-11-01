"use client"

import { useEffect, useMemo, useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, MessageSquare } from "lucide-react"
import { useInvitationStore } from "@/stores/invitationStore"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ClickableUserAvatar } from "@/components/profile/clickable-user-avatar"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { toast } from "sonner"

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
      if (!invitation.recipient) return false
      const name = `${invitation.recipient.firstName || ''} ${invitation.recipient.lastName || ''}`.toLowerCase()
      const phone = invitation.recipient.phone?.toLowerCase() || ''
      const email = invitation.recipient.email?.toLowerCase() || ''
      return name.includes(term) || phone.includes(term) || email.includes(term)
    })
  }, [sent, searchTerm])

  const handleWithdraw = async (id: string) => {
    await withdraw(id)
    loadSent({ page, limit: 12, status: statusFilter === 'all' ? undefined : statusFilter })
  }

  const handleConfirm = async (id: string) => {
    const result = await useInvitationStore.getState().confirm(id)
    if (result?.rentalId) {
      toast.success('Đã tạo hợp đồng thuê thành công!', {
        description: `Mã hợp đồng: ${result.rentalId}`,
        duration: 5000,
      })
      loadSent({ page, limit: 12, status: statusFilter === 'all' ? undefined : statusFilter })
    } else {
      const error = useInvitationStore.getState().submitError
      toast.error('Không thể xác nhận lời mời', {
        description: error || 'Vui lòng thử lại sau',
      })
    }
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

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Người nhận</TableHead>
                  <TableHead className="w-[180px]">Liên hệ</TableHead>
                  <TableHead className="w-[220px]">Phòng</TableHead>
                  <TableHead className="w-[120px] text-right">Tiền thuê</TableHead>
                  <TableHead className="w-[120px] text-right">Tiền cọc</TableHead>
                  <TableHead className="w-[100px]">Ngày vào</TableHead>
                  <TableHead className="w-[120px]">Trạng thái</TableHead>
                  <TableHead className="w-[120px]">Ngày gửi</TableHead>
                  <TableHead className="w-[100px] text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingSent && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      Đang tải...
                    </TableCell>
                  </TableRow>
                )}

                {!loadingSent && filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="p-0">
                      <Empty>
                        <EmptyHeader>
                          <EmptyMedia variant="icon">
                            <MessageSquare />
                          </EmptyMedia>
                          <EmptyTitle>
                            {searchTerm || statusFilter !== 'all'
                              ? 'Không tìm thấy lời mời'
                              : 'Chưa gửi lời mời thuê'
                            }
                          </EmptyTitle>
                          <EmptyDescription>
                            {searchTerm || statusFilter !== 'all'
                              ? 'Không có lời mời nào phù hợp với bộ lọc hiện tại. Hãy thử tìm kiếm hoặc lọc với điều kiện khác.'
                              : 'Bạn chưa gửi lời mời thuê nào. Gửi lời mời cho khách thuê để mời họ thuê phòng của bạn.'}
                          </EmptyDescription>
                        </EmptyHeader>
                      </Empty>
                    </TableCell>
                  </TableRow>
                )}

                {!loadingSent && filtered.map((invitation) => (
                  <TableRow key={invitation.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <ClickableUserAvatar
                          userId={invitation.recipient?.id || ''}
                          avatarUrl={invitation.recipient?.avatarUrl}
                          userName={`${invitation.recipient?.firstName || ''} ${invitation.recipient?.lastName || ''}`}
                          size="md"
                        />
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {invitation.recipient?.firstName} {invitation.recipient?.lastName}
                          </div>
                          {invitation.message && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center text-xs text-blue-600 cursor-help mt-0.5">
                                    <MessageSquare className="h-3 w-3 mr-1" />
                                    <span>Có tin nhắn</span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  <p className="text-sm whitespace-pre-wrap">{invitation.message}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1 text-sm">
                        {invitation.recipient?.phone && (
                          <div className="text-gray-600 truncate">{invitation.recipient.phone}</div>
                        )}
                        <div className="text-gray-500 truncate text-xs">{invitation.recipient?.email || '-'}</div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 truncate">{invitation.room?.name}</div>
                        <div className="text-xs text-gray-500 truncate">{invitation.room?.building?.name}</div>
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {parseInt(invitation.monthlyRent || '0').toLocaleString('vi-VN')}đ
                        </div>
                        {invitation.rentalMonths && (
                          <div className="text-xs text-gray-500">{invitation.rentalMonths} tháng</div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {invitation.depositAmount && parseInt(invitation.depositAmount) > 0
                          ? `${parseInt(invitation.depositAmount).toLocaleString('vi-VN')}đ`
                          : '-'
                        }
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-sm text-gray-600">
                        {invitation.moveInDate ? format(new Date(invitation.moveInDate), 'dd/MM/yyyy', { locale: vi }) : '-'}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <Badge className={STATUS_COLORS[invitation.status as keyof typeof STATUS_COLORS]}>
                          {STATUS_LABELS[invitation.status as keyof typeof STATUS_LABELS]}
                        </Badge>
                        {invitation.status === 'accepted' && invitation.isConfirmedBySender && (
                          <div className="text-xs text-green-600 font-medium">✓ Đã xác nhận</div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-sm text-gray-500">
                        {format(new Date(invitation.createdAt), 'dd/MM/yyyy', { locale: vi })}
                      </div>
                      <div className="text-xs text-gray-400">
                        {format(new Date(invitation.createdAt), 'HH:mm', { locale: vi })}
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {invitation.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-300 hover:bg-red-50"
                            onClick={() => handleWithdraw(invitation.id)}
                          >
                            Thu hồi
                          </Button>
                        )}
                        {invitation.status === 'accepted' && !invitation.isConfirmedBySender && (
                          <Button
                            variant="default"
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleConfirm(invitation.id)}
                          >
                            Xác nhận
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

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